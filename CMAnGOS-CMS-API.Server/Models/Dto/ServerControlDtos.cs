namespace CMAnGOS_CMS_API.Server.Models.Dto
{
    public sealed class ServerPathsRequest
    {
        public string RealmdPath { get; set; } = string.Empty;
        public string MangosdPath { get; set; } = string.Empty;
        public bool? ShowConsole { get; set; }
    }

    public sealed class RealmdPathRequest
    {
        public string RealmdPath { get; set; } = string.Empty;
        public bool? ShowConsole { get; set; }
    }

    public sealed class MangosdPathRequest
    {
        public string MangosdPath { get; set; } = string.Empty;
        public bool? ShowConsole { get; set; }
    }

    public sealed class ServerProcessStatusDto
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = "unknown";
        public int? Pid { get; set; }
        public string? ExecutablePath { get; set; }
        public bool? StartedByApp { get; set; }
        public string? Error { get; set; }
    }

    public sealed class ServerLogOutputDto
    {
        public string Stdout { get; set; } = string.Empty;
        public string Stderr { get; set; } = string.Empty;
    }

    public sealed class ServerLogsSnapshotDto
    {
        public ServerLogOutputDto Realmd { get; set; } = new();
        public ServerLogOutputDto Mangosd { get; set; } = new();
    }

    public sealed class WowLaunchRequest
    {
        public string WowPath { get; set; } = string.Empty;
    }

    public sealed class WowLaunchResponse
    {
        public string ExecutablePath { get; set; } = string.Empty;
    }
}
