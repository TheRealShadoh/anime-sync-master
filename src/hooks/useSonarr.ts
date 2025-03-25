
import { useState, useEffect } from 'react';
import { SonarrConfig, Anime } from '@/lib/types';
import { getSonarrConfig, saveSonarrConfig, addAnimeToSonarr, testSonarrConnection, setDefaultRootFolder } from '@/lib/api';

export const useSonarr = () => {
  const [config, setConfig] = useState<SonarrConfig>({ url: '', apiKey: '', connected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingAnime, setPendingAnime] = useState<Anime[]>([]);

  // Load saved configuration on mount and after updates
  useEffect(() => {
    const savedConfig = getSonarrConfig();
    if (savedConfig.url || savedConfig.apiKey || savedConfig.rootFolders) {
      setConfig(savedConfig);
      setIsConnected(savedConfig.connected);
    }
  }, []);

  // Ensure root folders are loaded when connection is successful
  useEffect(() => {
    if (isConnected && !config.rootFolders) {
      const loadRootFolders = async () => {
        const newConfig = await getSonarrConfig();
        if (newConfig.rootFolders) {
          setConfig(newConfig);
        }
      };
      loadRootFolders();
    }
  }, [isConnected, config.rootFolders]);

  // Save Sonarr configuration
  const saveConfig = async (newConfig: SonarrConfig) => {
    setIsLoading(true);
    try {
      const success = await saveSonarrConfig(newConfig);
      if (success) {
        const updatedConfig = { ...newConfig, connected: true };
        setConfig(updatedConfig);
        setIsConnected(true);
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

  // Test Sonarr connection
  const testConnection = async (url: string, apiKey: string) => {
    setIsTesting(true);
    try {
      const success = await testSonarrConnection(url, apiKey);
      if (success) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
      return success;
    } catch (error) {
      console.error('Error testing Sonarr connection:', error);
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  // Handle setting default root folder
  const setRootFolder = (path: string) => {
    setDefaultRootFolder(path);
    setConfig(prev => ({
      ...prev,
      defaultRootFolder: path
    }));
  };

  return {
    config,
    isConnected,
    isLoading,
    isTesting,
    pendingAnime,
    isPending,
    saveConfig,
    addToSonarr,
    testConnection,
    setRootFolder
  };
};
