import React, { useEffect, useState } from 'react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import type { ServerProcessStatus } from '../types/app.types';
import { postJson } from '../utils/api';
import '../components/AppLayout.css';

interface ServerDashboardProps {
  onNavigate?: (view: string) => void;
}

const ServerDashboard: React.FC<ServerDashboardProps> = ({ onNavigate }) => {
  const { activeProfile, loading } = useActiveProfile();
  const [serverStatus, setServerStatus] = useState<ServerProcessStatus[]>([]);
  const [serverBusy, setServerBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    let mounted = true;

    const loadStatus = async () => {
      try {
        const data = await postJson<ServerProcessStatus[]>('/server/status', {
          realmdPath: activeProfile.realmdPath,
          mangosdPath: activeProfile.mangosdPath
        });

        if (!mounted) {
          return;
        }

        setServerStatus(data);
        setServerError(null);
      } catch (error) {
        if (mounted) {
          setServerError((error as Error).message || 'Failed to load server status');
        }
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [activeProfile]);

  const handleServerAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!activeProfile) {
      return;
    }

    setServerBusy(true);
    setServerError(null);

    try {
      const payload = {
        realmdPath: activeProfile.realmdPath,
        mangosdPath: activeProfile.mangosdPath
      };
      const data = await postJson<ServerProcessStatus[]>(`/server/${action}`, payload);
      setServerStatus(data);
    } catch (error) {
      setServerError((error as Error).message || `Failed to ${action} server processes`);
    } finally {
      setServerBusy(false);
    }
  };

  const getStatusColor = (status?: ServerProcessStatus['status']) => {
    if (status === 'running') return '#66ff66';
    if (status === 'stopped') return '#ff6666';
    return '#ffaa00';
  };

  const renderServerStatus = (name: ServerProcessStatus['name']) => {
    const status = serverStatus.find((entry) => entry.name === name);
    const path = name === 'realmd' ? activeProfile?.realmdPath : activeProfile?.mangosdPath;
    const label = name === 'realmd' ? 'realmd.exe' : 'mangosd.exe';
    const display = !path?.trim()
      ? 'Not configured'
      : status?.status === 'running'
        ? 'Running'
        : status?.status === 'stopped'
          ? 'Stopped'
          : 'Unknown';

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ color: '#c9a84c' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: getStatusColor(status?.status), fontSize: '1.2rem' }}>●</span>
          <span style={{ color: '#8b8d95' }}>{display}</span>
        </div>
      </div>
    );
  };

  const newsItems = [
    {
      id: 'news-1',
      title: 'Realm Stability Improvements',
      description: 'Core process startup and reconnect handling has been refined for smoother uptime.',
      action: () => onNavigate?.('server-logs')
    },
    {
      id: 'news-2',
      title: 'Account Tools Refreshed',
      description: 'Open the account panel to manage new users, moderation, and GM level updates.',
      action: () => onNavigate?.('accounts')
    },
    {
      id: 'news-3',
      title: 'Latest Changelog Entries',
      description: 'Review newly published release notes and update details for your selected repository.',
      action: () => onNavigate?.('patchnotes')
    }
  ];

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
        <h1 className="view-title">Control Center</h1>
        <p className="view-subtitle">Welcome back, {activeProfile.name}</p>
      </div>

      <div className="card" style={{
        background: '#1c1e25',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#e4ce82', fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.15 }}>CMAnGOS Launcher</div>
            <p style={{ color: '#8b8d95', marginTop: '0.5rem', maxWidth: '620px' }}>
              Manage realms, launch the game client, and monitor process status from a unified desktop hub.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate?.('launch')}>
            Launch WoW
          </button>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ marginBottom: 0, minWidth: '300px', flex: '1 1 340px', background: '#16171d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="card-title">Server Status</div>
              <button className="btn btn-secondary btn-compact" onClick={() => onNavigate?.('server-logs')}>
                View Logs
              </button>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              {renderServerStatus('realmd')}
              {renderServerStatus('mangosd')}
            </div>
            {serverError && (
              <p style={{ color: '#ff8d8d', marginTop: '0.5rem', marginBottom: 0 }}>{serverError}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-compact"
                onClick={() => handleServerAction('start')}
                disabled={serverBusy || !activeProfile.realmdPath.trim() || !activeProfile.mangosdPath.trim()}
              >
                Start
              </button>
              <button
                className="btn btn-secondary btn-compact"
                onClick={() => handleServerAction('stop')}
                disabled={serverBusy || !activeProfile.realmdPath.trim() || !activeProfile.mangosdPath.trim()}
              >
                Stop
              </button>
              <button
                className="btn btn-primary btn-compact"
                onClick={() => handleServerAction('restart')}
                disabled={serverBusy || !activeProfile.realmdPath.trim() || !activeProfile.mangosdPath.trim()}
              >
                Restart
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0, minWidth: '300px', flex: '1 1 300px', background: '#16171d' }}>
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => onNavigate?.('launch')}>Play Now</button>
              <button className="btn btn-secondary" onClick={() => onNavigate?.('accounts')}>Accounts</button>
              <button className="btn btn-secondary" onClick={() => onNavigate?.('patchnotes')}>Changelogs</button>
              <button className="btn btn-secondary" onClick={() => onNavigate?.('settings')}>Settings</button>
            </div>
            <p style={{ marginTop: '0.75rem', color: '#8b8d95' }}>
              Realm: {activeProfile.database.host}:{activeProfile.database.port}
            </p>
          </div>
        </div>
      </div>

      <div className="grid-3">
        {newsItems.map((item, index) => (
          <div key={item.id} className="card" style={{ marginBottom: 0 }}>
            <div style={{
              height: '110px',
              borderRadius: '6px',
              marginBottom: '0.75rem',
              background: index === 0
                ? 'linear-gradient(135deg, #3d2520 0%, #261a1d 100%)'
                : index === 1
                  ? 'linear-gradient(135deg, #1e2a3d 0%, #171d2a 100%)'
                  : 'linear-gradient(135deg, #2a2338 0%, #1c1826 100%)'
            }} />
            <div style={{ color: '#8b8d95', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              CMANGOS UPDATE
            </div>
            <div style={{ color: '#dcdee3', fontSize: '0.92rem', fontWeight: 600, marginTop: '0.3rem' }}>
              {item.title}
            </div>
            <p style={{ color: '#6b6d75', marginTop: '0.4rem', lineHeight: 1.5, fontSize: '0.8rem' }}>
              {item.description}
            </p>
            <button className="btn btn-secondary btn-compact" onClick={item.action}>
              Learn More
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Recent Activity</div>
        <p style={{ color: '#6b6d75', fontStyle: 'italic' }}>
          No recent activity has been recorded for this profile yet.
        </p>
      </div>
    </div>
  );
};

export default ServerDashboard;
