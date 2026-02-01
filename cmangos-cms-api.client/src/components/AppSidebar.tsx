import React from 'react';
import './AppLayout.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface AppSidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '' },
  { id: 'launch', label: 'Launch WoW', icon: '' },
  { id: 'accounts', label: 'Accounts', icon: '' },
  { id: 'patchnotes', label: 'Patch Notes', icon: '' },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="app-sidebar">
      <nav className="app-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`app-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AppSidebar;
