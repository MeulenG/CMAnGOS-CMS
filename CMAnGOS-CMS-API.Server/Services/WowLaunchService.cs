using System.Diagnostics;
using System.Runtime.Versioning;
using CMAnGOS_CMS_API.Server.Models.Dto;

namespace CMAnGOS_CMS_API.Server.Services
{
    [SupportedOSPlatform("windows")]
    public sealed class WowLaunchService : IWowLaunchService
    {
        public WowLaunchResponse Launch(string wowPath)
        {
            if (!OperatingSystem.IsWindows())
            {
                throw new InvalidOperationException("Launch WoW is only supported on Windows.");
            }

            var executablePath = ResolveExecutablePath(wowPath);
            var workingDir = Path.GetDirectoryName(executablePath) ?? string.Empty;

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = executablePath,
                    WorkingDirectory = workingDir,
                    UseShellExecute = true
                }
            };

            process.Start();

            return new WowLaunchResponse { ExecutablePath = executablePath };
        }

        private static string ResolveExecutablePath(string wowPath)
        {
            var trimmed = wowPath?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                throw new InvalidOperationException("WoW path is required.");
            }

            if (trimmed.EndsWith(".exe", StringComparison.OrdinalIgnoreCase) && File.Exists(trimmed))
            {
                return trimmed;
            }

            var candidates = new[]
            {
                Path.Combine(trimmed, "Wow.exe"),
                Path.Combine(trimmed, "WoW.exe")
            };

            var match = candidates.FirstOrDefault(File.Exists);
            if (match != null)
            {
                return match;
            }

            throw new InvalidOperationException("Could not find Wow.exe in the specified folder.");
        }
    }
}
