import { v4 as uuidv4 } from 'uuid';
import { ServerProfile, Expansion, ConfigError } from '../types/config.types.js';
import { ConfigService } from './ConfigService.js';

export class ProfileService {
  constructor(private configService: ConfigService) {}

  async getAllProfiles(): Promise<ServerProfile[]> {
    const config = this.configService.getConfig();
    return [...config.profiles];
  }

  async getProfileById(id: string): Promise<ServerProfile | null> {
    const config = this.configService.getConfig();
    const profile = config.profiles.find(p => p.id === id);
    return profile ? { ...profile } : null;
  }

  async getActiveProfile(): Promise<ServerProfile | null> {
    const activeId = this.configService.getActiveProfileId();
    if (!activeId) return null;
    return this.getProfileById(activeId);
  }

  async createProfile(profileData: Omit<ServerProfile, 'id' | 'createdAt' | 'lastUsed'>): Promise<ServerProfile> {
    const config = this.configService.getConfig();

    // Validate profile name uniqueness
    const existingProfile = config.profiles.find(p => p.name === profileData.name);
    if (existingProfile) {
      throw new ConfigError(`Profile with name "${profileData.name}" already exists`);
    }

    const newProfile: ServerProfile = {
      ...profileData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    config.profiles.push(newProfile);
    await this.configService.updateConfig({ profiles: config.profiles });

    // If this is the first profile, set it as active
    if (config.profiles.length === 1) {
      await this.configService.setActiveProfileId(newProfile.id);
    }

    return { ...newProfile };
  }

  async updateProfile(id: string, updates: Partial<Omit<ServerProfile, 'id' | 'createdAt'>>): Promise<ServerProfile> {
    const config = this.configService.getConfig();
    const profileIndex = config.profiles.findIndex(p => p.id === id);

    if (profileIndex === -1) {
      throw new ConfigError(`Profile with id ${id} not found`);
    }

    // If name is being changed, check for uniqueness
    if (updates.name && updates.name !== config.profiles[profileIndex].name) {
      const existingProfile = config.profiles.find(p => p.name === updates.name && p.id !== id);
      if (existingProfile) {
        throw new ConfigError(`Profile with name "${updates.name}" already exists`);
      }
    }

    config.profiles[profileIndex] = {
      ...config.profiles[profileIndex],
      ...updates,
      lastUsed: new Date().toISOString()
    };

    await this.configService.updateConfig({ profiles: config.profiles });

    return { ...config.profiles[profileIndex] };
  }

  async deleteProfile(id: string): Promise<void> {
    const config = this.configService.getConfig();
    const profileIndex = config.profiles.findIndex(p => p.id === id);

    if (profileIndex === -1) {
      throw new ConfigError(`Profile with id ${id} not found`);
    }

    config.profiles.splice(profileIndex, 1);

    // If the deleted profile was active, clear the active profile
    if (config.activeProfileId === id) {
      const newActiveProfile = config.profiles.length > 0 ? config.profiles[0] : null;
      await this.configService.setActiveProfileId(newActiveProfile?.id || null);
    }

    await this.configService.updateConfig({ profiles: config.profiles });
  }

  async switchProfile(id: string): Promise<ServerProfile> {
    const profile = await this.getProfileById(id);
    if (!profile) {
      throw new ConfigError(`Profile with id ${id} not found`);
    }

    await this.configService.setActiveProfileId(id);
    return { ...profile };
  }

  async getProfilesByExpansion(expansion: Expansion): Promise<ServerProfile[]> {
    const config = this.configService.getConfig();
    return config.profiles.filter(p => p.expansion === expansion);
  }

  validateProfile(profile: Partial<ServerProfile>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!profile.name || profile.name.trim().length === 0) {
      errors.push('Profile name is required');
    }

    if (!profile.expansion) {
      errors.push('Expansion is required');
    }

    if (!profile.database) {
      errors.push('Database configuration is required');
    } else {
      if (!profile.database.host || profile.database.host.trim().length === 0) {
        errors.push('Database host is required');
      }

      if (!profile.database.port || profile.database.port < 1 || profile.database.port > 65535) {
        errors.push('Valid database port is required (1-65535)');
      }

      if (!profile.database.username || profile.database.username.trim().length === 0) {
        errors.push('Database username is required');
      }

      // Password can be empty for some MySQL configurations
    }

    if (!profile.wowPath || profile.wowPath.trim().length === 0) {
      errors.push('WoW client path is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async getProfileCount(): Promise<number> {
    const config = this.configService.getConfig();
    return config.profiles.length;
  }

  async profileNameExists(name: string, excludeId?: string): Promise<boolean> {
    const config = this.configService.getConfig();
    return config.profiles.some(p => p.name === name && p.id !== excludeId);
  }

  /**
   * Update the password for a specific profile
   */
  async updateProfilePassword(profileId: string, newPassword: string): Promise<void> {
    await this.configService.updateProfilePassword(profileId, newPassword);
  }

  /**
   * Clear the stored password for a specific profile
   */
  async clearProfilePassword(profileId: string): Promise<void> {
    await this.configService.clearProfilePassword(profileId);
  }
}
