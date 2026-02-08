using CMAnGOS_CMS_API.Server.Models.Dto;

namespace CMAnGOS_CMS_API.Server.Services
{
    public interface IAppConfigService
    {
        Task<AppConfigDto> GetConfigAsync(CancellationToken cancellationToken = default);
        Task<AppConfigDto> UpdateConfigAsync(UpdateConfigRequest request, CancellationToken cancellationToken = default);
        Task<string?> GetActiveProfileIdAsync(CancellationToken cancellationToken = default);
        Task<string?> SetActiveProfileIdAsync(string? profileId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ServerProfileDto>> GetProfilesAsync(CancellationToken cancellationToken = default);
        Task<ServerProfileDto> CreateProfileAsync(CreateProfileRequest request, CancellationToken cancellationToken = default);
        Task<ServerProfileDto> UpdateProfileAsync(string id, UpdateProfileRequest request, CancellationToken cancellationToken = default);
        Task DeleteProfileAsync(string id, CancellationToken cancellationToken = default);
        Task UpdateProfilePasswordAsync(string id, string password, CancellationToken cancellationToken = default);
    }
}
