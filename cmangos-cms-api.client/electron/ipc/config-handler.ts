import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { ConfigService } from '../services/ConfigService.js';
import { IPC_CHANNELS, AppConfig, AppSettings } from '../types/config.types.js';

/**
 * Config IPC Handlers
 * Handles IPC communication for configuration operations
 */
export class ConfigHandler {
  constructor(private configService: ConfigService) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Get entire config
    ipcMain.handle(IPC_CHANNELS.CONFIG_GET, async () => {
      try {
        return {
          success: true,
          data: this.configService.getConfig()
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    // Save config
    ipcMain.handle(IPC_CHANNELS.CONFIG_SAVE, async (_event: IpcMainInvokeEvent, updates: Partial<AppConfig>) => {
      try {
        await this.configService.updateConfig(updates);
        return {
          success: true,
          data: this.configService.getConfig()
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    // Get active profile ID
    ipcMain.handle(IPC_CHANNELS.CONFIG_GET_ACTIVE_PROFILE, async () => {
      try {
        return {
          success: true,
          data: this.configService.getActiveProfileId()
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    // Set active profile ID
    ipcMain.handle(IPC_CHANNELS.CONFIG_SET_ACTIVE_PROFILE, async (_event: IpcMainInvokeEvent, profileId: string | null) => {
      try {
        await this.configService.setActiveProfileId(profileId);
        return {
          success: true,
          data: profileId
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });
  }

  /**
   * Remove all registered handlers (for cleanup)
   */
  removeHandlers(): void {
    ipcMain.removeHandler(IPC_CHANNELS.CONFIG_GET);
    ipcMain.removeHandler(IPC_CHANNELS.CONFIG_SAVE);
    ipcMain.removeHandler(IPC_CHANNELS.CONFIG_GET_ACTIVE_PROFILE);
    ipcMain.removeHandler(IPC_CHANNELS.CONFIG_SET_ACTIVE_PROFILE);
  }
}
