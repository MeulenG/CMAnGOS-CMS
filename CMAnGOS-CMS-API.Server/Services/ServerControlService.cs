using System.Collections.Concurrent;
using System.Diagnostics;
using System.Management;
using System.Runtime.Versioning;
using System.Text;
using CMAnGOS_CMS_API.Server.Models.Dto;

namespace CMAnGOS_CMS_API.Server.Services
{
    [SupportedOSPlatform("windows")]
    public sealed class ServerControlService : IServerControlService
    {
        private readonly ConcurrentDictionary<string, int> _startedByApp = new(StringComparer.OrdinalIgnoreCase);

        private static void EnsureWindows()
        {
            if (!OperatingSystem.IsWindows())
            {
                throw new InvalidOperationException("Server control is only supported on Windows.");
            }
        }

        private static string NormalizePath(string value)
        {
            return Path.GetFullPath(value).Trim().ToLowerInvariant();
        }

        private static string ResolveExecutablePath(string inputPath, string exeName)
        {
            var trimmed = inputPath?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                throw new InvalidOperationException($"{exeName} path is required.");
            }

            if (trimmed.EndsWith(".exe", StringComparison.OrdinalIgnoreCase) && File.Exists(trimmed))
            {
                return trimmed;
            }

            var candidate = Path.Combine(trimmed, exeName);
            if (File.Exists(candidate))
            {
                return candidate;
            }

            throw new InvalidOperationException($"Could not find {exeName} at the specified path.");
        }

        [SupportedOSPlatform("windows")]
        private static IReadOnlyList<(int? ProcessId, string? ExecutablePath)> GetProcessInfos(string exeName)
        {
            if (!OperatingSystem.IsWindows())
            {
                return Array.Empty<(int?, string?)>();
            }

            var results = new List<(int?, string?)>();
            using var searcher = new ManagementObjectSearcher(
                $"SELECT ProcessId, ExecutablePath FROM Win32_Process WHERE Name='{exeName}'");

            foreach (var item in searcher.Get().OfType<ManagementObject>())
            {
                var pidValue = item["ProcessId"];
                var pathValue = item["ExecutablePath"];
                var pid = pidValue != null ? Convert.ToInt32(pidValue) : (int?)null;
                var path = pathValue?.ToString();
                results.Add((pid, path));
            }

            return results;
        }

        private static (int? ProcessId, string? ExecutablePath)? FindMatchingProcess(string executablePath)
        {
            var exeName = Path.GetFileName(executablePath);
            var target = NormalizePath(executablePath);

            var matches = GetProcessInfos(exeName)
                .Where(info => !string.IsNullOrWhiteSpace(info.ExecutablePath))
                .FirstOrDefault(info => NormalizePath(info.ExecutablePath!) == target);

            return matches.ExecutablePath == null ? null : matches;
        }

        private static async Task KillProcessAsync(int pid, CancellationToken cancellationToken)
        {
            try
            {
                var process = Process.GetProcessById(pid);
                process.Kill(entireProcessTree: true);
                await process.WaitForExitAsync(cancellationToken);
            }
            catch (ArgumentException)
            {
                // Process already exited.
            }
        }

        private static async Task<string> ReadLogTailAsync(string filePath, int maxBytes, CancellationToken cancellationToken)
        {
            if (!File.Exists(filePath))
            {
                return string.Empty;
            }

            await using var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            if (stream.Length <= maxBytes)
            {
                using var reader = new StreamReader(stream, Encoding.UTF8);
                return await reader.ReadToEndAsync(cancellationToken);
            }

            stream.Seek(-maxBytes, SeekOrigin.End);
            using var tailReader = new StreamReader(stream, Encoding.UTF8);
            return await tailReader.ReadToEndAsync(cancellationToken);
        }

        private static string BuildArgumentString(IEnumerable<string> args)
        {
            return string.Join(" ", args.Select(QuoteArgument));
        }

        private static string QuoteArgument(string value)
        {
            return value.Contains(' ') ? $"\"{value}\"" : value;
        }

