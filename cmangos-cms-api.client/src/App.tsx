import { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import ServerDashboard from './views/ServerDashboard';
import LaunchWow from './views/LaunchWow';
import AccountManager from './views/AccountManager';
import PatchNotes from './views/PatchNotes';
import AppSettings from './views/AppSettings';
import ServerLogs from './views/ServerLogs';
import Onboarding from './pages/Onboarding/Onboarding';
import { getJson } from './utils/api';
import './App.css';

function App() {
  console.log('VITE_API_KEY =', import.meta.env.VITE_API_KEY);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [forceOnboarding, setForceOnboarding] = useState(false);
  const [onboardingKey, setOnboardingKey] = useState(0);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const result = await getJson<{ onboardingCompleted?: boolean }>('/config');
      setIsOnboardingComplete(Boolean(result.onboardingCompleted));
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      setIsOnboardingComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ServerDashboard onNavigate={setCurrentView} />;
      case 'launch':
        return <LaunchWow />;
      case 'accounts':
        return <AccountManager />;
      case 'patchnotes':
        return <PatchNotes />;
      case 'settings':
        return <AppSettings />;
      case 'server-logs':
        return <ServerLogs onNavigate={setCurrentView} />;
      default:
        return <ServerDashboard />;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0604',
        color: '#d4a234',
        fontFamily: 'Cinzel, serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show onboarding if not complete
  if (!isOnboardingComplete || forceOnboarding) {
    return <Onboarding key={onboardingKey} />;
  }

  // Show desktop app
  return (
    <AppLayout
      currentView={currentView}
      onNavigate={setCurrentView}
      onAddProfile={() => {
        setOnboardingKey((prev) => prev + 1);
        setForceOnboarding(true);
      }}
    >
      {renderView()}
    </AppLayout>
  );
}

export default App;