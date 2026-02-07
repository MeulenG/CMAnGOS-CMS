import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './Onboarding.css';

type ValidationResult = {
  success: boolean;
  message: string;
};

const ServerBinaries: React.FC = () => {
  const {
    onboardingData,
    updateRealmdPath,
    updateMangosdPath,
    nextStep,
    previousStep
  } = useOnboarding();
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [errors, setErrors] = useState({ realmdPath: '', mangosdPath: '' });

  const handlePathChange = (field: 'realmdPath' | 'mangosdPath', value: string) => {
    if (field === 'realmdPath') {
      updateRealmdPath(value);
    } else {
      updateMangosdPath(value);
    }
    setErrors(prev => ({ ...prev, [field]: '' }));
    setValidationResult(null);
  };

  const validateForm = (): boolean => {
    const nextErrors = { realmdPath: '', mangosdPath: '' };
    let isValid = true;

    if (!onboardingData.realmdPath.trim()) {
      nextErrors.realmdPath = 'realmd.exe path is required';
      isValid = false;
    }

    if (!onboardingData.mangosdPath.trim()) {
      nextErrors.mangosdPath = 'mangosd.exe path is required';
      isValid = false;
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleValidate = async () => {
    if (!validateForm()) {
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const result = await window.electronAPI.server.validatePaths({
        realmdPath: onboardingData.realmdPath,
        mangosdPath: onboardingData.mangosdPath
      });

      if (result.success) {
        setValidationResult({
          success: true,
          message: 'realmd.exe and mangosd.exe were found.'
        });
      } else {
        setValidationResult({
          success: false,
          message: result.error || 'Validation failed'
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
    if (!validateForm()) {
      return;
    }
    if (!validationResult || !validationResult.success) {
      setValidationResult({
        success: false,
        message: 'Please validate your server paths before continuing'
      });
      return;
    }
    nextStep();
  };

  return (
    <div className="onboarding-card">
      <h1 className="step-title">Server Binaries</h1>
      <p className="step-description">
        Provide the locations of realmd.exe and mangosd.exe for your server
      </p>

      <div className="info-box">
        <p>
          <strong>Important:</strong> The CMS assumes each configuration file is in the same folder as its
          corresponding executable.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="realmdPath">
          realmd.exe path
        </label>
        <input
          id="realmdPath"
          type="text"
          className={`form-input ${errors.realmdPath ? 'error' : ''}`}
          placeholder="C:\\CMaNGOS\\bin\\realmd.exe"
          value={onboardingData.realmdPath}
          onChange={(e) => handlePathChange('realmdPath', e.target.value)}
        />
        {errors.realmdPath && <span className="form-error">{errors.realmdPath}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="mangosdPath">
          mangosd.exe path
        </label>
        <input
          id="mangosdPath"
          type="text"
          className={`form-input ${errors.mangosdPath ? 'error' : ''}`}
          placeholder="C:\\CMaNGOS\\bin\\mangosd.exe"
          value={onboardingData.mangosdPath}
          onChange={(e) => handlePathChange('mangosdPath', e.target.value)}
        />
        {errors.mangosdPath && <span className="form-error">{errors.mangosdPath}</span>}
      </div>

      <button
        className="btn btn-secondary btn-icon"
        onClick={handleValidate}
        disabled={validating || !onboardingData.realmdPath.trim() || !onboardingData.mangosdPath.trim()}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {validating ? <span className="loading-spinner" /> : '✓'}
        {validating ? 'Validating...' : 'Validate Paths'}
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
        <button className="btn btn-primary" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
};

export default ServerBinaries;
