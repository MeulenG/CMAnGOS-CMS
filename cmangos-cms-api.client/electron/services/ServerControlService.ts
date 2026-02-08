import { spawn } from 'child_process';
import { createWriteStream, existsSync, promises as fs } from 'fs';
import { dirname, join, normalize } from 'path';
import type { ServerProcessName, ServerProcessStatus } from '../types/config.types.js';

interface ServerPaths {
  realmdPath: string;
  mangosdPath: string;
}

interface ServerStartOptions {
  showConsole?: boolean;
}

interface ProcessInfo {
  ProcessId?: number;
  ExecutablePath?: string;
}

interface ServerLogOutput {
  stdout: string;
  stderr: string;
}

interface ServerLogsSnapshot {
  realmd: ServerLogOutput;
  mangosd: ServerLogOutput;
}

export class ServerControlService {
  private startedByApp = new Map<ServerProcessName, number>();

  private ensureWindows(): void {
    if (process.platform !== 'win32') {
      throw new Error('Server control is only supported on Windows right now.');
    }
  }

  private normalizePath(value: string): string {
    return normalize(value).toLowerCase();
  }

  private resolveExecutablePath(inputPath: string, exeName: string): string {
    const trimmed = inputPath.trim();
    if (!trimmed) {
      throw new Error(`${exeName} path is required`);
    }

    const lower = trimmed.toLowerCase();
    if (lower.endsWith('.exe') && existsSync(trimmed)) {
      return trimmed;
    }

    const candidate = join(trimmed, exeName);
    if (existsSync(candidate)) {
      return candidate;
    }

    throw new Error(`Could not find ${exeName} at the specified path.`);
  }

