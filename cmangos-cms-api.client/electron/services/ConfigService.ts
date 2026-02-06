import { app, safeStorage } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AppConfig, AppSettings, ConfigError } from '../types/config.types.js';

export class ConfigService {
  private configPath: string;
  private secureStoragePath: string;
  private config: AppConfig | null = null;
  private secureStorageLock: Promise<void> = Promise.resolve();
  private readonly MAX_STORAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_PASSWORD_LENGTH = 1000;
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
    this.secureStoragePath = path.join(userDataPath, 'secure-storage.json');
  }

  async initialize(): Promise<void> {
    // Check if encryption is available early to provide better error messages
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Encryption is not available. The application may not function correctly without secure password storage.');
      // Continue initialization but warn about missing encryption
    }

    try {
      await this.loadConfig();
    } catch (error) {
      console.error('Failed to load config, creating default:', error);
      this.config = { ...this.DEFAULT_CONFIG };
      await this.saveConfig();
    }
  }

  private checkEncryptionAvailable(): void {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new ConfigError(
        'Encryption is not available on this system. Electron\'s safeStorage requires a graphical user session and is not compatible with headless or server environments. ' +
        'On Linux, ensure the Secret Service API (gnome-keyring or ksecretservice) is installed and running. ' +
        'On Windows, DPAPI should be available by default. On macOS, Keychain should be available by default. ' +
        'If you need to run this application in a headless environment, secure storage features will be unavailable.'
      );
    }
  }

  private async loadSecureStorage(): Promise<Record<string, string>> {
    try {
      const stats = await fs.stat(this.secureStoragePath);
      
      // Prevent resource exhaustion by checking file size
      if (stats.size > this.MAX_STORAGE_FILE_SIZE) {
        throw new ConfigError(`Secure storage file is too large (${stats.size} bytes). Maximum allowed is ${this.MAX_STORAGE_FILE_SIZE} bytes.`);
      }

      const data = await fs.readFile(this.secureStoragePath, 'utf-8');
      
      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch (parseError) {
        throw new ConfigError(`Failed to parse secure storage file: ${(parseError as Error).message}. The file may be corrupted.`);
      }

      // Validate the parsed structure
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new ConfigError('Secure storage file has invalid structure. Expected an object with string keys and values.');
      }

      const storage = parsed as Record<string, unknown>;
      
      // Validate all keys and values are strings
      for (const [key, value] of Object.entries(storage)) {
        if (typeof key !== 'string' || typeof value !== 'string') {
          throw new ConfigError(`Secure storage file has invalid data. All keys and values must be strings.`);
        }
      }

      return storage as Record<string, string>;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  private async saveSecureStorage(storage: Record<string, string>): Promise<void> {
    // Serialize the lock to prevent race conditions
    this.secureStorageLock = this.secureStorageLock.then(async () => {
      const storageDir = path.dirname(this.secureStoragePath);
      await fs.mkdir(storageDir, { recursive: true });
      
      // Write to a temporary file first for atomicity
      const tempPath = `${this.secureStoragePath}.tmp`;
      const content = JSON.stringify(storage, null, 2);
      
      try {
        // Write with restrictive permissions from the start (Unix-like systems)
        await fs.writeFile(tempPath, content, { encoding: 'utf-8', mode: 0o600 });
      } catch (error) {
        // If mode option fails (e.g., on Windows), write normally
        await fs.writeFile(tempPath, content, 'utf-8');
      }
      
      // Set restrictive permissions if not set during write
      try {
        await fs.chmod(tempPath, 0o600);
      } catch (error) {
        // chmod may fail on Windows or other platforms, but that's acceptable
        console.warn('Failed to set restrictive file permissions on secure storage; continuing without changing permissions.');
      }
      
      // Atomically rename temp file to target file
      await fs.rename(tempPath, this.secureStoragePath);
    });

    await this.secureStorageLock;
  }

  private async getEncryptedPassword(key: string): Promise<string | null> {
    const storage = await this.loadSecureStorage();
    const encryptedHex = storage[key];
    if (!encryptedHex) {
      return null;
    }

    this.checkEncryptionAvailable();

    try {
      const encrypted = Buffer.from(encryptedHex, 'hex');
      return safeStorage.decryptString(encrypted);
    } catch (error) {
      throw new ConfigError(`Failed to decrypt password: ${(error as Error).message}`);
    }
  }

  private async setEncryptedPassword(key: string, password: string): Promise<void> {
    // Validate password input
    if (password === '') {
      throw new ConfigError('Password cannot be empty');
    }

    if (password.length > this.MAX_PASSWORD_LENGTH) {
      throw new ConfigError(`Password is too long. Maximum length is ${this.MAX_PASSWORD_LENGTH} characters.`);
    }

    // Validate key to prevent injection issues
    if (!key || typeof key !== 'string' || key.includes('\0') || key.includes('/')) {
      throw new ConfigError('Invalid password key format');
    }

    this.checkEncryptionAvailable();

    const encrypted = safeStorage.encryptString(password);
    const encryptedHex = encrypted.toString('hex');

    const storage = await this.loadSecureStorage();
    storage[key] = encryptedHex;
    await this.saveSecureStorage(storage);
  }

  private async deleteEncryptedPassword(key: string): Promise<void> {
    const storage = await this.loadSecureStorage();
    delete storage[key];
    await this.saveSecureStorage(storage);
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
          const storedPassword = await this.getEncryptedPassword(existingKey);
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
          await this.setEncryptedPassword(passwordKey, password);
        } else if (profile.database.passwordKey) {
          await this.deleteEncryptedPassword(passwordKey);
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
