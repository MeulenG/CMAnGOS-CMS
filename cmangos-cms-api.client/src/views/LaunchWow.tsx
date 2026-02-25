import React, { useEffect, useState } from 'react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import type { ServerProcessStatus } from '../types/app.types';
import { postJson, putJson } from '../utils/api';
import '../components/AppLayout.css';

const LaunchWow: React.FC = () => {
  const { activeProfile, refresh } = useActiveProfile();
  const [launching, setLaunching] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [launchResult, setLaunchResult] = useState<{ success: boolean; message: string } | null>(null);
  const [editingPaths, setEditingPaths] = useState(false);
  const [wowPath, setWowPath] = useState('');
  const [realmdPath, setRealmdPath] = useState('');
  const [mangosdPath, setMangosdPath] = useState('');
  const [pathError, setPathError] = useState<string | null>(null);
  const [savingPaths, setSavingPaths] = useState(false);

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    setServerStatus('checking');
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, [activeProfile]);

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    setWowPath(activeProfile.wowPath);
    setRealmdPath(activeProfile.realmdPath);
    setMangosdPath(activeProfile.mangosdPath);
  }, [activeProfile]);

  const checkServerStatus = async () => {
    if (!activeProfile) {
      return;
    }

    try {
      const statuses = await postJson<ServerProcessStatus[]>('/server/status', {
        realmdPath: activeProfile.realmdPath,
        mangosdPath: activeProfile.mangosdPath
      });

      const allRunning = statuses.length > 0 && statuses.every((status) => status.status === 'running');
      setServerStatus(allRunning ? 'online' : 'offline');
    } catch (error) {
      console.error('Failed to check server status:', error);
      setServerStatus('offline');
    }
  };

  const handleLaunch = async () => {
    if (!activeProfile) return;

    setLaunching(true);
    setLaunchResult(null);
    try {
      const result = await postJson<{ executablePath: string }>('/wow/launch', {
        wowPath: activeProfile.wowPath
      });
      if (result.executablePath) {
        setLaunchResult({
          success: true,
          message: 'WoW launched successfully.'
        });
      } else {
        setLaunchResult({
          success: false,
          message: 'Failed to launch WoW'
        });
      }
    } catch (error) {
      console.error('Failed to launch WoW:', error);
      setLaunchResult({
        success: false,
        message: (error as Error).message || 'Failed to launch WoW'
      });
    } finally {
      setLaunching(false);
    }
  };

  const handleBrowseWowPath = async () => {
    if (!window.electronAPI?.wow?.browsePath) {
      setPathError('Browse dialog is unavailable in this build');
      return;
    }

    const result = await window.electronAPI.wow.browsePath();
    if (result.success && result.data?.path) {
      setWowPath(result.data.path);
      setPathError(null);
    } else if (!result.success) {
      setPathError(result.error || 'Failed to open file dialog');
    }
  };

  const handleBrowseServerPath = async (kind: 'realmd' | 'mangosd') => {
    if (!window.electronAPI?.server?.browsePath) {
      setPathError('Browse dialog is unavailable in this build');
      return;
    }

    const result = await window.electronAPI.server.browsePath();
    if (result.success && result.data?.path) {
      if (kind === 'realmd') {
        setRealmdPath(result.data.path);
      } else {
        setMangosdPath(result.data.path);
      }
      setPathError(null);
    } else if (!result.success) {
      setPathError(result.error || 'Failed to open file dialog');
    }
  };

  const handleSavePaths = async () => {
    if (!activeProfile) {
      return;
    }

    setSavingPaths(true);
    setPathError(null);

    try {
      await putJson(`/profile/${activeProfile.id}`, {
        wowPath: wowPath.trim(),
        realmdPath: realmdPath.trim(),
        mangosdPath: mangosdPath.trim()
      });
      await refresh();
      setEditingPaths(false);
    } catch (error) {
      setPathError((error as Error).message || 'Failed to save paths');
    } finally {
      setSavingPaths(false);
    }
  };

  if (!activeProfile) {
    return (
      <div className="app-content">
        <div className="view-header">
          <h1 className="view-title">Launch WoW</h1>
          <p className="view-subtitle">No active profile selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="view-header">
        <h1 className="view-title">Launch World of Warcraft</h1>
        <p className="view-subtitle">Launch your WoW client and connect to the server</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.2rem', color: '#d4a234', marginBottom: '0.5rem' }}>
            Server Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '1.5rem', 
              color: serverStatus === 'online' ? '#66ff66' : serverStatus === 'offline' ? '#ff6666' : '#ffaa00' 
            }}>
              ●
            </span>
            <span style={{ fontSize: '1.1rem', color: '#b89968' }}>
              {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Checking...'}
            </span>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleLaunch}
          disabled={launching || serverStatus !== 'online'}
          style={{ 
            fontSize: '1.25rem', 
            padding: '1.25rem 3rem',
            minWidth: '300px'
          }}
        >
          {launching ? (
            <>
              <span className="loading-spinner" style={{ marginRight: '0.5rem' }} />
              Launching...
            </>
          ) : (
            '▶ Launch World of Warcraft'
          )}
        </button>

        {serverStatus === 'offline' && (
          <p style={{ marginTop: '1rem', color: '#ff6666' }}>
            Server is currently offline. Please start the server first.
          </p>
        )}

        {launchResult && (
          <p style={{ marginTop: '1rem', color: launchResult.success ? '#66ff66' : '#ff6666' }}>
            {launchResult.success ? '✓ ' : '✗ '}{launchResult.message}
          </p>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Client Information</div>
          <div style={{ color: '#b89968', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#d4a234' }}>Installation Path:</strong>
              {editingPaths ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    className="form-input"
                    value={wowPath}
                    onChange={(event) => setWowPath(event.target.value)}
                    placeholder="C:\\Games\\World of Warcraft"
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-secondary btn-compact" onClick={handleBrowseWowPath}>
                    Browse
                  </button>
                </div>
              ) : (
                <div style={{ wordBreak: 'break-all', marginTop: '0.25rem' }}>
                  {activeProfile.wowPath}
                </div>
              )}
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#d4a234' }}>realmd.exe:</strong>
              {editingPaths ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    className="form-input"
                    value={realmdPath}
                    onChange={(event) => setRealmdPath(event.target.value)}
                    placeholder="C:\\Mangos\\...\\realmd.exe"
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-secondary btn-compact" onClick={() => handleBrowseServerPath('realmd')}>
                    Browse
                  </button>
                </div>
              ) : (
                <div style={{ wordBreak: 'break-all', marginTop: '0.25rem' }}>
                  {activeProfile.realmdPath || 'Not configured'}
                </div>
              )}
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#d4a234' }}>mangosd.exe:</strong>
              {editingPaths ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    className="form-input"
                    value={mangosdPath}
                    onChange={(event) => setMangosdPath(event.target.value)}
                    placeholder="C:\\Mangos\\...\\mangosd.exe"
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-secondary btn-compact" onClick={() => handleBrowseServerPath('mangosd')}>
                    Browse
                  </button>
                </div>
              ) : (
                <div style={{ wordBreak: 'break-all', marginTop: '0.25rem' }}>
                  {activeProfile.mangosdPath || 'Not configured'}
                </div>
              )}
            </div>
            <div>
              <strong style={{ color: '#d4a234' }}>Expansion:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                {activeProfile.expansion.toUpperCase()}
              </div>
            </div>
            {pathError && (
              <div style={{ marginTop: '0.75rem', color: '#ff6666' }}>
                {pathError}
              </div>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {editingPaths ? (
                <>
                  <button className="btn btn-primary btn-compact" onClick={handleSavePaths} disabled={savingPaths}>
                    {savingPaths ? 'Saving...' : 'Save Paths'}
                  </button>
                  <button className="btn btn-secondary btn-compact" onClick={() => setEditingPaths(false)} disabled={savingPaths}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary btn-compact" onClick={() => setEditingPaths(true)}>
                  Edit Paths
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Realm Information</div>
          <div style={{ color: '#b89968', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#d4a234' }}>Server:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                {activeProfile.name}
              </div>
            </div>
            <div>
              <strong style={{ color: '#d4a234' }}>Database:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                {activeProfile.database.host}:{activeProfile.database.port}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchWow;
