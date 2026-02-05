import { app } from 'electron';
import keytar from 'keytar';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AppConfig, AppSettings, ConfigError } from '../types/config.types.js';

export class ConfigService {
  private configPath: string;
  private config: AppConfig | null = null;
  private readonly KEYTAR_SERVICE = 'CMAnGOS-CMS-API';
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
      const updatedProfiles: AppConfig['profiles'] = [];

      for (const profile of parsedConfig.profiles) {
        const existingKey = profile.database.passwordKey;
        const defaultKey = this.getPasswordKey(profile.id);
        const passwordKey = existingKey ?? defaultKey;

        let resolvedPassword = '';

        if (existingKey) {
          const storedPassword = await keytar.getPassword(this.KEYTAR_SERVICE, existingKey);
          if (!storedPassword) {
            throw new ConfigError('Stored credentials are missing. Please re-enter your database password.');
          }
          resolvedPassword = storedPassword;
        }

        updatedProfiles.push({
          ...profile,
          database: {
            ...profile.database,
            password: resolvedPassword,
            passwordKey
          }
        });
      }

      this.config = {
        ...parsedConfig,
        profiles: updatedProfiles
      };

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
      const profilesToSave: AppConfig['profiles'] = [];

      for (const profile of this.config.profiles) {
        const password = profile.database.password ?? '';
        const passwordKey = profile.database.passwordKey ?? this.getPasswordKey(profile.id);

        if (password) {
          await keytar.setPassword(this.KEYTAR_SERVICE, passwordKey, password);
        } else if (profile.database.passwordKey) {
          await keytar.deletePassword(this.KEYTAR_SERVICE, passwordKey);
        }

        profilesToSave.push({
          ...profile,
          database: {
            ...profile.database,
            password: '',
            passwordKey
          }
        });
      }

      const configToSave: AppConfig = {
        ...this.config,
        profiles: profilesToSave
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


  private getPasswordKey(profileId: string): string {
    return `db-password:${profileId}`;
  }

  async resetConfig(): Promise<void> {
    this.config = { ...this.DEFAULT_CONFIG };
    await this.saveConfig();
  }

  getConfigPath(): string {
    return this.configPath;
  }
}
