import { useState, useEffect } from 'react';
import type { ServerProfile } from '../types/app.types';
import { getJson } from '../utils/api';

/**
 * Custom hook to load and manage the active server profile
 * Eliminates code duplication across multiple components
 * 
 * @returns {object} - Active profile, loading state, and refresh function
 */
export const useActiveProfile = () => {
  const [activeProfile, setActiveProfile] = useState<ServerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActiveProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get active profile ID
      const activeProfileResult = await getJson<{ activeProfileId: string | null }>('/config/active-profile');

      if (!activeProfileResult.activeProfileId) {
        // No active profile set
        setActiveProfile(null);
        return;
      }

      // Get all profiles
      const profiles = await getJson<ServerProfile[]>('/profile');

      // Find the active profile
      const profile = profiles.find(p => p.id === activeProfileResult.activeProfileId);
      setActiveProfile(profile || null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to load active profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveProfile();
  }, []);

  return {
    activeProfile,
    loading,
    error,
    refresh: loadActiveProfile
  };
};
