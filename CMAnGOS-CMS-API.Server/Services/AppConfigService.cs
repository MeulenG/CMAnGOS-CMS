using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using CMAnGOS_CMS_API.Server.Models.Dto;

namespace CMAnGOS_CMS_API.Server.Services
{
    public sealed class AppConfigService : IAppConfigService
    {
        private readonly SemaphoreSlim _lock = new(1, 1);
        private readonly string _configPath;
        private readonly ILogger<AppConfigService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;
        private StoredAppConfig? _cached;

        public AppConfigService(ILogger<AppConfigService> logger)
        {
            _logger = logger;
            var baseDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "CMAnGOS-CMS-API");
            _configPath = Path.Combine(baseDir, "app-config.json");
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true,
                WriteIndented = true
            };
        }

        public async Task<AppConfigDto> GetConfigAsync(CancellationToken cancellationToken = default)
        {
            var config = await LoadAsync(cancellationToken);
            return ToDto(config);
        }

        public async Task<AppConfigDto> UpdateConfigAsync(UpdateConfigRequest request, CancellationToken cancellationToken = default)
        {
            await _lock.WaitAsync(cancellationToken);
            try
            {
                var config = await LoadUnsafeAsync(cancellationToken);
                if (request.Settings != null)
                {
                    config.Settings.AutoUpdate = request.Settings.AutoUpdate;
                    config.Settings.LaunchOnStartup = request.Settings.LaunchOnStartup;
                    config.Settings.MinimizeToTray = request.Settings.MinimizeToTray;
                    config.Settings.CheckUpdatesOnStartup = request.Settings.CheckUpdatesOnStartup;
                }

                if (request.OnboardingCompleted.HasValue)
                {
                    config.OnboardingCompleted = request.OnboardingCompleted.Value;
                }

                await SaveUnsafeAsync(config, cancellationToken);
                _logger.LogInformation("Updated app config (onboardingCompleted={OnboardingCompleted})", config.OnboardingCompleted);
                return ToDto(config);
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<string?> GetActiveProfileIdAsync(CancellationToken cancellationToken = default)
        {
            var config = await LoadAsync(cancellationToken);
            return config.ActiveProfileId;
        }

        public async Task<string?> SetActiveProfileIdAsync(string? profileId, CancellationToken cancellationToken = default)
        {
            await _lock.WaitAsync(cancellationToken);
            try
            {
                var config = await LoadUnsafeAsync(cancellationToken);
                if (!string.IsNullOrWhiteSpace(profileId) && config.Profiles.All(p => p.Id != profileId))
                {
                    throw new InvalidOperationException("Profile not found.");
                }

                config.ActiveProfileId = profileId;
                if (!string.IsNullOrWhiteSpace(profileId))
                {
                    var profile = config.Profiles.First(p => p.Id == profileId);
                    profile.LastUsed = DateTime.UtcNow.ToString("O");
                }

                await SaveUnsafeAsync(config, cancellationToken);
                _logger.LogInformation("Active profile set to {ProfileId}", profileId ?? "none");
                return config.ActiveProfileId;
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<IReadOnlyList<ServerProfileDto>> GetProfilesAsync(CancellationToken cancellationToken = default)
        {
            var config = await LoadAsync(cancellationToken);
            return config.Profiles.Select(ToDto).ToList();
        }

        public async Task<ServerProfileDto> CreateProfileAsync(CreateProfileRequest request, CancellationToken cancellationToken = default)
        {
            await _lock.WaitAsync(cancellationToken);
            try
            {
                var config = await LoadUnsafeAsync(cancellationToken);
                if (config.Profiles.Any(p => string.Equals(p.Name, request.Name, StringComparison.OrdinalIgnoreCase)))
                {
                    throw new InvalidOperationException("Profile name already exists.");
                }

                var now = DateTime.UtcNow.ToString("O");
                var profile = new StoredServerProfile
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Name = request.Name,
                    Expansion = request.Expansion,
                    Database = new StoredDatabaseConfig
                    {
                        Host = request.Database.Host,
                        Port = request.Database.Port,
                        Username = request.Database.Username,
                        PasswordEncrypted = EncryptPassword(request.Database.Password)
                    },
                    WowPath = request.WowPath,
                    RealmdPath = request.RealmdPath,
                    MangosdPath = request.MangosdPath,
                    CreatedAt = now,
                    LastUsed = now
                };

                config.Profiles.Add(profile);

                if (string.IsNullOrWhiteSpace(config.ActiveProfileId))
                {
                    config.ActiveProfileId = profile.Id;
                }

                await SaveUnsafeAsync(config, cancellationToken);
                _logger.LogInformation("Created profile {ProfileName} ({ProfileId})", profile.Name, profile.Id);
                return ToDto(profile);
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<ServerProfileDto> UpdateProfileAsync(string id, UpdateProfileRequest request, CancellationToken cancellationToken = default)
        {
            await _lock.WaitAsync(cancellationToken);
            try
            {
                var config = await LoadUnsafeAsync(cancellationToken);
                var profile = config.Profiles.FirstOrDefault(p => p.Id == id);
                if (profile == null)
                {
                    throw new InvalidOperationException("Profile not found.");
                }

                if (!string.IsNullOrWhiteSpace(request.Name) &&
                    config.Profiles.Any(p => p.Id != id && string.Equals(p.Name, request.Name, StringComparison.OrdinalIgnoreCase)))
                {
                    throw new InvalidOperationException("Profile name already exists.");
                }

                profile.Name = request.Name ?? profile.Name;
                profile.Expansion = request.Expansion ?? profile.Expansion;
                profile.WowPath = request.WowPath ?? profile.WowPath;
                profile.RealmdPath = request.RealmdPath ?? profile.RealmdPath;
                profile.MangosdPath = request.MangosdPath ?? profile.MangosdPath;

                if (request.Database != null)
                {
                    profile.Database.Host = request.Database.Host;
                    profile.Database.Port = request.Database.Port;
                    profile.Database.Username = request.Database.Username;
                }

                profile.LastUsed = DateTime.UtcNow.ToString("O");

                await SaveUnsafeAsync(config, cancellationToken);
                _logger.LogInformation("Updated profile {ProfileId}", profile.Id);
                return ToDto(profile);
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task DeleteProfileAsync(string id, CancellationToken cancellationToken = default)
        {
            await _lock.WaitAsync(cancellationToken);
            try
            {
                var config = await LoadUnsafeAsync(cancellationToken);
                var profile = config.Profiles.FirstOrDefault(p => p.Id == id);
                if (profile == null)
                {
                    throw new InvalidOperationException("Profile not found.");
                }

                config.Profiles.Remove(profile);
                if (config.ActiveProfileId == id)
                {
                    config.ActiveProfileId = config.Profiles.FirstOrDefault()?.Id;
                }

                await SaveUnsafeAsync(config, cancellationToken);
                _logger.LogInformation("Deleted profile {ProfileId}", id);
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task UpdateProfilePasswordAsync(string id, string password, CancellationToken cancellationToken = default)
        {
            await _lock.WaitAsync(cancellationToken);
            try
            {
                var config = await LoadUnsafeAsync(cancellationToken);
                var profile = config.Profiles.FirstOrDefault(p => p.Id == id);
                if (profile == null)
                {
                    throw new InvalidOperationException("Profile not found.");
                }

                profile.Database.PasswordEncrypted = string.IsNullOrEmpty(password)
                    ? string.Empty
                    : EncryptPassword(password);

                await SaveUnsafeAsync(config, cancellationToken);
                _logger.LogInformation("Updated password for profile {ProfileId}", id);
            }
            finally
            {
                _lock.Release();
            }
        }

        private async Task<StoredAppConfig> LoadAsync(CancellationToken cancellationToken)
        {
            await _lock.WaitAsync(cancellationToken);
            try
            {
                return await LoadUnsafeAsync(cancellationToken);
            }
            finally
            {
                _lock.Release();
            }
        }

        private async Task<StoredAppConfig> LoadUnsafeAsync(CancellationToken cancellationToken)
        {
            if (_cached != null)
            {
                return _cached;
            }

            if (!File.Exists(_configPath))
            {
                _cached = CreateDefaultConfig();
                await SaveUnsafeAsync(_cached, cancellationToken);
                return _cached;
            }

            var json = await File.ReadAllTextAsync(_configPath, cancellationToken);
            var config = JsonSerializer.Deserialize<StoredAppConfig>(json, _jsonOptions) ?? CreateDefaultConfig();
            config.Settings ??= CreateDefaultConfig().Settings;
            config.Profiles ??= new List<StoredServerProfile>();
            _cached = config;
            return config;
        }

        private async Task SaveUnsafeAsync(StoredAppConfig config, CancellationToken cancellationToken)
        {
            var directory = Path.GetDirectoryName(_configPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            var json = JsonSerializer.Serialize(config, _jsonOptions);
            await File.WriteAllTextAsync(_configPath, json, cancellationToken);
            _cached = config;
        }

        private static StoredAppConfig CreateDefaultConfig()
        {
            return new StoredAppConfig
            {
                Version = "1.0.0",
                ActiveProfileId = null,
                OnboardingCompleted = false,
                Settings = new StoredAppSettings
                {
                    AutoUpdate = true,
                    LaunchOnStartup = false,
                    MinimizeToTray = true,
                    CheckUpdatesOnStartup = true
                },
                Profiles = new List<StoredServerProfile>()
            };
        }

        private static string EncryptPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return string.Empty;
            }

            if (!OperatingSystem.IsWindows())
            {
                throw new InvalidOperationException("Password encryption is only supported on Windows.");
            }

            var bytes = Encoding.UTF8.GetBytes(password);
            var protectedBytes = System.Security.Cryptography.ProtectedData.Protect(
                bytes,
                null,
                System.Security.Cryptography.DataProtectionScope.CurrentUser);
            return Convert.ToBase64String(protectedBytes);
        }

        private static AppConfigDto ToDto(StoredAppConfig config)
        {
            return new AppConfigDto
            {
                Version = config.Version,
                ActiveProfileId = config.ActiveProfileId,
                OnboardingCompleted = config.OnboardingCompleted,
                Settings = new AppSettingsDto
                {
                    AutoUpdate = config.Settings.AutoUpdate,
                    LaunchOnStartup = config.Settings.LaunchOnStartup,
                    MinimizeToTray = config.Settings.MinimizeToTray,
                    CheckUpdatesOnStartup = config.Settings.CheckUpdatesOnStartup
                }
            };
        }

        private static ServerProfileDto ToDto(StoredServerProfile profile)
        {
            return new ServerProfileDto
            {
                Id = profile.Id,
                Name = profile.Name,
                Expansion = profile.Expansion,
                Database = new DatabaseConfigDto
                {
                    Host = profile.Database.Host,
                    Port = profile.Database.Port,
                    Username = profile.Database.Username,
                    Password = string.Empty
                },
                WowPath = profile.WowPath,
                RealmdPath = profile.RealmdPath,
                MangosdPath = profile.MangosdPath,
                CreatedAt = profile.CreatedAt,
                LastUsed = profile.LastUsed
            };
        }

        private sealed class StoredAppConfig
        {
            public string Version { get; set; } = "1.0.0";
            public string? ActiveProfileId { get; set; }
            public bool OnboardingCompleted { get; set; }
            public StoredAppSettings Settings { get; set; } = new();
            public List<StoredServerProfile> Profiles { get; set; } = new();
        }

        private sealed class StoredAppSettings
        {
            public bool AutoUpdate { get; set; }
            public bool LaunchOnStartup { get; set; }
            public bool MinimizeToTray { get; set; }
            public bool CheckUpdatesOnStartup { get; set; }
        }

        private sealed class StoredServerProfile
        {
            public string Id { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Expansion { get; set; } = string.Empty;
            public StoredDatabaseConfig Database { get; set; } = new();
            public string WowPath { get; set; } = string.Empty;
            public string RealmdPath { get; set; } = string.Empty;
            public string MangosdPath { get; set; } = string.Empty;
            public string CreatedAt { get; set; } = string.Empty;
            public string LastUsed { get; set; } = string.Empty;
        }

        private sealed class StoredDatabaseConfig
        {
            public string Host { get; set; } = string.Empty;
            public int Port { get; set; }
            public string Username { get; set; } = string.Empty;
            public string PasswordEncrypted { get; set; } = string.Empty;
        }
    }
}
