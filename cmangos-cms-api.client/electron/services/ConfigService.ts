import { app, safeStorage } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AppConfig, AppSettings, Expansion, ConfigError } from '../types/config.types.js';

/**
 * ConfigService - Manages application configuration and persistent storage
 * Handles reading, writing, and encryption of sensitive data
 */
export class ConfigService {
  private configPath: string;
  private config: AppConfig | null = null;
  private readonly DEFAULT_CONFIG: AppConfig = {
    version: '1.0.0',
    activeProfileId: null,
    profiles: [],
    settings: {
      autoUpdate: true,
      launchOnStartup: false,
      minimizeToTray: true,
      checkUpdatesOnStartup: true
    },
    onboardingCompleted: false
  };

  constructor() {
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'config.json');
  }

  /**
   * Initialize the config service and load existing configuration
   */
  async initialize(): Promise<void> {
    try {
      await this.loadConfig();
    } catch (error) {
      console.error('Failed to load config, creating default:', error);
      this.config = { ...this.DEFAULT_CONFIG };
      await this.saveConfig();
    }
  }

  /**
   * Load configuration from disk
   */
  private async loadConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      const parsedConfig = JSON.parse(configData) as AppConfig;
      
      // Decrypt passwords for all profiles
      parsedConfig.profiles = parsedConfig.profiles.map(profile => ({
        ...profile,
        database: {
          ...profile.database,
          password: this.decryptPassword(profile.database.password)
        }
      }));
      
      this.config = parsedConfig;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, use default config
        this.config = { ...this.DEFAULT_CONFIG };
      } else {
        throw new ConfigError(`Failed to load configuration: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Save configuration to disk
   */
  async saveConfig(): Promise<void> {
    if (!this.config) {
      throw new ConfigError('No configuration to save');
    }

    try {
      // Encrypt passwords before saving
      const configToSave: AppConfig = {
        ...this.config,
        profiles: this.config.profiles.map(profile => ({
          ...profile,
          database: {
            ...profile.database,
            password: this.encryptPassword(profile.database.password)
          }
        }))
      };

      const configDir = path.dirname(this.configPath);
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(configToSave, null, 2), 'utf-8');
    } catch (error) {
      throw new ConfigError(`Failed to save configuration: ${(error as Error).message}`);
    }
  }

  /**
   * Get the entire configuration
   */
  getConfig(): AppConfig {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }

    this.config = {
      ...this.config,
      ...updates
    };

    await this.saveConfig();
  }

  /**
   * Get active profile ID
   */
  getActiveProfileId(): string | null {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }
    return this.config.activeProfileId;
  }

  /**
   * Set active profile
   */
  async setActiveProfileId(profileId: string | null): Promise<void> {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }

    if (profileId !== null) {
      const profile = this.config.profiles.find(p => p.id === profileId);
      if (!profile) {
        throw new ConfigError(`Profile with id ${profileId} not found`);
      }
      
      // Update lastUsed timestamp
      profile.lastUsed = new Date().toISOString();
    }

    this.config.activeProfileId = profileId;
    await this.saveConfig();
  }

  /**
   * Get application settings
   */
  getSettings(): AppSettings {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }
    return { ...this.config.settings };
  }

  /**
   * Update application settings
   */
  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }

    this.config.settings = {
      ...this.config.settings,
      ...settings
    };

    await this.saveConfig();
  }

  /**
   * Check if onboarding is completed
   */
  isOnboardingCompleted(): boolean {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }
    return this.config.onboardingCompleted;
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }

    this.config.onboardingCompleted = true;
    await this.saveConfig();
  }

  /**
   * Encrypt a password using Electron's safeStorage
   */
  private encryptPassword(password: string): string {
    if (!password) return '';
    
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Encryption not available, storing password in base64');
      return Buffer.from(password).toString('base64');
    }

    const encrypted = safeStorage.encryptString(password);
    return encrypted.toString('base64');
  }

  /**
   * Decrypt a password using Electron's safeStorage
   */
  private decryptPassword(encryptedPassword: string): string {
    if (!encryptedPassword) return '';

    try {
      const buffer = Buffer.from(encryptedPassword, 'base64');
      
      if (!safeStorage.isEncryptionAvailable()) {
        // Password was stored in base64
        return buffer.toString('utf-8');
      }

      return safeStorage.decryptString(buffer);
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      return '';
    }
  }

  /**
   * Reset configuration to defaults (for testing/debugging)
   */
  async resetConfig(): Promise<void> {
    this.config = { ...this.DEFAULT_CONFIG };
    await this.saveConfig();
  }

  /**
   * Get the configuration file path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}
