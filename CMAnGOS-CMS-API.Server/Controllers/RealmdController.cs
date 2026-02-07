using CMAnGOS_CMS_API.Server.Models.Dto;
using CMAnGOS_CMS_API.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [ApiController]
    [Route("api/realmd")]
    public class RealmdController : ControllerBase
    {
        private readonly IServerControlService _serverControlService;
        private readonly ILogger<RealmdController> _logger;

        public RealmdController(IServerControlService serverControlService, ILogger<RealmdController> logger)
        {
            _serverControlService = serverControlService;
            _logger = logger;
        }

        [HttpPost("status")]
        public async Task<IActionResult> Status([FromBody] RealmdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.GetRealmdStatusAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read realmd status");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] RealmdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.StartRealmdAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start realmd");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("stop")]
        public async Task<IActionResult> Stop([FromBody] RealmdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.StopRealmdAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to stop realmd");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("restart")]
        public async Task<IActionResult> Restart([FromBody] RealmdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.RestartRealmdAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restart realmd");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("logs")]
        public async Task<IActionResult> Logs([FromBody] RealmdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.GetRealmdLogsAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read realmd logs");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
