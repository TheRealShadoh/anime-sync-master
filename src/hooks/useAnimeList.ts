
import { useState, useEffect, useCallback } from 'react';
import { Anime, SeasonData, Season, AutoRule } from '@/lib/types';
import { getCurrentSeasonAnime, getSeasonalAnime, getNextSeasonAnime, applyAutoRules, fetchMoreAnime, getMalConfig } from '@/lib/api';
import { toast } from 'sonner';

// LocalStorage key for selected anime
const SELECTED_ANIME_KEY = 'selected_anime_ids';

export const useAnimeList = () => {
  const [currentSeason, setCurrentSeason] = useState<SeasonData | null>(null);
  const [nextSeason, setNextSeason] = useState<SeasonData | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [malConnected, setMalConnected] = useState(false);

  // Load saved selections from localStorage on mount
  useEffect(() => {
    const savedSelections = localStorage.getItem(SELECTED_ANIME_KEY);
    if (savedSelections) {
      try {
        const parsedSelections = JSON.parse(savedSelections);
        setSelectedAnime(new Set(parsedSelections));
      } catch (error) {
        console.error('Error parsing saved selections:', error);
      }
    }
    
    // Check MAL connection
    const malConfig = getMalConfig();
    setMalConnected(malConfig.connected);
    
    loadCurrentSeason();
    loadNextSeason();
  }, []);

  // Save selections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SELECTED_ANIME_KEY, JSON.stringify(Array.from(selectedAnime)));
  }, [selectedAnime]);

  // Load current season anime
  const loadCurrentSeason = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCurrentSeasonAnime();
      
      // If MAL is connected, fetch additional authorized anime
      if (malConnected) {
        const additionalAnime = await fetchMoreAnime(data.season, data.year);
        data.anime = [...data.anime, ...additionalAnime];
      }
      
      // Mark anime as selected if they're in the selectedAnime set
      const processedData = {
        ...data,
        anime: data.anime.map(anime => ({
          ...anime,
          selected: selectedAnime.has(anime.id)
        }))
      };
      
      // Apply auto-selection rules
      const autoSelectedData = {
        ...processedData,
        anime: applyAutoRules(processedData.anime)
      };
      
      setCurrentSeason(autoSelectedData);
      
      // Update selected anime set based on auto-selection
      const newSelected = new Set(selectedAnime);
      autoSelectedData.anime.forEach(anime => {
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
  }, [malConnected, selectedAnime]);

  // Load next season anime
  const loadNextSeason = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNextSeasonAnime();
      
      // If MAL is connected, fetch additional authorized anime
      if (malConnected) {
        const additionalAnime = await fetchMoreAnime(data.season, data.year);
        data.anime = [...data.anime, ...additionalAnime];
      }
      
      // Mark anime as selected if they're in the selectedAnime set
      const processedData = {
        ...data,
        anime: data.anime.map(anime => ({
          ...anime,
          selected: selectedAnime.has(anime.id)
        }))
      };
      
      // Apply auto-selection rules
      const autoSelectedData = {
        ...processedData,
        anime: applyAutoRules(processedData.anime)
      };
      
      setNextSeason(autoSelectedData);
      
      // Update selected anime set based on auto-selection
      const newSelected = new Set(selectedAnime);
      autoSelectedData.anime.forEach(anime => {
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
  }, [malConnected, selectedAnime]);

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
    
    // Update the anime objects in current and next seasons
    if (currentSeason) {
      setCurrentSeason({
        ...currentSeason,
        anime: currentSeason.anime.map(anime => 
          anime.id === animeId 
            ? { ...anime, selected: !anime.selected } 
            : anime
        )
      });
    }
    
    if (nextSeason) {
      setNextSeason({
        ...nextSeason,
        anime: nextSeason.anime.map(anime => 
          anime.id === animeId 
            ? { ...anime, selected: !anime.selected } 
            : anime
        )
      });
    }
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
