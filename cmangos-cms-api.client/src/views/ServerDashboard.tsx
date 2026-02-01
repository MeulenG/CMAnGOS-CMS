import React, { useState, useEffect } from 'react';
import '../components/AppLayout.css';

interface ServerDashboardProps {
  onNavigate?: (view: string) => void;
}

const ServerDashboard: React.FC<ServerDashboardProps> = ({ onNavigate }) => {
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveProfile();
  }, []);

  const loadActiveProfile = async () => {
    try {
      const activeIdResult = await window.electronAPI.config.getActiveProfile();
      if (activeIdResult.success && activeIdResult.data) {
        const profilesResult = await window.electronAPI.profile.getAll();
        if (profilesResult.success && profilesResult.data) {
          const profile = profilesResult.data.find((p: any) => p.id === activeIdResult.data);
          setActiveProfile(profile || null);
        }
      }
    } catch (error) {
      console.error('Failed to load active profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-content">
        <div className="view-header">
          <h1 className="view-title">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="app-content">
        <div className="view-header">
          <h1 className="view-title">No Active Profile</h1>
          <p className="view-subtitle">Please select or create a server profile to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="view-header">
        <h1 className="view-title">Dashboard</h1>
        <p className="view-subtitle">Welcome to {activeProfile.name}</p>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">Server Status</div>
          <div style={{ fontSize: '2rem', textAlign: 'center', margin: '1rem 0' }}>
            <span style={{ color: '#66ff66' }}>●</span>
          </div>
          <p style={{ textAlign: 'center', color: '#b89968', margin: 0 }}>
            Backend Online
          </p>
        </div>

        <div className="card">
          <div className="card-title">Database</div>
          <div style={{ color: '#b89968', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Host:</strong> {activeProfile.database.host}:{activeProfile.database.port}
            </div>
            <div>
              <strong>User:</strong> {activeProfile.database.username}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">WoW Client</div>
          <div style={{ color: '#b89968', fontSize: '0.9rem', wordBreak: 'break-all' }}>
            {activeProfile.wowPath}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Quick Actions</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate?.('launch')}>Launch WoW</button>
          <button className="btn btn-secondary" onClick={() => onNavigate?.('accounts')}>Create Account</button>
          <button className="btn btn-secondary" onClick={() => onNavigate?.('patchnotes')}>View Patch Notes</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent Activity</div>
        <p style={{ color: '#b89968', fontStyle: 'italic' }}>
          No recent activity to display
        </p>
      </div>
    </div>
  );
};

export default ServerDashboard;
