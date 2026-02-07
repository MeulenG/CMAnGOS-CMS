import React, { useState, useEffect } from 'react';
import type { ServerProfile } from '../types/app.types';
import { ExpansionLabels } from '../types/app.types';
import { getJson, postJson } from '../utils/api';
import './AppLayout.css';

interface ProfileSwitcherProps {
  onAddProfile: () => void;
}

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ onAddProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ServerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const loadedProfiles = await getJson<ServerProfile[]>('/profile');
      setProfiles(loadedProfiles);

      // Get active profile from config
      const config = await getJson<{ activeProfileId: string | null }>('/config/active-profile');
      const active = loadedProfiles.find(p => p.id === config.activeProfileId);
      setActiveProfile(active || loadedProfiles[0] || null);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profileId: string) => {
    setIsOpen(false);
    
    try {
      // Switch to selected profile
      await postJson<{ activeProfileId: string | null }>('/config/active-profile', {
        activeProfileId: profileId
      });
      await loadProfiles();
    } catch (error) {
      console.error('Failed to switch profile:', error);
    }
  };

  const handleAddProfile = () => {
    setIsOpen(false);
    onAddProfile();
  };

  if (loading) {
    return (
      <div className="profile-switcher">
        <div className="profile-switcher-button">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!activeProfile && profiles.length === 0) {
    return (
      <div className="profile-switcher">
        <button className="profile-switcher-button" onClick={handleAddProfile}>
          <span>+ Add Profile</span>
        </button>
      </div>
    );
  }

  return (
    <div className="profile-switcher">
      <button
        className="profile-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{activeProfile ? activeProfile.name : 'Select Profile'}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="profile-switcher-dropdown">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`profile-option ${profile.id === activeProfile?.id ? 'active' : ''}`}
              onClick={() => handleSelectProfile(profile.id)}
            >
              <div className="profile-option-name">{profile.name}</div>
              <div className="profile-option-expansion">
                {ExpansionLabels[profile.expansion]}
              </div>
            </div>
          ))}
          
          {profiles.length > 0 && <div className="profile-divider" />}
          
          <div className="profile-option" onClick={handleAddProfile}>
            <div className="profile-option-name">+ Add New Profile</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;