        private static async Task PumpToFileAsync(StreamReader reader, string filePath, CancellationToken cancellationToken)
        {
            await using var stream = new FileStream(filePath, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
            await using var writer = new StreamWriter(stream) { AutoFlush = true };

            while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
            {
                var line = await reader.ReadLineAsync(cancellationToken);
                if (line == null)
                {
                    break;
                }

                await writer.WriteLineAsync(line);
            }
        }

        private static async Task<ServerLogOutputDto> GetLogOutputAsync(string inputPath, string exeName, string logPrefix, CancellationToken cancellationToken)
        {
            var executablePath = ResolveExecutablePath(inputPath, exeName);
            var workingDir = Path.GetDirectoryName(executablePath) ?? string.Empty;
            var stdoutLogPath = Path.Combine(workingDir, $"{logPrefix}.stdout.log");
            var stderrLogPath = Path.Combine(workingDir, $"{logPrefix}.stderr.log");

            var stdout = await ReadLogTailAsync(stdoutLogPath, 20000, cancellationToken);
            var stderr = await ReadLogTailAsync(stderrLogPath, 20000, cancellationToken);

            return new ServerLogOutputDto { Stdout = stdout, Stderr = stderr };
        }

        private static IReadOnlyList<string> BuildMangosArgs(string mangosdPath)
        {
            var mangosExecutablePath = ResolveExecutablePath(mangosdPath, "mangosd.exe");
            var mangosDir = Path.GetDirectoryName(mangosExecutablePath) ?? string.Empty;
            var mangosArgs = new List<string> { "-c", "mangosd.conf" };
            var ahbotConfigPath = Path.Combine(mangosDir, "ahbot.conf");
            if (File.Exists(ahbotConfigPath))
            {
                mangosArgs.Add("-a");
                mangosArgs.Add("ahbot.conf");
            }

            return mangosArgs;
        }

        private ServerProcessStatusDto GetServerStatus(string name, string inputPath, string exeName)
        {
            try
            {
                var executablePath = ResolveExecutablePath(inputPath, exeName);
                var match = FindMatchingProcess(executablePath);
                if (match is { ProcessId: not null } found)
                {
                    return new ServerProcessStatusDto
                    {
                        Name = name,
                        Status = "running",
                        Pid = found.ProcessId,
                        ExecutablePath = executablePath,
                        StartedByApp = _startedByApp.TryGetValue(name, out var trackedPid) && found.ProcessId == trackedPid
                    };
                }

                return new ServerProcessStatusDto
                {
                    Name = name,
                    Status = "stopped",
                    ExecutablePath = executablePath
                };
            }
            catch (Exception ex)
            {
                return new ServerProcessStatusDto
                {
                    Name = name,
                    Status = "unknown",
                    Error = ex.Message
                };
            }
        }

        public Task<ServerPathsRequest> ValidatePathsAsync(ServerPathsRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            _ = cancellationToken;

            return Task.FromResult(new ServerPathsRequest
            {
                RealmdPath = ResolveExecutablePath(request.RealmdPath, "realmd.exe"),
                MangosdPath = ResolveExecutablePath(request.MangosdPath, "mangosd.exe")
            });
        }

        public Task<IReadOnlyList<ServerProcessStatusDto>> GetStatusAsync(ServerPathsRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            _ = cancellationToken;

            var statuses = new List<ServerProcessStatusDto>
            {
                GetServerStatus("realmd", request.RealmdPath, "realmd.exe"),
                GetServerStatus("mangosd", request.MangosdPath, "mangosd.exe")
            };

            return Task.FromResult<IReadOnlyList<ServerProcessStatusDto>>(statuses);
        }

        public Task<ServerProcessStatusDto> GetRealmdStatusAsync(RealmdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            _ = cancellationToken;
            return Task.FromResult(GetServerStatus("realmd", request.RealmdPath, "realmd.exe"));
        }

        public Task<ServerProcessStatusDto> GetMangosdStatusAsync(MangosdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            _ = cancellationToken;
            return Task.FromResult(GetServerStatus("mangosd", request.MangosdPath, "mangosd.exe"));
        }

        public async Task<IReadOnlyList<ServerProcessStatusDto>> StartAsync(ServerPathsRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();

            await StartRealmdAsync(new RealmdPathRequest
            {
                RealmdPath = request.RealmdPath,
                ShowConsole = request.ShowConsole
            }, cancellationToken);

            await StartMangosdAsync(new MangosdPathRequest
            {
                MangosdPath = request.MangosdPath,
                ShowConsole = request.ShowConsole
            }, cancellationToken);

            return await GetStatusAsync(request, cancellationToken);
        }

        public async Task<ServerProcessStatusDto> StartRealmdAsync(RealmdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            await StartServerAsync("realmd", request.RealmdPath, "realmd.exe", new[] { "-c", "realmd.conf" }, request.ShowConsole, cancellationToken);
            return await GetRealmdStatusAsync(request, cancellationToken);
        }

        public async Task<ServerProcessStatusDto> StartMangosdAsync(MangosdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            var args = BuildMangosArgs(request.MangosdPath);
            await StartServerAsync("mangosd", request.MangosdPath, "mangosd.exe", args, request.ShowConsole, cancellationToken);
            return await GetMangosdStatusAsync(request, cancellationToken);
        }

        public async Task<IReadOnlyList<ServerProcessStatusDto>> StopAsync(ServerPathsRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();

            await StopRealmdAsync(new RealmdPathRequest { RealmdPath = request.RealmdPath }, cancellationToken);
            await StopMangosdAsync(new MangosdPathRequest { MangosdPath = request.MangosdPath }, cancellationToken);

            return await GetStatusAsync(request, cancellationToken);
        }

        public async Task<ServerProcessStatusDto> StopRealmdAsync(RealmdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            await StopServerAsync("realmd", request.RealmdPath, "realmd.exe", cancellationToken);
            return await GetRealmdStatusAsync(request, cancellationToken);
        }

        public async Task<ServerProcessStatusDto> StopMangosdAsync(MangosdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            await StopServerAsync("mangosd", request.MangosdPath, "mangosd.exe", cancellationToken);
            return await GetMangosdStatusAsync(request, cancellationToken);
        }

        public async Task<IReadOnlyList<ServerProcessStatusDto>> RestartAsync(ServerPathsRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();

            await RestartRealmdAsync(new RealmdPathRequest
            {
                RealmdPath = request.RealmdPath,
                ShowConsole = request.ShowConsole
            }, cancellationToken);
            await RestartMangosdAsync(new MangosdPathRequest
            {
                MangosdPath = request.MangosdPath,
                ShowConsole = request.ShowConsole
            }, cancellationToken);

            return await GetStatusAsync(request, cancellationToken);
        }

        public async Task<ServerProcessStatusDto> RestartRealmdAsync(RealmdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            await StopRealmdAsync(request, cancellationToken);
            await StartRealmdAsync(request, cancellationToken);
            return await GetRealmdStatusAsync(request, cancellationToken);
        }

        public async Task<ServerProcessStatusDto> RestartMangosdAsync(MangosdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            await StopMangosdAsync(request, cancellationToken);
            await StartMangosdAsync(request, cancellationToken);
            return await GetMangosdStatusAsync(request, cancellationToken);
        }

        public async Task<ServerLogsSnapshotDto> GetLogsAsync(ServerPathsRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();

            var realmd = await GetLogOutputAsync(request.RealmdPath, "realmd.exe", "realmd", cancellationToken);
            var mangosd = await GetLogOutputAsync(request.MangosdPath, "mangosd.exe", "mangosd", cancellationToken);

            return new ServerLogsSnapshotDto { Realmd = realmd, Mangosd = mangosd };
        }

        public async Task<ServerLogOutputDto> GetRealmdLogsAsync(RealmdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            return await GetLogOutputAsync(request.RealmdPath, "realmd.exe", "realmd", cancellationToken);
        }

        public async Task<ServerLogOutputDto> GetMangosdLogsAsync(MangosdPathRequest request, CancellationToken cancellationToken = default)
        {
            EnsureWindows();
            return await GetLogOutputAsync(request.MangosdPath, "mangosd.exe", "mangosd", cancellationToken);
        }

        private Task StartServerAsync(
            string name,
            string inputPath,
            string exeName,
            IEnumerable<string> args,
            bool? showConsole,
            CancellationToken cancellationToken)
        {
            var executablePath = ResolveExecutablePath(inputPath, exeName);
            var running = FindMatchingProcess(executablePath);
            if (running?.ProcessId != null)
            {
                return Task.CompletedTask;
            }

            var workingDir = Path.GetDirectoryName(executablePath) ?? string.Empty;

            if (showConsole == true)
            {
                var commandArgs = $"/c start \"\" {QuoteArgument(executablePath)} {BuildArgumentString(args)}";
                var startInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = commandArgs,
                    WorkingDirectory = workingDir,
                    UseShellExecute = true,
                    CreateNoWindow = false
                };

                Process.Start(startInfo);
                return Task.CompletedTask;
            }

            var stdoutLogPath = Path.Combine(workingDir, $"{name}.stdout.log");
            var stderrLogPath = Path.Combine(workingDir, $"{name}.stderr.log");

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = executablePath,
                    WorkingDirectory = workingDir,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                },
                EnableRaisingEvents = true
            };

            foreach (var arg in args)
            {
                process.StartInfo.ArgumentList.Add(arg);
            }

            process.Start();
            if (process.Id > 0)
            {
                _startedByApp[name] = process.Id;
            }

            _ = Task.Run(() => PumpToFileAsync(process.StandardOutput, stdoutLogPath, cancellationToken), cancellationToken);
            _ = Task.Run(() => PumpToFileAsync(process.StandardError, stderrLogPath, cancellationToken), cancellationToken);

            return Task.CompletedTask;
        }

        private async Task StopServerAsync(string name, string inputPath, string exeName, CancellationToken cancellationToken)
        {
            var executablePath = ResolveExecutablePath(inputPath, exeName);
            var target = NormalizePath(executablePath);
            var processes = GetProcessInfos(exeName)
                .Where(info => info.ExecutablePath != null && NormalizePath(info.ExecutablePath) == target);

            foreach (var processInfo in processes)
            {
                if (processInfo.ProcessId != null)
                {
                    await KillProcessAsync(processInfo.ProcessId.Value, cancellationToken);
                }
            }

            _startedByApp.TryRemove(name, out _);
        }
    }
}
