import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Expansion, ExpansionLabels } from '../../../electron/types/config.types';
import './Onboarding.css';

const ProfileSetup: React.FC = () => {
  const { onboardingData, updateProfileName, updateExpansion, nextStep, previousStep } = useOnboarding();
  const [nameError, setNameError] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateProfileName(value);
    if (value.trim().length > 0) {
      setNameError('');
    }
  };

  const handleExpansionSelect = (expansion: Expansion) => {
    updateExpansion(expansion);
  };

  const handleNext = () => {
    if (!onboardingData.profileName.trim()) {
      setNameError('Profile name is required');
      return;
    }
    if (!onboardingData.expansion) {
      return;
    }
    nextStep();
  };

  const expansionIcons: Record<Expansion, string> = {
    [Expansion.CLASSIC]: '⚔️',
    [Expansion.TBC]: '🔥',
    [Expansion.WOTLK]: '❄️'
  };

  return (
    <div className="onboarding-card">
      <h1 className="step-title">Create Server Profile</h1>
      <p className="step-description">
        Give your server a name and select which expansion you're running
      </p>

      <div className="form-group">
        <label className="form-label" htmlFor="profileName">
          Profile Name
        </label>
        <input
          id="profileName"
          type="text"
          className={`form-input ${nameError ? 'error' : ''}`}
          placeholder="e.g., My Classic Server"
          value={onboardingData.profileName}
          onChange={handleNameChange}
          autoFocus
        />
        {nameError && <span className="form-error">{nameError}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Expansion</label>
        <div className="expansion-grid">
          {Object.values(Expansion).map((expansion) => (
            <div
              key={expansion}
              className={`expansion-option ${onboardingData.expansion === expansion ? 'selected' : ''}`}
              onClick={() => handleExpansionSelect(expansion)}
            >
              <div className="expansion-icon">{expansionIcons[expansion]}</div>
              <h3 className="expansion-title">{ExpansionLabels[expansion]}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={previousStep}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!onboardingData.profileName.trim() || !onboardingData.expansion}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ProfileSetup;
