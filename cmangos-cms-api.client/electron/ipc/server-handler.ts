import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IPC_CHANNELS } from '../types/config.types.js';
import { ServerControlService } from '../services/ServerControlService.js';

interface ServerPaths {
  realmdPath: string;
  mangosdPath: string;
  showConsole?: boolean;
}

export class ServerHandler {
  constructor(private serverControlService: ServerControlService) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    ipcMain.handle(IPC_CHANNELS.SERVER_VALIDATE_PATHS, async (_event: IpcMainInvokeEvent, paths: ServerPaths) => {
      try {
        const resolved = await this.serverControlService.validatePaths(paths);
        return {
          success: true,
          data: resolved
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    ipcMain.handle(IPC_CHANNELS.SERVER_STATUS, async (_event: IpcMainInvokeEvent, paths: ServerPaths) => {
      try {
        const status = await this.serverControlService.getStatus(paths);
        return {
          success: true,
          data: status
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    ipcMain.handle(IPC_CHANNELS.SERVER_START, async (_event: IpcMainInvokeEvent, paths: ServerPaths) => {
      try {
        const status = await this.serverControlService.start(paths, { showConsole: paths.showConsole });
        return {
          success: true,
          data: status
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    ipcMain.handle(IPC_CHANNELS.SERVER_STOP, async (_event: IpcMainInvokeEvent, paths: ServerPaths) => {
      try {
        const status = await this.serverControlService.stop(paths);
        return {
          success: true,
          data: status
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    ipcMain.handle(IPC_CHANNELS.SERVER_RESTART, async (_event: IpcMainInvokeEvent, paths: ServerPaths) => {
      try {
        const status = await this.serverControlService.restart(paths, { showConsole: paths.showConsole });
        return {
          success: true,
          data: status
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    ipcMain.handle(IPC_CHANNELS.SERVER_LOGS_READ, async (_event: IpcMainInvokeEvent, paths: ServerPaths) => {
      try {
        const logs = await this.serverControlService.getLogs(paths);
        return {
          success: true,
          data: logs
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });
  }

  removeHandlers(): void {
    ipcMain.removeHandler(IPC_CHANNELS.SERVER_VALIDATE_PATHS);
    ipcMain.removeHandler(IPC_CHANNELS.SERVER_STATUS);
    ipcMain.removeHandler(IPC_CHANNELS.SERVER_START);
    ipcMain.removeHandler(IPC_CHANNELS.SERVER_STOP);
    ipcMain.removeHandler(IPC_CHANNELS.SERVER_RESTART);
    ipcMain.removeHandler(IPC_CHANNELS.SERVER_LOGS_READ);
  }
}
