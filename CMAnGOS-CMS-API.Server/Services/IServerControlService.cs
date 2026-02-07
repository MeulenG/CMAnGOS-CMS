using CMAnGOS_CMS_API.Server.Models.Dto;

namespace CMAnGOS_CMS_API.Server.Services
{
    public interface IServerControlService
    {
        Task<ServerPathsRequest> ValidatePathsAsync(ServerPathsRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ServerProcessStatusDto>> GetStatusAsync(ServerPathsRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ServerProcessStatusDto>> StartAsync(ServerPathsRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ServerProcessStatusDto>> StopAsync(ServerPathsRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ServerProcessStatusDto>> RestartAsync(ServerPathsRequest request, CancellationToken cancellationToken = default);
        Task<ServerLogsSnapshotDto> GetLogsAsync(ServerPathsRequest request, CancellationToken cancellationToken = default);

        Task<ServerProcessStatusDto> GetRealmdStatusAsync(RealmdPathRequest request, CancellationToken cancellationToken = default);
        Task<ServerProcessStatusDto> StartRealmdAsync(RealmdPathRequest request, CancellationToken cancellationToken = default);
        Task<ServerProcessStatusDto> StopRealmdAsync(RealmdPathRequest request, CancellationToken cancellationToken = default);
        Task<ServerProcessStatusDto> RestartRealmdAsync(RealmdPathRequest request, CancellationToken cancellationToken = default);
        Task<ServerLogOutputDto> GetRealmdLogsAsync(RealmdPathRequest request, CancellationToken cancellationToken = default);

        Task<ServerProcessStatusDto> GetMangosdStatusAsync(MangosdPathRequest request, CancellationToken cancellationToken = default);
        Task<ServerProcessStatusDto> StartMangosdAsync(MangosdPathRequest request, CancellationToken cancellationToken = default);
        Task<ServerProcessStatusDto> StopMangosdAsync(MangosdPathRequest request, CancellationToken cancellationToken = default);
        Task<ServerProcessStatusDto> RestartMangosdAsync(MangosdPathRequest request, CancellationToken cancellationToken = default);
        Task<ServerLogOutputDto> GetMangosdLogsAsync(MangosdPathRequest request, CancellationToken cancellationToken = default);
    }
}
