import React, { ReactNode } from 'react';
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
      <AppTopBar onNavigate={onNavigate} onAddProfile={onAddProfile} />
      <div className="app-body">
        <AppSidebar currentView={currentView} onNavigate={onNavigate} />
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
