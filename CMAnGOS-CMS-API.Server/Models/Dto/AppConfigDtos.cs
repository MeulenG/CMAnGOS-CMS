namespace CMAnGOS_CMS_API.Server.Models.Dto
{
    public sealed class DatabaseConfigDto
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public sealed class ServerProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Expansion { get; set; } = string.Empty;
        public DatabaseConfigDto Database { get; set; } = new();
        public string WowPath { get; set; } = string.Empty;
        public string RealmdPath { get; set; } = string.Empty;
        public string MangosdPath { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
        public string LastUsed { get; set; } = string.Empty;
    }

    public sealed class AppSettingsDto
    {
        public bool AutoUpdate { get; set; }
        public bool LaunchOnStartup { get; set; }
        public bool MinimizeToTray { get; set; }
        public bool CheckUpdatesOnStartup { get; set; }
    }

    public sealed class AppConfigDto
    {
        public string Version { get; set; } = "1.0.0";
        public string? ActiveProfileId { get; set; }
        public AppSettingsDto Settings { get; set; } = new();
        public bool OnboardingCompleted { get; set; }
    }

    public sealed class CreateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Expansion { get; set; } = string.Empty;
        public DatabaseConfigDto Database { get; set; } = new();
        public string WowPath { get; set; } = string.Empty;
        public string RealmdPath { get; set; } = string.Empty;
        public string MangosdPath { get; set; } = string.Empty;
    }

    public sealed class UpdateProfileRequest
    {
        public string? Name { get; set; }
        public string? Expansion { get; set; }
        public DatabaseConfigDto? Database { get; set; }
        public string? WowPath { get; set; }
        public string? RealmdPath { get; set; }
        public string? MangosdPath { get; set; }
    }

    public sealed class UpdateProfilePasswordRequest
    {
        public string Password { get; set; } = string.Empty;
    }

    public sealed class UpdateConfigRequest
    {
        public AppSettingsDto? Settings { get; set; }
        public bool? OnboardingCompleted { get; set; }
    }

    public sealed class ActiveProfileRequest
    {
        public string? ActiveProfileId { get; set; }
    }
}
