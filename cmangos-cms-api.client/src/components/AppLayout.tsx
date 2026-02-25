import React from 'react';
import type { ReactNode } from 'react';
import AppTopBar from './AppTopBar';
import AppSidebar from './AppSidebar';
import './AppLayout.css';

interface AppLayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onAddProfile: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentView, onNavigate, onAddProfile }) => {
  return (
    <div className="app-layout">
      <div className="app-shell">
        <div className="app-body">
          <AppSidebar currentView={currentView} onNavigate={onNavigate} onAddProfile={onAddProfile} />
          <main className="app-main">
            <AppTopBar currentView={currentView} onNavigate={onNavigate} onAddProfile={onAddProfile} />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
