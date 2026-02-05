/**
 * Configuration types for CMAnGOS Desktop Application
 */

export const Expansion = {
  CLASSIC: 'classic',
  TBC: 'tbc',
  WOTLK: 'wotlk'
} as const;

export type Expansion = typeof Expansion[keyof typeof Expansion];

export const ExpansionLabels: Record<Expansion, string> = {
  [Expansion.CLASSIC]: 'Classic World of Warcraft',
  [Expansion.TBC]: 'The Burning Crusade',
  [Expansion.WOTLK]: 'Wrath of the Lich King'
};

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  passwordKey?: string; // Keychain reference for stored password
}

export interface ServerProfile {
  id: string;
  name: string;
  expansion: Expansion;
  database: DatabaseConfig;
  wowPath: string;
  createdAt: string;
  lastUsed: string;
}

export interface AppSettings {
  autoUpdate: boolean;
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  checkUpdatesOnStartup: boolean;
}

export interface AppConfig {
  version: string;
  activeProfileId: string | null;
  profiles: ServerProfile[];
  settings: AppSettings;
  onboardingCompleted: boolean;
}

export interface DatabaseValidationResult {
  success: boolean;
  message: string;
  missingDatabases?: string[];
}

export interface WowValidationResult {
  success: boolean;
  message: string;
  version?: string;
  executablePath?: string;
}

// IPC Channel names
export const IPC_CHANNELS = {
  // Config operations
  CONFIG_GET: 'config:get',
  CONFIG_SAVE: 'config:save',
  CONFIG_GET_ACTIVE_PROFILE: 'config:get-active-profile',
  CONFIG_SET_ACTIVE_PROFILE: 'config:set-active-profile',
  
  // Profile operations
  PROFILE_CREATE: 'profile:create',
  PROFILE_UPDATE: 'profile:update',
  PROFILE_DELETE: 'profile:delete',
  PROFILE_GET_ALL: 'profile:get-all',
  
  // Database operations
  DATABASE_TEST_CONNECTION: 'database:test-connection',
  DATABASE_VALIDATE: 'database:validate',
  
  // WoW client operations
  WOW_VALIDATE_PATH: 'wow:validate-path',
  WOW_LAUNCH: 'wow:launch',
  WOW_BROWSE_PATH: 'wow:browse-path',
  
  // Update operations
  UPDATE_CHECK: 'update:check',
  UPDATE_DOWNLOAD: 'update:download',
  UPDATE_INSTALL: 'update:install',
  
  // Patch notes
  PATCH_NOTES_FETCH: 'patch-notes:fetch',
  
  // Backend operations
  BACKEND_START: 'backend:start',
  BACKEND_STOP: 'backend:stop',
  BACKEND_STATUS: 'backend:status'
} as const;

export type IpcChannelName = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];

// Error types
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class WowClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WowClientError';
  }
}
