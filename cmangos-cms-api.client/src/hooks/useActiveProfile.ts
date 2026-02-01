import { useState, useEffect } from 'react';
import type { ServerProfile, IPCResult } from '../types/app.types';

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
      const activeIdResult: IPCResult<string | null> = await window.electronAPI.config.getActiveProfile();
      
      if (!activeIdResult.success) {
        throw new Error(activeIdResult.error || 'Failed to get active profile ID');
      }

      if (!activeIdResult.data) {
        // No active profile set
        setActiveProfile(null);
        return;
      }

      // Get all profiles
      const profilesResult = await window.electronAPI.profile.getAll();
      
      if (!profilesResult.success) {
        throw new Error(profilesResult.error || 'Failed to load profiles');
      }

      // Find the active profile
      const profile = (profilesResult.data as ServerProfile[] | undefined)?.find(p => p.id === activeIdResult.data);
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
