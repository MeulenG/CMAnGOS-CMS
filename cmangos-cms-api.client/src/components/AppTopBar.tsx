import React from 'react';
import ProfileSwitcher from './ProfileSwitcher';
import './AppLayout.css';

interface AppTopBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onAddProfile: () => void;
}

interface TopNavItem {
  id: string;
  label: string;
}

const topNavItems: TopNavItem[] = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'launch', label: 'Launch' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'server-logs', label: 'Logs' },
  { id: 'patchnotes', label: 'Changelogs' }
];

const AppTopBar: React.FC<AppTopBarProps> = ({ currentView, onNavigate, onAddProfile }) => {
  return (
    <div className="app-top-bar">
      <div className="app-title-row">
        <div className="app-title">CMAnGOS Launcher</div>
        <div className="app-window-dots">
          <span className="window-dot" />
          <span className="window-dot" />
          <span className="window-dot" />
        </div>
      </div>

      <div className="app-top-tabs">
        {topNavItems.map((item) => (
          <button
            key={item.id}
            className={`top-tab ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="app-top-actions">
        <ProfileSwitcher onAddProfile={onAddProfile} />
        <button className="settings-button" onClick={() => onNavigate('settings')} title="Settings">
          Settings
        </button>
      </div>
    </div>
  );
};

export default AppTopBar;
