import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { ExpansionLabels } from '../../../electron/types/config.types';
import './Onboarding.css';

const Summary: React.FC = () => {
  const { onboardingData, previousStep } = useOnboarding();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    setCreating(true);
    setError(null);

    try {
      // Create the profile via IPC
      const result = await window.electronAPI.profile.create({
        name: onboardingData.profileName,
        expansion: onboardingData.expansion!,
        database: onboardingData.database,
        wowPath: onboardingData.wowPath,
        realmdPath: onboardingData.realmdPath,
        mangosdPath: onboardingData.mangosdPath
      });

      if (result.success) {
        const newProfile = result.data as { id?: string } | undefined;
        if (newProfile?.id) {
          await window.electronAPI.config.setActiveProfile(newProfile.id);
        }

        // Mark onboarding as completed
        await window.electronAPI.config.save({ onboardingCompleted: true });
        
        // Redirect to main app
        window.location.href = '/';
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="onboarding-card">
      <h1 className="step-title">Configuration Complete</h1>
      <p className="step-description">
        Review your configuration and click Finish to create your server profile
      </p>

      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Profile Name</div>
          <div className="summary-value">{onboardingData.profileName}</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Expansion</div>
          <div className="summary-value">
            {onboardingData.expansion && ExpansionLabels[onboardingData.expansion]}
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Database Host</div>
          <div className="summary-value">
            {onboardingData.database.host}:{onboardingData.database.port}
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Database Username</div>
          <div className="summary-value">{onboardingData.database.username}</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">WoW Installation</div>
          <div className="summary-value">{onboardingData.wowPath}</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">realmd.exe</div>
          <div className="summary-value">{onboardingData.realmdPath}</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">mangosd.exe</div>
          <div className="summary-value">{onboardingData.mangosdPath}</div>
        </div>
      </div>

      {error && (
        <div className="form-group">
          <span className="form-error">✗ {error}</span>
        </div>
      )}

      <div className="info-box">
        <p>
          Your profile will be saved securely with encrypted credentials. 
          You can create additional profiles or modify this one later from the settings.
        </p>
      </div>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={previousStep} disabled={creating}>
          ← Back
        </button>
        <button
          className="btn btn-primary btn-icon"
          onClick={handleFinish}
          disabled={creating}
        >
          {creating ? <span className="loading-spinner" /> : '✓'}
          {creating ? 'Creating Profile...' : 'Finish & Launch'}
        </button>
      </div>
    </div>
  );
};

export default Summary;
