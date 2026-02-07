using CMAnGOS_CMS_API.Server.Models.Dto;
using CMAnGOS_CMS_API.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [ApiController]
    [Route("api/server")]
    public class ServerController : ControllerBase
    {
        private readonly IServerControlService _serverControlService;
        private readonly ILogger<ServerController> _logger;

        public ServerController(IServerControlService serverControlService, ILogger<ServerController> logger)
        {
            _serverControlService = serverControlService;
            _logger = logger;
        }

        [HttpPost("validate-paths")]
        public async Task<IActionResult> ValidatePaths([FromBody] ServerPathsRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.ValidatePathsAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Server path validation failed");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("status")]
        public async Task<IActionResult> Status([FromBody] ServerPathsRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.GetStatusAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read server status");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] ServerPathsRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.StartAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start servers");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("stop")]
        public async Task<IActionResult> Stop([FromBody] ServerPathsRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.StopAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to stop servers");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("restart")]
        public async Task<IActionResult> Restart([FromBody] ServerPathsRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.RestartAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restart servers");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("logs")]
        public async Task<IActionResult> Logs([FromBody] ServerPathsRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _serverControlService.GetLogsAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read server logs");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
