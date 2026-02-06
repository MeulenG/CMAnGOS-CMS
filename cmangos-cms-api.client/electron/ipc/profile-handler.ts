import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { ProfileService } from '../services/ProfileService.js';
import { IPC_CHANNELS, ServerProfile } from '../types/config.types.js';

/**
 * Profile IPC Handlers
 * Handles IPC communication for profile operations
 */
export class ProfileHandler {
  constructor(private profileService: ProfileService) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Get all profiles
    ipcMain.handle(IPC_CHANNELS.PROFILE_GET_ALL, async () => {
      try {
        const profiles = await this.profileService.getAllProfiles();
        return {
          success: true,
          data: profiles
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    // Create profile
    ipcMain.handle(IPC_CHANNELS.PROFILE_CREATE, async (_event: IpcMainInvokeEvent, profileData: Omit<ServerProfile, 'id' | 'createdAt' | 'lastUsed'>) => {
      try {
        // Validate profile data
        const validation = this.profileService.validateProfile(profileData);
        if (!validation.valid) {
          return {
            success: false,
            error: `Validation failed: ${validation.errors.join(', ')}`
          };
        }

        const newProfile = await this.profileService.createProfile(profileData);
        return {
          success: true,
          data: newProfile
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    // Update profile
    ipcMain.handle(IPC_CHANNELS.PROFILE_UPDATE, async (_event: IpcMainInvokeEvent, id: string, updates: Partial<ServerProfile>) => {
      try {
        const updatedProfile = await this.profileService.updateProfile(id, updates);
        return {
          success: true,
          data: updatedProfile
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    // Delete profile
    ipcMain.handle(IPC_CHANNELS.PROFILE_DELETE, async (_event: IpcMainInvokeEvent, id: string) => {
      try {
        await this.profileService.deleteProfile(id);
        return {
          success: true
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    // Update profile password
    ipcMain.handle(IPC_CHANNELS.PROFILE_UPDATE_PASSWORD, async (_event: IpcMainInvokeEvent, id: string, newPassword: string) => {
      try {
        await this.profileService.updateProfilePassword(id, newPassword);
        return {
          success: true
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }
    });

    // Clear profile password
    ipcMain.handle(IPC_CHANNELS.PROFILE_CLEAR_PASSWORD, async (_event: IpcMainInvokeEvent, id: string) => {
      try {
        await this.profileService.clearProfilePassword(id);
        return {
          success: true
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
    ipcMain.removeHandler(IPC_CHANNELS.PROFILE_GET_ALL);
    ipcMain.removeHandler(IPC_CHANNELS.PROFILE_CREATE);
    ipcMain.removeHandler(IPC_CHANNELS.PROFILE_UPDATE);
    ipcMain.removeHandler(IPC_CHANNELS.PROFILE_DELETE);
    ipcMain.removeHandler(IPC_CHANNELS.PROFILE_UPDATE_PASSWORD);
    ipcMain.removeHandler(IPC_CHANNELS.PROFILE_CLEAR_PASSWORD);
  }
}