  private runPowerShell(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('powershell.exe', ['-NoProfile', '-Command', command], {
        windowsHide: true
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (code !== 0 && stderr.trim()) {
          reject(new Error(stderr.trim()));
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

  private async getProcessInfos(exeName: string): Promise<ProcessInfo[]> {
    const command = `Get-CimInstance Win32_Process -Filter "Name='${exeName}'" | Select-Object ProcessId, ExecutablePath | ConvertTo-Json -Compress`;
    const output = await this.runPowerShell(command);

    if (!output || output === 'null') {
      return [];
    }

    const parsed = JSON.parse(output) as ProcessInfo | ProcessInfo[];
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  private async findMatchingProcess(executablePath: string): Promise<ProcessInfo | null> {
    const exeName = normalize(executablePath).split('\\').pop() || '';
    const processes = await this.getProcessInfos(exeName);
    const normalizedTarget = this.normalizePath(executablePath);

    const match = processes.find((process) => {
      if (!process.ExecutablePath) {
        return false;
      }
      return this.normalizePath(process.ExecutablePath) === normalizedTarget;
    });

    return match || null;
  }

  private async killProcess(pid: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
        windowsHide: true
      });

      child.on('error', reject);
      child.on('close', () => resolve());
    });
  }

  private async readLogTail(filePath: string, maxBytes = 20000): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      if (content.length <= maxBytes) {
        return content;
      }
      return content.slice(-maxBytes);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return '';
      }
      throw error;
    }
  }

  private async getLogOutput(name: ServerProcessName, inputPath: string, exeName: string): Promise<ServerLogOutput> {
    const executablePath = this.resolveExecutablePath(inputPath, exeName);
    const workingDir = dirname(executablePath);
    const stdoutLogPath = join(workingDir, `${name}.stdout.log`);
    const stderrLogPath = join(workingDir, `${name}.stderr.log`);

    const [stdout, stderr] = await Promise.all([
      this.readLogTail(stdoutLogPath),
      this.readLogTail(stderrLogPath)
    ]);

    return { stdout, stderr };
  }

  private async getServerStatus(name: ServerProcessName, inputPath: string, exeName: string): Promise<ServerProcessStatus> {
    try {
      const executablePath = this.resolveExecutablePath(inputPath, exeName);
      const match = await this.findMatchingProcess(executablePath);
      if (match?.ProcessId) {
        return {
          name,
          status: 'running',
          pid: match.ProcessId,
          executablePath,
          startedByApp: this.startedByApp.get(name) === match.ProcessId
        };
      }

      return {
        name,
        status: 'stopped',
        executablePath
      };
    } catch (error) {
      return {
        name,
        status: 'unknown',
        error: (error as Error).message
      };
    }
  }

  async validatePaths(paths: ServerPaths): Promise<ServerPaths> {
    this.ensureWindows();

    return {
      realmdPath: this.resolveExecutablePath(paths.realmdPath, 'realmd.exe'),
      mangosdPath: this.resolveExecutablePath(paths.mangosdPath, 'mangosd.exe')
    };
  }

  async getStatus(paths: ServerPaths): Promise<ServerProcessStatus[]> {
    this.ensureWindows();

    const [realmdStatus, mangosdStatus] = await Promise.all([
      this.getServerStatus('realmd', paths.realmdPath, 'realmd.exe'),
      this.getServerStatus('mangosd', paths.mangosdPath, 'mangosd.exe')
    ]);

    return [realmdStatus, mangosdStatus];
  }

  async getLogs(paths: ServerPaths): Promise<ServerLogsSnapshot> {
    this.ensureWindows();

    const [realmd, mangosd] = await Promise.all([
      this.getLogOutput('realmd', paths.realmdPath, 'realmd.exe'),
      this.getLogOutput('mangosd', paths.mangosdPath, 'mangosd.exe')
    ]);

    return { realmd, mangosd };
  }

  private async startServer(
    name: ServerProcessName,
    inputPath: string,
    exeName: string,
    args: string[],
    options: ServerStartOptions
  ): Promise<void> {
    const executablePath = this.resolveExecutablePath(inputPath, exeName);
    const running = await this.findMatchingProcess(executablePath);
    if (running?.ProcessId) {
      return;
    }

    const workingDir = dirname(executablePath);

    let child;

    if (options.showConsole) {
      child = spawn('cmd.exe', ['/c', 'start', '""', executablePath, ...args], {
        cwd: workingDir,
        windowsHide: false
      });
    } else {
      const stdoutLogPath = join(workingDir, `${name}.stdout.log`);
      const stderrLogPath = join(workingDir, `${name}.stderr.log`);
      const stdoutStream = createWriteStream(stdoutLogPath, { flags: 'a' });
      const stderrStream = createWriteStream(stderrLogPath, { flags: 'a' });

      child = spawn(executablePath, args, {
        cwd: workingDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });

      child.stdout?.pipe(stdoutStream);
      child.stderr?.pipe(stderrStream);

      child.on('exit', (code, signal) => {
        const message = `[ServerControl] ${exeName} exited (code=${code ?? 'null'}, signal=${signal ?? 'null'}). Logs: ${stdoutLogPath}, ${stderrLogPath}`;
        console.warn(message);
      });
    }

    child.on('error', (error) => {
      console.error(`[ServerControl] Failed to spawn ${exeName}:`, error);
    });

    if (!child.pid) {
      throw new Error(`Failed to start ${exeName}`);
    }

    child.unref();
    this.startedByApp.set(name, child.pid);
  }

  async start(paths: ServerPaths, options: ServerStartOptions = {}): Promise<ServerProcessStatus[]> {
    this.ensureWindows();

    await this.startServer('realmd', paths.realmdPath, 'realmd.exe', ['-c', 'realmd.conf'], options);

    const mangosExecutablePath = this.resolveExecutablePath(paths.mangosdPath, 'mangosd.exe');
    const mangosDir = dirname(mangosExecutablePath);
    const mangosArgs = ['-c', 'mangosd.conf'];
    const ahbotConfigPath = join(mangosDir, 'ahbot.conf');
    if (existsSync(ahbotConfigPath)) {
      mangosArgs.push('-a', 'ahbot.conf');
    }

    await this.startServer('mangosd', paths.mangosdPath, 'mangosd.exe', mangosArgs, options);

    return this.getStatus(paths);
  }

  private async stopServer(name: ServerProcessName, inputPath: string, exeName: string): Promise<void> {
    const executablePath = this.resolveExecutablePath(inputPath, exeName);
    const processes = await this.getProcessInfos(exeName);
    const normalizedTarget = this.normalizePath(executablePath);

    const matches = processes.filter((process) =>
      process.ExecutablePath && this.normalizePath(process.ExecutablePath) === normalizedTarget
    );

    for (const processInfo of matches) {
      if (processInfo.ProcessId) {
        await this.killProcess(processInfo.ProcessId);
      }
    }

    this.startedByApp.delete(name);
  }

  async stop(paths: ServerPaths): Promise<ServerProcessStatus[]> {
    this.ensureWindows();

    await this.stopServer('realmd', paths.realmdPath, 'realmd.exe');
    await this.stopServer('mangosd', paths.mangosdPath, 'mangosd.exe');

    return this.getStatus(paths);
  }

  async restart(paths: ServerPaths, options: ServerStartOptions = {}): Promise<ServerProcessStatus[]> {
    this.ensureWindows();

    await this.stop(paths);
    await this.start(paths, options);

    return this.getStatus(paths);
  }
}
