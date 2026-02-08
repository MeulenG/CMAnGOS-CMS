import React from 'react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import '../components/AppLayout.css';

interface ServerDashboardProps {
  onNavigate?: (view: string) => void;
}

const ServerDashboard: React.FC<ServerDashboardProps> = ({ onNavigate }) => {
  const { activeProfile, loading } = useActiveProfile();
  const rawMapUrl = (import.meta.env.VITE_CLASSIC_MANGOS_MAP_URL ?? '').trim();
  const mapUrl = (() => {
    if (!rawMapUrl) {
      return '';
    }
    try {
      const parsedUrl = new URL(rawMapUrl);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        return parsedUrl.toString();
      }
    } catch {
      return '';
    }
    return '';
  })();
  const hasMapUrl = mapUrl.length > 0;
  const mapCard = (
    <div className="card">
      <div className="card-title">ClassicMangosMap</div>
      {hasMapUrl ? (
        <>
          <div
            style={{
              border: '1px solid rgba(212, 162, 52, 0.3)',
              borderRadius: '6px',
              overflow: 'hidden',
              height: '360px',
              marginBottom: '1rem'
            }}
          >
            <iframe
              title="ClassicMangosMap"
              src={mapUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              loading="lazy"
              sandbox="allow-scripts"
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => window.open(mapUrl, '_blank', 'noopener,noreferrer')}
          >
            Open Full Map
          </button>
        </>
      ) : (
        <p style={{ color: '#b89968', margin: 0 }}>
          Set VITE_CLASSIC_MANGOS_MAP_URL to the URL of your ClassicMangosMap instance to show it here.
        </p>
      )}
    </div>
  );

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
        {mapCard}
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

      {mapCard}

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
