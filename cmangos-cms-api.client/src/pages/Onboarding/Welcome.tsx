import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './Onboarding.css';

const Welcome: React.FC = () => {
  const { nextStep } = useOnboarding();

  return (
    <div className="onboarding-card">
      <h1 className="step-title">Welcome to CMAnGOS Manager</h1>
      <p className="step-description">
        Manage your Classic World of Warcraft servers with ease. This wizard will help you 
        set up your first server profile in just a few steps.
      </p>

      <div className="info-box">
        <p>
          <strong>What you'll need:</strong>
        </p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#b89968' }}>
          <li>MySQL database credentials</li>
          <li>CMAnGOS databases installed</li>
          <li>WoW client installation path</li>
        </ul>
      </div>

      <div className="button-group">
        <button className="btn btn-primary" onClick={nextStep}>
          Get Started →
        </button>
      </div>
    </div>
  );
};

export default Welcome;
