import React, { useState, useEffect } from 'react';
import type { ServerProfile } from '../types/app.types';
import { ExpansionLabels } from '../types/app.types';
import '../components/AppLayout.css';

const AppSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'github' | 'profiles' | 'app'>('github');
  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [githubRepo, setGithubRepo] = useState({ owner: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [editingPassword, setEditingPassword] = useState<{ profileId: string; profileName: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadProfiles();
    loadSettings();
  }, []);

  const loadProfiles = async () => {
    try {
      const loadedProfiles = await window.electronAPI.profile.getAll();
      if (loadedProfiles.success && loadedProfiles.data) {
        setProfiles(loadedProfiles.data as unknown as ServerProfile[]);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const loadSettings = async () => {
    try {
      await window.electronAPI.config.get();
      // TODO: Load GitHub settings from config
      // setGithubRepo({ owner: config.githubOwner || '', name: config.githubRepo || '' });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile? This cannot be undone.')) {
      return;
    }

    try {
      await window.electronAPI.profile.delete(id);
      await loadProfiles();
      alert('Profile deleted successfully');
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Failed to delete profile: ' + (error as Error).message);
    }
  };

  const handleEditPassword = (profileId: string, profileName: string) => {
    setEditingPassword({ profileId, profileName });
    setNewPassword('');
  };

  const handleSavePassword = async () => {
    if (!editingPassword) return;

    try {
      const result = await window.electronAPI.profile.updatePassword(editingPassword.profileId, newPassword);
      if (result.success) {
        alert('Password updated successfully');
        setEditingPassword(null);
        setNewPassword('');
      } else {
        alert('Failed to update password: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      alert('Failed to update password: ' + (error as Error).message);
    }
  };

  const handleCancelPasswordEdit = () => {
    setEditingPassword(null);
    setNewPassword('');
  };

  const handleSaveGithubSettings = async () => {
    setSaving(true);
    try {
      // TODO: Save GitHub settings to config
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-content">
      <div className="view-header">
        <h1 className="view-title">Settings</h1>
        <p className="view-subtitle">Configure your application</p>
      </div>

      <div className="settings-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`settings-tab ${activeTab === 'app' ? 'active' : ''}`}
          onClick={() => setActiveTab('app')}
        >
          Application
        </button>
        <button
          className={`settings-tab ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          Profiles
        </button>
        <button
          className={`settings-tab ${activeTab === 'github' ? 'active' : ''}`}
          onClick={() => setActiveTab('github')}
        >
          GitHub
        </button>
      </div>

      {activeTab === 'app' && (
        <div className="card">
          <div className="card-title">Application Settings</div>
          <div className="form-group">
            <label className="form-label">Theme</label>
            <select className="form-input" defaultValue="dark">
              <option value="dark">Dark (WoW Theme)</option>
            </select>
            <p className="form-help">Currently only the WoW dark theme is available</p>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input type="checkbox" defaultChecked style={{ marginRight: '0.5rem' }} />
              Launch on system startup
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input type="checkbox" defaultChecked style={{ marginRight: '0.5rem' }} />
              Minimize to system tray
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input type="checkbox" style={{ marginRight: '0.5rem' }} />
              Check for updates automatically
            </label>
          </div>

          <button className="btn btn-primary">Save Settings</button>
        </div>
      )}

      {activeTab === 'profiles' && (
        <>
          <div className="card">
            <div className="card-title">Server Profiles</div>
            <p style={{ color: '#b89968', marginBottom: '1.5rem' }}>
              Manage your server profiles. You can edit or delete existing profiles here.
            </p>

            {profiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#b89968' }}>
                <p>No profiles configured</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(212, 162, 52, 0.3)',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ color: '#d4a234', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {profile.name}
                      </div>
                      <div style={{ color: '#b89968', fontSize: '0.9rem' }}>
                        {ExpansionLabels[profile.expansion]} • {profile.database.host}:{profile.database.port}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.85rem' }}
                        onClick={() => handleEditPassword(profile.id, profile.name)}
                      >
                        Edit Password
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '0.85rem' }}
                        onClick={() => handleDeleteProfile(profile.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary">
            + Create New Profile
          </button>
        </>
      )}

      {activeTab === 'github' && (
        <div className="card">
          <div className="card-title">GitHub Integration</div>
          <p style={{ color: '#b89968', marginBottom: '1.5rem' }}>
            Configure the GitHub repository for patch notes and updates.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="github-owner">Repository Owner</label>
            <input
              id="github-owner"
              type="text"
              className="form-input"
              placeholder="e.g., cmangos"
              value={githubRepo.owner}
              onChange={(e) => setGithubRepo({ ...githubRepo, owner: e.target.value })}
            />
            <p className="form-help">The GitHub username or organization that owns the repository</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="github-repo">Repository Name</label>
            <input
              id="github-repo"
              type="text"
              className="form-input"
              placeholder="e.g., mangos-classic"
              value={githubRepo.name}
              onChange={(e) => setGithubRepo({ ...githubRepo, name: e.target.value })}
            />
            <p className="form-help">The name of the repository to fetch releases from</p>
          </div>

          <div style={{
            background: 'rgba(212, 162, 52, 0.1)',
            border: '1px solid rgba(212, 162, 52, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ color: '#d4a234', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              ℹ️ About GitHub Integration
            </div>
            <div style={{ color: '#b89968', fontSize: '0.9rem', lineHeight: 1.6 }}>
              The patch notes feature fetches releases from the specified GitHub repository.
              This allows you to display server updates and changes directly in the application.
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSaveGithubSettings}
            disabled={saving || !githubRepo.owner || !githubRepo.name}
          >
            {saving ? (
              <>
                <span className="loading-spinner" style={{ marginRight: '0.5rem' }} />
                Saving...
              </>
            ) : (
              'Save GitHub Settings'
            )}
          </button>
        </div>
      )}

      {/* Password Edit Modal */}
      {editingPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(30, 30, 40, 0.95))',
            border: '2px solid rgba(212, 162, 52, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ 
              color: '#d4a234', 
              fontFamily: 'Cinzel, serif',
              marginBottom: '0.5rem',
              fontSize: '1.5rem'
            }}>
              Update Database Password
            </h2>
            <p style={{ color: '#b89968', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Profile: {editingPassword.profileName}
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new database password"
                autoFocus
              />
              <p style={{ color: '#b89968', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Leave empty to remove the stored password
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleSavePassword}
                style={{ flex: 1 }}
              >
                Save Password
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelPasswordEdit}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .settings-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid rgba(212, 162, 52, 0.2);
        }

        .settings-tab {
          background: transparent;
          border: none;
          color: #b89968;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-size: 1rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .settings-tab:hover {
          color: #d4a234;
        }

        .settings-tab.active {
          color: #d4a234;
        }

        .settings-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #d4a234;
        }

        .form-help {
          color: #b89968;
          fontSize: 0.85rem;
          marginTop: 0.25rem;
        }

        .btn-danger {
          background: rgba(180, 50, 50, 0.2);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        .btn-danger:hover {
          background: rgba(180, 50, 50, 0.3);
          border-color: #e74c3c;
        }
      `}</style>
    </div>
  );
};

export default AppSettings;
