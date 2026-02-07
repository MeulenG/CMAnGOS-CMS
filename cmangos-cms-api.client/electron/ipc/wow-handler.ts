import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IPC_CHANNELS } from '../types/config.types.js';
import { WowService } from '../services/WowService.js';

export class WowHandler {
  constructor(private wowService: WowService) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    ipcMain.handle(IPC_CHANNELS.WOW_LAUNCH, async (_event: IpcMainInvokeEvent, wowPath: string) => {
      try {
        const result = await this.wowService.launch(wowPath);
        return {
          success: true,
          data: result
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
    ipcMain.removeHandler(IPC_CHANNELS.WOW_LAUNCH);
  }
}
