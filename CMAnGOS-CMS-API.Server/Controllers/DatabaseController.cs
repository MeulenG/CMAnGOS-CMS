using Microsoft.AspNetCore.Mvc;
using CMAnGOS_CMS_API.Server.Data;
using CMAnGOS_CMS_API.Server.Services;
using Microsoft.EntityFrameworkCore;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
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
    }
}
