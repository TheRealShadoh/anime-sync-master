
import { useState, useEffect } from 'react';
import { SonarrConfig, Anime } from '@/lib/types';
import { getSonarrConfig, saveSonarrConfig, addAnimeToSonarr } from '@/lib/api';

export const useSonarr = () => {
  const [config, setConfig] = useState<SonarrConfig>({ url: '', apiKey: '', connected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAnime, setPendingAnime] = useState<Anime[]>([]);

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = getSonarrConfig();
    setConfig(savedConfig);
  }, []);

  // Save Sonarr configuration
  const saveConfig = async (newConfig: SonarrConfig) => {
    setIsLoading(true);
    try {
      const success = await saveSonarrConfig(newConfig);
      if (success) {
        setConfig({ ...newConfig, connected: true });
      }
      return success;
    } catch (error) {
      console.error('Error saving Sonarr config:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add anime to Sonarr
  const addToSonarr = async (anime: Anime) => {
    setIsLoading(true);
    setPendingAnime(prev => [...prev, anime]);
    
    try {
      const success = await addAnimeToSonarr(anime);
      if (success) {
        setPendingAnime(prev => prev.filter(a => a.id !== anime.id));
      }
      return success;
    } catch (error) {
      console.error('Error adding anime to Sonarr:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if anime is pending addition to Sonarr
  const isPending = (animeId: number) => {
    return pendingAnime.some(anime => anime.id === animeId);
  };

  return {
    config,
    isConnected: config.connected,
    isLoading,
    pendingAnime,
    isPending,
    saveConfig,
    addToSonarr
  };
};
