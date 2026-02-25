using CMAnGOS_CMS_API.Server.Models.Dto;
using CMAnGOS_CMS_API.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CMAnGOS_CMS_API.Server.Controllers
{
    [ApiController]
    [Route("api/profile")]
    public class ProfileController : ControllerBase
    {
        private readonly IAppConfigService _configService;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(IAppConfigService configService, ILogger<ProfileController> logger)
        {
            _configService = configService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfiles(CancellationToken cancellationToken)
        {
            var profiles = await _configService.GetProfilesAsync(cancellationToken);
            return Ok(profiles);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProfile([FromBody] CreateProfileRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var profile = await _configService.CreateProfileAsync(request, cancellationToken);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create profile");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(string id, [FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var profile = await _configService.UpdateProfileAsync(id, request, cancellationToken);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update profile {ProfileId}", id);
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfile(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _configService.DeleteProfileAsync(id, cancellationToken);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete profile {ProfileId}", id);
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("{id}/password")]
        public async Task<IActionResult> UpdatePassword(string id, [FromBody] UpdateProfilePasswordRequest request, CancellationToken cancellationToken)
        {
            try
            {
                await _configService.UpdateProfilePasswordAsync(id, request.Password, cancellationToken);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update password for profile {ProfileId}", id);
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
