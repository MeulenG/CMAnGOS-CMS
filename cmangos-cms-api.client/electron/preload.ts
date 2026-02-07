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
  PROFILE_UPDATE_PASSWORD: 'profile:update-password',
  PROFILE_CLEAR_PASSWORD: 'profile:clear-password',
  WOW_LAUNCH: 'wow:launch',
  SERVER_STATUS: 'server:status',
  SERVER_START: 'server:start',
  SERVER_STOP: 'server:stop',
  SERVER_RESTART: 'server:restart',
  SERVER_VALIDATE_PATHS: 'server:validate-paths',
  SERVER_LOGS_READ: 'server:logs-read',
} as const;

// Type-safe IPC API with generic result types
export interface IPCResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ElectronAPI {
  platform: string;
  version: string;
  
  // Config operations
  config: {
    get: () => Promise<IPCResult<Record<string, unknown>>>;
    save: (updates: Record<string, unknown>) => Promise<IPCResult<Record<string, unknown>>>;
    getActiveProfile: () => Promise<IPCResult<string | null>>;
    setActiveProfile: (profileId: string | null) => Promise<IPCResult<string | null>>;
  };
  
  // Profile operations
  profile: {
    getAll: () => Promise<IPCResult<Array<Record<string, unknown>>>>;
    create: (profileData: Record<string, unknown>) => Promise<IPCResult<Record<string, unknown>>>;
    update: (id: string, updates: Record<string, unknown>) => Promise<IPCResult<Record<string, unknown>>>;
    delete: (id: string) => Promise<IPCResult<void>>;
    updatePassword: (id: string, newPassword: string) => Promise<IPCResult<void>>;
    clearPassword: (id: string) => Promise<IPCResult<void>>;
  };

  // WoW operations
  wow: {
    launch: (wowPath: string) => Promise<IPCResult<{ executablePath: string }>>;
  };

  // Server operations
  server: {
    status: (paths: { realmdPath: string; mangosdPath: string }) => Promise<IPCResult<Array<Record<string, unknown>>>>;
    start: (paths: { realmdPath: string; mangosdPath: string; showConsole?: boolean }) => Promise<IPCResult<Array<Record<string, unknown>>>>;
    stop: (paths: { realmdPath: string; mangosdPath: string }) => Promise<IPCResult<Array<Record<string, unknown>>>>;
    restart: (paths: { realmdPath: string; mangosdPath: string; showConsole?: boolean }) => Promise<IPCResult<Array<Record<string, unknown>>>>;
    validatePaths: (paths: { realmdPath: string; mangosdPath: string }) => Promise<IPCResult<{ realmdPath: string; mangosdPath: string }>>;
    readLogs: (paths: { realmdPath: string; mangosdPath: string }) => Promise<IPCResult<Record<string, { stdout: string; stderr: string }>>>;
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
    save: (updates: Record<string, unknown>) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SAVE, updates),
    getActiveProfile: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET_ACTIVE_PROFILE),
    setActiveProfile: (profileId: string | null) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET_ACTIVE_PROFILE, profileId)
  },
  
  // Profile operations
  profile: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.PROFILE_GET_ALL),
    create: (profileData: Record<string, unknown>) => 
      ipcRenderer.invoke(IPC_CHANNELS.PROFILE_CREATE, profileData),
    update: (id: string, updates: Record<string, unknown>) => 
      ipcRenderer.invoke(IPC_CHANNELS.PROFILE_UPDATE, id, updates),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.PROFILE_DELETE, id),
    updatePassword: (id: string, newPassword: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.PROFILE_UPDATE_PASSWORD, id, newPassword),
    clearPassword: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.PROFILE_CLEAR_PASSWORD, id)
  },

  wow: {
    launch: (wowPath: string) => ipcRenderer.invoke(IPC_CHANNELS.WOW_LAUNCH, wowPath)
  },

  server: {
    status: (paths: { realmdPath: string; mangosdPath: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVER_STATUS, paths),
    start: (paths: { realmdPath: string; mangosdPath: string; showConsole?: boolean }) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVER_START, paths),
    stop: (paths: { realmdPath: string; mangosdPath: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVER_STOP, paths),
    restart: (paths: { realmdPath: string; mangosdPath: string; showConsole?: boolean }) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVER_RESTART, paths),
    validatePaths: (paths: { realmdPath: string; mangosdPath: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVER_VALIDATE_PATHS, paths),
    readLogs: (paths: { realmdPath: string; mangosdPath: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVER_LOGS_READ, paths)
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
