import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { WowClientError } from '../types/config.types.js';

export class WowService {
  private resolveExecutablePath(wowPath: string): string {
    const trimmed = wowPath.trim();

    if (!trimmed) {
      throw new WowClientError('WoW path is required');
    }

    if (process.platform !== 'win32') {
      throw new WowClientError('Launch WoW is only supported on Windows right now.');
    }

    const lower = trimmed.toLowerCase();
    if (lower.endsWith('.exe') && existsSync(trimmed)) {
      return trimmed;
    }

    const candidates = [
      join(trimmed, 'Wow.exe'),
      join(trimmed, 'WoW.exe')
    ];

    const match = candidates.find(candidate => existsSync(candidate));
    if (match) {
      return match;
    }

    throw new WowClientError('Could not find Wow.exe in the specified folder.');
  }

  async launch(wowPath: string): Promise<{ executablePath: string }>{
    const executablePath = this.resolveExecutablePath(wowPath);
    const workingDir = dirname(executablePath);

    const child = spawn(executablePath, [], {
      cwd: workingDir,
      detached: true,
      stdio: 'ignore'
    });

    child.unref();

    return { executablePath };
  }
}
