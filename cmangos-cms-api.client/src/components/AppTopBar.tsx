import React from 'react';
import ProfileSwitcher from './ProfileSwitcher';
import './AppLayout.css';

interface AppTopBarProps {
  onNavigate: (view: string) => void;
  onAddProfile: () => void;
}

const AppTopBar: React.FC<AppTopBarProps> = ({ onNavigate, onAddProfile }) => {
  return (
    <div className="app-top-bar">
      <div className="app-title">
        <h1>CMAnGOS Manager</h1>
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
