using CMAnGOS_CMS_API.Server.Models.Dto;
using CMAnGOS_CMS_API.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [ApiController]
    [Route("api/wow")]
    public class WowController : ControllerBase
    {
        private readonly IWowLaunchService _wowLaunchService;
        private readonly ILogger<WowController> _logger;

        public WowController(IWowLaunchService wowLaunchService, ILogger<WowController> logger)
        {
            _wowLaunchService = wowLaunchService;
            _logger = logger;
        }

        [HttpPost("launch")]
        public IActionResult Launch([FromBody] WowLaunchRequest request)
        {
            try
            {
                var result = _wowLaunchService.Launch(request.WowPath);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to launch WoW");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
