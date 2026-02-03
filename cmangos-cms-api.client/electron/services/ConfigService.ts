import { app, safeStorage } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AppConfig, AppSettings, ConfigError } from '../types/config.types.js';

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

  async initialize(): Promise<void> {
    try {
      await this.loadConfig();
    } catch (error) {
      console.error('Failed to load config, creating default:', error);
      this.config = { ...this.DEFAULT_CONFIG };
      await this.saveConfig();
    }
  }

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

  getConfig(): AppConfig {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }
    return { ...this.config };
  }

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

  getActiveProfileId(): string | null {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }
    return this.config.activeProfileId;
  }

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

  getSettings(): AppSettings {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }
    return { ...this.config.settings };
  }

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

  isOnboardingCompleted(): boolean {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }
    return this.config.onboardingCompleted;
  }

  async completeOnboarding(): Promise<void> {
    if (!this.config) {
      throw new ConfigError('Configuration not initialized');
    }

    this.config.onboardingCompleted = true;
    await this.saveConfig();
  }


  private encryptPassword(password: string): string {
    if (!password) return '';
    
    if (!safeStorage.isEncryptionAvailable()) {
      // WARNING: This is NOT encryption and provides no security.
      // The password is effectively stored in plain text, only base64-encoded.
      console.warn('WARNING: Password encryption not available; storing password in plain text (only base64-encoded, provides no security)');
      return Buffer.from(password).toString('base64');
    }

    const encrypted = safeStorage.encryptString(password);
    return encrypted.toString('base64');
  }

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
      console.error('Failed to decrypt password. This may indicate that saved credentials are no longer valid or cannot be decrypted on this system. Prompt the user to re-enter their database credentials.', {
        error,
        isEncryptionAvailable: safeStorage.isEncryptionAvailable(),
        encryptedPasswordPreview: encryptedPassword.slice(0, 8)
      });
      throw new ConfigError('Failed to decrypt saved credentials. Please re-enter your database password.');
    }
  }

  async resetConfig(): Promise<void> {
    this.config = { ...this.DEFAULT_CONFIG };
    await this.saveConfig();
  }

  getConfigPath(): string {
    return this.configPath;
  }
}
