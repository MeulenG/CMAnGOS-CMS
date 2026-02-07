using Microsoft.AspNetCore.Mvc;
using CMAnGOS_CMS_API.Server.Data;
using CMAnGOS_CMS_API.Server.Services;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        public class DatabaseTestRequest
        {
            public string Host { get; set; } = string.Empty;
            public int Port { get; set; }
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        private readonly RealmdContext _realmdContext;
        private readonly ICMAnGOSDetectionService _detectionService;
        private readonly ILogger<DatabaseController> _logger;

        public DatabaseController(
            RealmdContext realmdContext, 
            ICMAnGOSDetectionService detectionService,
            ILogger<DatabaseController> logger)
        {
            _realmdContext = realmdContext;
            _detectionService = detectionService;
            _logger = logger;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetDatabaseStatus()
        {
            try
            {
                var prefix = await _detectionService.DetectExpansionPrefixAsync();
                var accountCount = await _realmdContext.Accounts.CountAsync();
                var realmCount = await _realmdContext.RealmLists.CountAsync();

                return Ok(new
                {
                    expansion = prefix,
                    databases = new
                    {
                        realmd = $"{prefix}realmd",
                        characters = $"{prefix}characters",
                        mangos = $"{prefix}mangos",
                        logs = $"{prefix}logs"
                    },
                    statistics = new
                    {
                        accountCount = accountCount,
                        realmCount = realmCount
                    },
                    connected = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking database status");
                return StatusCode(500, new
                {
                    connected = false,
                    error = ex.Message
                });
            }
        }

        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                await _realmdContext.Database.CanConnectAsync();
                return Ok(new { success = true, message = "Database connection successful" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection test failed");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("test-connection")]
        public async Task<IActionResult> TestConnectionWithCredentials([FromBody] DatabaseTestRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Host) ||
                string.IsNullOrWhiteSpace(request.Username) ||
                request.Port < 1 || request.Port > 65535)
            {
                return BadRequest(new { success = false, message = "Host, port, and username are required." });
            }

            try
            {
                var builder = new MySqlConnectionStringBuilder
                {
                    Server = request.Host,
                    Port = (uint)request.Port,
                    UserID = request.Username,
                    Password = request.Password,
                    Database = "information_schema",
                    ConnectionTimeout = 5
                };

                await using var connection = new MySqlConnection(builder.ConnectionString);
                await connection.OpenAsync();

                return Ok(new { success = true, message = "Connection successful!" });
            }
            catch (MySqlException ex) when (ex.Number == 1045)
            {
                _logger.LogWarning(ex, "Database authentication failed for user {Username}", request.Username);
                return BadRequest(new { success = false, message = "Invalid username or password." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection test failed");
                return StatusCode(500, new { success = false, message = "Connection failed." });
            }
        }
    }
}
