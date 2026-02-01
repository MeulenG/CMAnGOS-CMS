import React from 'react';
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext';
import Welcome from './Welcome';
import ProfileSetup from './ProfileSetup';
import DatabaseConfig from './DatabaseConfig';
import WowPathSelect from './WowPathSelect';
import Summary from './Summary';
import './Onboarding.css';

const OnboardingContent: React.FC = () => {
  const { currentStep, totalSteps } = useOnboarding();

  const steps = [
    <Welcome key="welcome" />,
    <ProfileSetup key="profile" />,
    <DatabaseConfig key="database" />,
    <WowPathSelect key="wow-path" />,
    <Summary key="summary" />
  ];

  return (
    <div className="onboarding-container">
      <header className="onboarding-header">
        <h1 className="onboarding-logo">CMAnGOS</h1>
        <p className="onboarding-subtitle">Desktop Server Manager</p>
      </header>

      <div className="onboarding-content">
        {currentStep > 0 && (
          <div className="onboarding-progress">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={`progress-step ${
                  index < currentStep ? 'completed' : index === currentStep ? 'active' : ''
                }`}
              />
            ))}
          </div>
        )}

        {steps[currentStep]}
      </div>
    </div>
  );
};

const Onboarding: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default Onboarding;
