using CMAnGOS_CMS_API.Server.Models.Dto;
using CMAnGOS_CMS_API.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [ApiController]
    [Route("api/config")]
    public class ConfigController : ControllerBase
    {
        private readonly IAppConfigService _configService;
        private readonly ILogger<ConfigController> _logger;

        public ConfigController(IAppConfigService configService, ILogger<ConfigController> logger)
        {
            _configService = configService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetConfig(CancellationToken cancellationToken)
        {
            var config = await _configService.GetConfigAsync(cancellationToken);
            return Ok(config);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateConfig([FromBody] UpdateConfigRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var config = await _configService.UpdateConfigAsync(request, cancellationToken);
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update config");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("active-profile")]
        public async Task<IActionResult> GetActiveProfile(CancellationToken cancellationToken)
        {
            var activeProfileId = await _configService.GetActiveProfileIdAsync(cancellationToken);
            return Ok(new ActiveProfileRequest { ActiveProfileId = activeProfileId });
        }

        [HttpPost("active-profile")]
        public async Task<IActionResult> SetActiveProfile([FromBody] ActiveProfileRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var activeProfileId = await _configService.SetActiveProfileIdAsync(request.ActiveProfileId, cancellationToken);
                return Ok(new ActiveProfileRequest { ActiveProfileId = activeProfileId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to set active profile");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
