using MySqlConnector;

namespace CMAnGOS_CMS_API.Server.Services
{
    public class CMAnGOSDetectionService : ICMAnGOSDetectionService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<CMAnGOSDetectionService> _logger;
        private readonly string[] _knownPrefixes = { "classic", "tbc", "wotlk" };

        public CMAnGOSDetectionService(IConfiguration configuration, ILogger<CMAnGOSDetectionService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> DetectExpansionPrefixAsync()
        {
            var autoDetect = _configuration.GetValue<bool>("CMAnGOS:AutoDetectExpansion");
            
            if (!autoDetect)
            {
                var configuredPrefix = _configuration.GetValue<string>("CMAnGOS:ExpansionPrefix");
                _logger.LogInformation($"Auto-detection disabled. Using configured prefix: {configuredPrefix}");
                return configuredPrefix ?? "classic";
            }

            _logger.LogInformation("Starting CMAnGOS expansion auto-detection...");

            // Try each known prefix
            foreach (var prefix in _knownPrefixes)
            {
                var realmdDbName = $"{prefix}realmd";
                if (await IsDatabaseAvailableAsync(realmdDbName))
                {
                    _logger.LogInformation($"Detected CMAnGOS expansion: {prefix} (found {realmdDbName} database)");
                    return prefix;
                }
            }

            _logger.LogWarning("Could not auto-detect CMAnGOS expansion. Defaulting to 'classic'");
            return "classic";
        }

        public async Task<bool> IsDatabaseAvailableAsync(string databaseName)
        {
            try
            {
                var baseConnectionString = _configuration.GetConnectionString("RealmdDatabase");
                if (string.IsNullOrEmpty(baseConnectionString))
                {
                    _logger.LogError("RealmdDatabase connection string not found in configuration");
                    return false;
                }

                // Create connection string without database selection
                var builder = new MySqlConnectionStringBuilder(baseConnectionString);
                builder.Database = "";
                
                using var connection = new MySqlConnection(builder.ConnectionString);
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = @dbName";
                command.Parameters.AddWithValue("@dbName", databaseName);

                var result = await command.ExecuteScalarAsync();
                return result != null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Error checking database '{databaseName}': {ex.Message}");
                return false;
            }
        }

        public string GetConnectionString(string baseConnectionString, string prefix)
        {
            if (string.IsNullOrEmpty(baseConnectionString))
            {
                throw new ArgumentException("Base connection string cannot be null or empty", nameof(baseConnectionString));
            }

            return baseConnectionString.Replace("{prefix}", prefix);
        }
    }
}
