import React, { useState, useEffect } from 'react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import type { ServerProcessStatus } from '../types/app.types';
import { postJson } from '../utils/api';
import '../components/AppLayout.css';

const LaunchWow: React.FC = () => {
  const { activeProfile } = useActiveProfile();
  const [launching, setLaunching] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [launchResult, setLaunchResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, [activeProfile]);

  const checkServerStatus = async () => {
    if (!activeProfile) {
      return;
    }

    setServerStatus('checking');

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
              <div style={{ wordBreak: 'break-all', marginTop: '0.25rem' }}>
                {activeProfile.wowPath}
              </div>
            </div>
            <div>
              <strong style={{ color: '#d4a234' }}>Expansion:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                {activeProfile.expansion.toUpperCase()}
              </div>
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
