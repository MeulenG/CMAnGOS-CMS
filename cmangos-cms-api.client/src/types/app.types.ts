/**
 * Shared type definitions for the renderer process
 * These types mirror the Electron main process types for use in React components
 */

/**
 * WoW expansion types
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
  // Should not be encoded in any way, should be encrypted lmfao
  password: string;
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

export interface GameAccount {
  id: number;
  username: string;
  email: string;
  joindate: string;
  last_login?: string;
  expansion: number;
  mutetime: number;
  locale: string;
  gmlevel: number;
  locked: number;
}


export interface IPCResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
