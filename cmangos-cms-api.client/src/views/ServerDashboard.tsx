import React, { useEffect, useState } from 'react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import type { ServerProcessStatus } from '../types/app.types';
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
        const result = await window.electronAPI.server.status({
          realmdPath: activeProfile.realmdPath,
          mangosdPath: activeProfile.mangosdPath
        });

        if (!mounted) {
          return;
        }

        if (result.success && result.data) {
          setServerStatus(result.data as ServerProcessStatus[]);
          setServerError(null);
        } else {
          setServerError(result.error || 'Failed to load server status');
        }
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
      const result = await window.electronAPI.server[action](payload);

      if (result.success && result.data) {
        setServerStatus(result.data as ServerProcessStatus[]);
      } else {
        setServerError(result.error || `Failed to ${action} server processes`);
      }
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
        <div style={{ color: '#d4a234' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: getStatusColor(status?.status), fontSize: '1.2rem' }}>●</span>
          <span style={{ color: '#b89968' }}>{display}</span>
        </div>
      </div>
    );
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
        <div className="card server-control-card">
          <div className="server-control-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="card-title">Server Control</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
              <button
                className="btn btn-secondary btn-compact server-control-view-logs"
                onClick={() => onNavigate?.('server-logs')}
                style={{
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.65rem',
                  letterSpacing: '0.01em',
                  lineHeight: 1.1,
                  minWidth: 0,
                  width: 'fit-content',
                  alignSelf: 'flex-start'
                }}
              >
                View Logs
              </button>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            {renderServerStatus('realmd')}
            {renderServerStatus('mangosd')}
          </div>
          {serverError && (
            <p style={{ color: '#ff6666', marginTop: '0.5rem', marginBottom: 0 }}>{serverError}</p>
          )}
          <div className="server-control-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
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
