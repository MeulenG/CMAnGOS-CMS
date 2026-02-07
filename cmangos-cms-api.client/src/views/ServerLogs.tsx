import React, { useEffect, useState } from 'react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import type { ServerLogsSnapshot, ServerProcessStatus } from '../types/app.types';
import '../components/AppLayout.css';

interface ServerLogsProps {
  onNavigate?: (view: string) => void;
}

type LogStream = 'stdout' | 'stderr';

type ProcessName = 'realmd' | 'mangosd';

const ServerLogs: React.FC<ServerLogsProps> = ({ onNavigate }) => {
  const { activeProfile, loading } = useActiveProfile();
  const [logs, setLogs] = useState<ServerLogsSnapshot | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerProcessStatus[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverBusy, setServerBusy] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [activeProcess, setActiveProcess] = useState<ProcessName>('realmd');
  const [activeStream, setActiveStream] = useState<LogStream>('stdout');

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

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    let mounted = true;

    const loadLogs = async () => {
      try {
        const result = await window.electronAPI.server.readLogs({
          realmdPath: activeProfile.realmdPath,
          mangosdPath: activeProfile.mangosdPath
        });

        if (!mounted) {
          return;
        }

        if (result.success && result.data) {
          setLogs(result.data as ServerLogsSnapshot);
        } else {
          setServerError(result.error || 'Failed to load logs');
        }
      } catch (error) {
        if (mounted) {
          setServerError((error as Error).message || 'Failed to load logs');
        }
      }
    };

    loadLogs();
    const interval = setInterval(loadLogs, 2000);

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
        mangosdPath: activeProfile.mangosdPath,
        showConsole: action !== 'stop' ? showConsole : undefined
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

  const getStatusLabel = (name: ProcessName) => {
    const status = serverStatus.find((entry) => entry.name === name);
    if (!status) {
      return 'Unknown';
    }
    return status.status === 'running' ? 'Running' : status.status === 'stopped' ? 'Stopped' : 'Unknown';
  };

  const currentLogs = logs?.[activeProcess]?.[activeStream] ?? '';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="view-title">Server Logs</h1>
            <p className="view-subtitle">Review realmd and mangosd output</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-compact" onClick={() => onNavigate?.('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">Server Control</div>
          <div style={{ marginTop: '0.75rem' }}>
            {(['realmd', 'mangosd'] as ProcessName[]).map((name) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ color: '#d4a234' }}>{name}.exe</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: getStatusColor(serverStatus.find((entry) => entry.name === name)?.status), fontSize: '1.1rem' }}>●</span>
                  <span style={{ color: '#b89968' }}>{getStatusLabel(name)}</span>
                </div>
              </div>
            ))}
          </div>
          {serverError && (
            <p style={{ color: '#ff6666', marginTop: '0.5rem', marginBottom: 0 }}>{serverError}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b89968' }}>
              <input
                type="checkbox"
                checked={showConsole}
                onChange={(event) => setShowConsole(event.target.checked)}
              />
              Launch with console windows
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">Console Output</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn btn-secondary btn-compact ${activeProcess === 'realmd' ? 'active' : ''}`}
                onClick={() => setActiveProcess('realmd')}
              >
                realmd
              </button>
              <button
                className={`btn btn-secondary btn-compact ${activeProcess === 'mangosd' ? 'active' : ''}`}
                onClick={() => setActiveProcess('mangosd')}
              >
                mangosd
              </button>
              <button
                className={`btn btn-secondary btn-compact ${activeStream === 'stdout' ? 'active' : ''}`}
                onClick={() => setActiveStream('stdout')}
              >
                stdout
              </button>
              <button
                className={`btn btn-secondary btn-compact ${activeStream === 'stderr' ? 'active' : ''}`}
                onClick={() => setActiveStream('stderr')}
              >
                stderr
              </button>
            </div>
          </div>
          <div
            style={{
              marginTop: '1rem',
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(212, 162, 52, 0.2)',
              borderRadius: '8px',
              padding: '1rem',
              minHeight: '320px',
              maxHeight: '480px',
              overflow: 'auto',
              fontFamily: 'Consolas, monospace',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
              color: '#d9d1b8'
            }}
          >
            {currentLogs || 'No logs available.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerLogs;
