import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './Onboarding.css';

const DatabaseConfig: React.FC = () => {
  const { onboardingData, updateDatabase, nextStep, previousStep } = useOnboarding();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState({
    host: '',
    port: '',
    username: ''
  });

  const handleInputChange = (field: keyof typeof onboardingData.database, value: string | number) => {
    updateDatabase({
      ...onboardingData.database,
      [field]: value
    });
    // Clear error for this field
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setTestResult(null);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      host: '',
      port: '',
      username: ''
    };
    let isValid = true;

    if (!onboardingData.database.host.trim()) {
      newErrors.host = 'Host is required';
      isValid = false;
    }

    if (!onboardingData.database.port || onboardingData.database.port < 1 || onboardingData.database.port > 65535) {
      newErrors.port = 'Valid port (1-65535) is required';
      isValid = false;
    }

    if (!onboardingData.database.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // TODO: Call database validation IPC when implemented
      // For now, simulate a test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTestResult({
        success: true,
        message: 'Connection successful! Databases found.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: (error as Error).message || 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    if (!testResult || !testResult.success) {
      setTestResult({
        success: false,
        message: 'Please test your connection before continuing'
      });
      return;
    }
    nextStep();
  };

  return (
    <div className="onboarding-card">
      <h1 className="step-title">Database Configuration</h1>
      <p className="step-description">
        Enter your MySQL database credentials to connect to your CMAnGOS server
      </p>

      <div className="info-box">
        <p>
          <strong>Note:</strong> Make sure your CMAnGOS databases are already installed 
          and accessible. The app will validate that the required databases exist.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="dbHost">
          MySQL Host
        </label>
        <input
          id="dbHost"
          type="text"
          className={`form-input ${errors.host ? 'error' : ''}`}
          placeholder="localhost"
          value={onboardingData.database.host}
          onChange={(e) => handleInputChange('host', e.target.value)}
        />
        {errors.host && <span className="form-error">{errors.host}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="dbPort">
          Port
        </label>
        <input
          id="dbPort"
          type="number"
          className={`form-input ${errors.port ? 'error' : ''}`}
          placeholder="3306"
          value={onboardingData.database.port}
          onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 3306)}
          min="1"
          max="65535"
        />
        {errors.port && <span className="form-error">{errors.port}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="dbUsername">
          Username
        </label>
        <input
          id="dbUsername"
          type="text"
          className={`form-input ${errors.username ? 'error' : ''}`}
          placeholder="root"
          value={onboardingData.database.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
        />
        {errors.username && <span className="form-error">{errors.username}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="dbPassword">
          Password
        </label>
        <input
          id="dbPassword"
          type="password"
          className="form-input"
          placeholder="Enter password"
          value={onboardingData.database.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
        />
      </div>

      <button
        className="btn btn-secondary btn-icon"
        onClick={handleTestConnection}
        disabled={testing}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {testing ? <span className="loading-spinner" /> : '🔌'}
        {testing ? 'Testing Connection...' : 'Test Connection'}
      </button>

      {testResult && (
        <div className="form-group">
          <span className={testResult.success ? 'form-success' : 'form-error'}>
            {testResult.success ? '✓ ' : '✗ '}{testResult.message}
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

export default DatabaseConfig;
