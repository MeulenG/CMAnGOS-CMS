import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './Onboarding.css';

const WowPathSelect: React.FC = () => {
  const { onboardingData, updateWowPath, nextStep, previousStep } = useOnboarding();
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pathError, setPathError] = useState('');

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateWowPath(value);
    setPathError('');
    setValidationResult(null);
  };

  const handleBrowse = async () => {
    // TODO: Implement file dialog via IPC when handler is ready
    // For now, just show a placeholder
    alert('File browser will be implemented with IPC handlers');
  };

  const handleValidate = async () => {
    if (!onboardingData.wowPath.trim()) {
      setPathError('WoW path is required');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      // TODO: Call WoW validation IPC when implemented
      // For now, simulate validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple client-side check
      const path = onboardingData.wowPath.toLowerCase();
      if (path.includes('wow') || path.includes('warcraft')) {
        setValidationResult({
          success: true,
          message: 'Valid WoW installation found!'
        });
      } else {
        setValidationResult({
          success: false,
          message: 'Could not find WoW.exe in the specified directory'
        });
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: (error as Error).message || 'Validation failed'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleNext = () => {
    if (!onboardingData.wowPath.trim()) {
      setPathError('WoW path is required');
      return;
    }
    if (!validationResult || !validationResult.success) {
      setValidationResult({
        success: false,
        message: 'Please validate your WoW path before continuing'
      });
      return;
    }
    nextStep();
  };

  return (
    <div className="onboarding-card">
      <h1 className="step-title">WoW Client Location</h1>
      <p className="step-description">
        Select the folder where your World of Warcraft client is installed
      </p>

      <div className="info-box">
        <p>
          <strong>Example paths:</strong>
        </p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#b89968' }}>
          <li><code>C:\Games\World of Warcraft</code></li>
          <li><code>C:\Program Files (x86)\World of Warcraft</code></li>
          <li><code>/home/user/games/wow</code></li>
        </ul>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="wowPath">
          Installation Path
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id="wowPath"
            type="text"
            className={`form-input ${pathError ? 'error' : ''}`}
            placeholder="C:\Games\World of Warcraft"
            value={onboardingData.wowPath}
            onChange={handlePathChange}
            style={{ flex: 1 }}
          />
          <button className="btn btn-secondary" onClick={handleBrowse}>
            Browse...
          </button>
        </div>
        {pathError && <span className="form-error">{pathError}</span>}
      </div>

      <button
        className="btn btn-secondary btn-icon"
        onClick={handleValidate}
        disabled={validating || !onboardingData.wowPath.trim()}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {validating ? <span className="loading-spinner" /> : '✓'}
        {validating ? 'Validating...' : 'Validate Path'}
      </button>

      {validationResult && (
        <div className="form-group">
          <span className={validationResult.success ? 'form-success' : 'form-error'}>
            {validationResult.success ? '✓ ' : '✗ '}{validationResult.message}
          </span>
        </div>
      )}

      <div className="button-group">
        <button className="btn btn-secondary" onClick={previousStep}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default WowPathSelect;
