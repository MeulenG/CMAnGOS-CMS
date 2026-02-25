using CMAnGOS_CMS_API.Server.Models.Dto;
using CMAnGOS_CMS_API.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [ApiController]
    [Route("api/mangosd")]
    public class MangosdController : ControllerBase
    {
        private readonly IServerControlService _serverControlService;
        private readonly ILogger<MangosdController> _logger;

        public MangosdController(IServerControlService serverControlService, ILogger<MangosdController> logger)
        {
            _serverControlService = serverControlService;
            _logger = logger;
        }

        [HttpPost("status")]
        public async Task<IActionResult> Status([FromBody] MangosdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.GetMangosdStatusAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read mangosd status");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] MangosdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.StartMangosdAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start mangosd");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("stop")]
        public async Task<IActionResult> Stop([FromBody] MangosdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.StopMangosdAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to stop mangosd");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("restart")]
        public async Task<IActionResult> Restart([FromBody] MangosdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.RestartMangosdAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restart mangosd");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("logs")]
        public async Task<IActionResult> Logs([FromBody] MangosdPathRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.GetMangosdLogsAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read mangosd logs");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
