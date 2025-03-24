
import { useState, useEffect } from 'react';
import { Anime, SeasonData, Season, AutoRule } from '@/lib/types';
import { getCurrentSeasonAnime, getSeasonalAnime, getNextSeasonAnime, applyAutoRules, fetchMoreAnime, getMalConfig } from '@/lib/api';
import { toast } from 'sonner';

export const useAnimeList = () => {
  const [currentSeason, setCurrentSeason] = useState<SeasonData | null>(null);
  const [nextSeason, setNextSeason] = useState<SeasonData | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [malConnected, setMalConnected] = useState(false);

  // Check MAL connection and load current and next season on mount
  useEffect(() => {
    const malConfig = getMalConfig();
    setMalConnected(malConfig.connected);
    
    loadCurrentSeason();
    loadNextSeason();
  }, []);

  // Load current season anime
  const loadCurrentSeason = async () => {
    setIsLoading(true);
    try {
      const data = await getCurrentSeasonAnime();
      
      // If MAL is connected, fetch additional anime
      if (malConnected) {
        const additionalAnime = await fetchMoreAnime(data.season, data.year);
        data.anime = [...data.anime, ...additionalAnime];
      }
      
      // Apply auto-selection rules
      const processedData = {
        ...data,
        anime: applyAutoRules(data.anime)
      };
      setCurrentSeason(processedData);
      
      // Update selected anime set based on auto-selection
      const newSelected = new Set(selectedAnime);
      processedData.anime.forEach(anime => {
        if (anime.selected) {
          newSelected.add(anime.id);
        }
      });
      setSelectedAnime(newSelected);
    } catch (error) {
      console.error('Error loading current season anime:', error);
      toast.error('Failed to load current season anime');
    } finally {
      setIsLoading(false);
    }
  };

  // Load next season anime
  const loadNextSeason = async () => {
    setIsLoading(true);
    try {
      const data = await getNextSeasonAnime();
      
      // If MAL is connected, fetch additional anime
      if (malConnected) {
        const additionalAnime = await fetchMoreAnime(data.season, data.year);
        data.anime = [...data.anime, ...additionalAnime];
      }
      
      // Apply auto-selection rules
      const processedData = {
        ...data,
        anime: applyAutoRules(data.anime)
      };
      setNextSeason(processedData);
      
      // Update selected anime set based on auto-selection
      const newSelected = new Set(selectedAnime);
      processedData.anime.forEach(anime => {
        if (anime.selected) {
          newSelected.add(anime.id);
        }
      });
      setSelectedAnime(newSelected);
    } catch (error) {
      console.error('Error loading next season anime:', error);
      toast.error('Failed to load next season anime');
    } finally {
      setIsLoading(false);
    }
  };

  // Load specific season anime
  const loadSeason = async (season: Season, year: number) => {
    setIsLoading(true);
    try {
      const data = await getSeasonalAnime(season, year);
      // Apply auto-selection rules
      const processedData = {
        ...data,
        anime: applyAutoRules(data.anime)
      };
      return processedData;
    } catch (error) {
      console.error('Error loading season anime:', error);
      toast.error('Failed to load season anime');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection of an anime
  const toggleSelection = (animeId: number) => {
    setSelectedAnime(prev => {
      const newSet = new Set(prev);
      if (newSet.has(animeId)) {
        newSet.delete(animeId);
      } else {
        newSet.add(animeId);
      }
      return newSet;
    });
  };

  // Check if an anime is selected
  const isSelected = (animeId: number) => {
    return selectedAnime.has(animeId);
  };

  // Apply auto-selection rules to the current anime lists
  const applyRules = () => {
    if (currentSeason) {
      const processedCurrentAnime = applyAutoRules(currentSeason.anime);
      setCurrentSeason({
        ...currentSeason,
        anime: processedCurrentAnime
      });
      
      // Update selected anime set
      const newSelected = new Set(selectedAnime);
      processedCurrentAnime.forEach(anime => {
        if (anime.selected) {
          newSelected.add(anime.id);
        }
      });
      setSelectedAnime(newSelected);
    }
    
    if (nextSeason) {
      const processedNextAnime = applyAutoRules(nextSeason.anime);
      setNextSeason({
        ...nextSeason,
        anime: processedNextAnime
      });
      
      // Update selected anime set
      const newSelected = new Set(selectedAnime);
      processedNextAnime.forEach(anime => {
        if (anime.selected) {
          newSelected.add(anime.id);
        }
      });
      setSelectedAnime(newSelected);
    }
    
    toast.success('Auto-selection rules applied');
  };

  // Get all selected anime objects
  const getSelectedAnime = (): Anime[] => {
    const allAnime = [
      ...(currentSeason?.anime || []),
      ...(nextSeason?.anime || [])
    ];
    
    return allAnime.filter(anime => selectedAnime.has(anime.id));
  };

  return {
    currentSeason,
    nextSeason,
    isLoading,
    selectedAnime: selectedAnime,
    malConnected,
    loadCurrentSeason,
    loadNextSeason,
    loadSeason,
    toggleSelection,
    isSelected,
    applyRules,
    getSelectedAnime
  };
};
