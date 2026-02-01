import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Expansion } from '../../electron/types/config.types';

interface DatabaseFormData {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface OnboardingData {
  profileName: string;
  expansion: Expansion | null;
  database: DatabaseFormData;
  wowPath: string;
}

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  onboardingData: OnboardingData;
  updateProfileName: (name: string) => void;
  updateExpansion: (expansion: Expansion) => void;
  updateDatabase: (database: DatabaseFormData) => void;
  updateWowPath: (path: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const INITIAL_DATA: OnboardingData = {
  profileName: '',
  expansion: null,
  database: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: ''
  },
  wowPath: ''
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(INITIAL_DATA);
  const totalSteps = 5; // Welcome, Profile, Database, WoW Path, Summary

  const updateProfileName = (name: string) => {
    setOnboardingData(prev => ({ ...prev, profileName: name }));
  };

  const updateExpansion = (expansion: Expansion) => {
    setOnboardingData(prev => ({ ...prev, expansion }));
  };

  const updateDatabase = (database: DatabaseFormData) => {
    setOnboardingData(prev => ({ ...prev, database }));
  };

  const updateWowPath = (path: string) => {
    setOnboardingData(prev => ({ ...prev, wowPath: path }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const resetOnboarding = () => {
    setCurrentStep(0);
    setOnboardingData(INITIAL_DATA);
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        onboardingData,
        updateProfileName,
        updateExpansion,
        updateDatabase,
        updateWowPath,
        nextStep,
        previousStep,
        goToStep,
        resetOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
