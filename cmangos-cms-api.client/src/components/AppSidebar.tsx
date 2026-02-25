import React from 'react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { ExpansionLabels } from '../types/app.types';
import './AppLayout.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface AppSidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onAddProfile: () => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: '⌂' },
  { id: 'launch', label: 'Launch Client', icon: '▶' },
  { id: 'accounts', label: 'Accounts', icon: '👤' },
  { id: 'server-logs', label: 'Server Logs', icon: '▤' },
  { id: 'patchnotes', label: 'Changelogs', icon: '✦' }
];

const AppSidebar: React.FC<AppSidebarProps> = ({ currentView, onNavigate, onAddProfile }) => {
  const { activeProfile } = useActiveProfile();

  return (
    <div className="app-sidebar">
      <div className="launcher-profile-card">
        <div className="launcher-avatar">CM</div>
        <div className="launcher-profile-meta">
          <div className="launcher-profile-name">{activeProfile?.name ?? 'No Active Profile'}</div>
          <div className="launcher-profile-role">CMAnGOS Administrator</div>
          <div className="launcher-profile-realm">
            {activeProfile ? ExpansionLabels[activeProfile.expansion] : 'Set active profile in Settings'}
          </div>
        </div>
      </div>

      <div className="launcher-points">
        <div className="launcher-point-row">
          <span className="point-badge">●</span>
          <span>Server profile configured</span>
        </div>
        <div className="launcher-point-row">
          <span className="point-badge muted">●</span>
          <span>Ready to launch</span>
        </div>
      </div>

      <div className="launcher-shortcuts">
        <button className="shortcut-btn" onClick={() => onNavigate('dashboard')} title="Overview">⌂</button>
        <button className="shortcut-btn" onClick={() => onNavigate('accounts')} title="Accounts">👥</button>
        <button className="shortcut-btn" onClick={() => onNavigate('patchnotes')} title="Changelogs">✦</button>
        <button className="shortcut-btn" onClick={() => onNavigate('settings')} title="Settings">⚙</button>
      </div>

      <nav className="app-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`app-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="app-nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom-actions">
        <button className="play-button" onClick={() => onNavigate('launch')}>PLAY</button>
        <button className="menu-button" onClick={onAddProfile} title="Add profile">☰</button>
      </div>
    </div>
  );
};

export default AppSidebar;
