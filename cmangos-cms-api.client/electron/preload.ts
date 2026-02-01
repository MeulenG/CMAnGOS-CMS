import { contextBridge, ipcRenderer } from 'electron';

console.log('========================================');
console.log('PRELOAD SCRIPT IS RUNNING');
console.log('========================================');

// Inline IPC channel constants to avoid import issues in preload
const IPC_CHANNELS = {
  CONFIG_GET: 'config:get',
  CONFIG_SAVE: 'config:save',
  CONFIG_GET_ACTIVE_PROFILE: 'config:get-active-profile',
  CONFIG_SET_ACTIVE_PROFILE: 'config:set-active-profile',
  PROFILE_CREATE: 'profile:create',
  PROFILE_UPDATE: 'profile:update',
  PROFILE_DELETE: 'profile:delete',
  PROFILE_GET_ALL: 'profile:get-all',
} as const;

// Type-safe IPC API
export interface ElectronAPI {
  platform: string;
  version: string;
  
  // Config operations
  config: {
    get: () => Promise<{ success: boolean; data?: any; error?: string }>;
    save: (updates: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    getActiveProfile: () => Promise<{ success: boolean; data?: string | null; error?: string }>;
    setActiveProfile: (profileId: string | null) => Promise<{ success: boolean; data?: string | null; error?: string }>;
  };
  
  // Profile operations
  profile: {
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
    create: (profileData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    delete: (id: string) => Promise<{ success: boolean; error?: string }>;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
  
  // Config operations
  config: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET),
    save: (updates: any) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SAVE, updates),
    getActiveProfile: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET_ACTIVE_PROFILE),
    setActiveProfile: (profileId: string | null) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET_ACTIVE_PROFILE, profileId)
  },
  
  // Profile operations
  profile: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.PROFILE_GET_ALL),
    create: (profileData: any) => 
      ipcRenderer.invoke(IPC_CHANNELS.PROFILE_CREATE, profileData),
    update: (id: string, updates: any) => 
      ipcRenderer.invoke(IPC_CHANNELS.PROFILE_UPDATE, id, updates),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.PROFILE_DELETE, id)
  }
} as ElectronAPI);

console.log('electronAPI has been exposed to window');
console.log('========================================');

// Declare global type for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
