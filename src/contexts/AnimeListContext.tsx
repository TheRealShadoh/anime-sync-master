
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Anime, SeasonData, Season } from '@/lib/types';
import { 
  getCurrentSeasonAnime, 
  getSeasonalAnime, 
  getNextSeasonAnime, 
  applyAutoRules, 
  fetchMoreAnime, 
  getMalConfig 
} from '@/lib/api';
import { toast } from 'sonner';
import { useAnimeStorage } from '@/hooks/useAnimeStorage';
import { useAnimeFilters } from '@/hooks/useAnimeFilters';

// Create the context
type AnimeListContextType = {
  currentSeason: SeasonData | null;
  nextSeason: SeasonData | null;
  isLoading: boolean;
  selectedAnime: Set<number>;
  malConnected: boolean;
  loadCurrentSeason: () => Promise<void>;
  loadNextSeason: () => Promise<void>;
  loadSeason: (season: Season, year: number) => Promise<SeasonData | null>;
  toggleSelection: (animeId: number) => void;
  addToSelected: (animeId: number) => void;
  isSelected: (animeId: number) => boolean;
  applyRules: () => void;
  getSelectedAnime: () => Anime[];
};

const AnimeListContext = createContext<AnimeListContextType | undefined>(undefined);

export const AnimeListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSeason, setCurrentSeason] = useState<SeasonData | null>(null);
  const [nextSeason, setNextSeason] = useState<SeasonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [malConnected, setMalConnected] = useState(false);
  
  const { 
    selectedAnime, 
    setSelectedAnime, 
    loadSelectedAnime, 
    saveSelectedAnime 
  } = useAnimeStorage();
  
  const { applyFiltersToAnime } = useAnimeFilters();

  // Check MAL connection and load seasons on mount
  useEffect(() => {
    const malConfig = getMalConfig();
    setMalConnected(malConfig.connected);
    
    loadCurrentSeason();
    loadNextSeason();
    loadSelectedAnime();
  }, []);

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
      saveSelectedAnime(newSelected);
    } catch (error) {
      console.error('Error loading current season anime:', error);
      toast.error('Failed to load current season anime');
    } finally {
      setIsLoading(false);
    }
  }, [malConnected, selectedAnime, setSelectedAnime, saveSelectedAnime]);

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
      saveSelectedAnime(newSelected);
    } catch (error) {
      console.error('Error loading next season anime:', error);
      toast.error('Failed to load next season anime');
    } finally {
      setIsLoading(false);
    }
  }, [malConnected, selectedAnime, setSelectedAnime, saveSelectedAnime]);

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
      saveSelectedAnime(newSet);
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

  // Add anime to selected list (used when directly adding to Sonarr)
  const addToSelected = (animeId: number) => {
    // Only add if not already selected
    if (!selectedAnime.has(animeId)) {
      setSelectedAnime(prev => {
        const newSet = new Set(prev);
        newSet.add(animeId);
        saveSelectedAnime(newSet);
        return newSet;
      });
      
      // Update the anime objects in current and next seasons
      if (currentSeason) {
        setCurrentSeason({
          ...currentSeason,
          anime: currentSeason.anime.map(anime => 
            anime.id === animeId 
              ? { ...anime, selected: true } 
              : anime
          )
        });
      }
      
      if (nextSeason) {
        setNextSeason({
          ...nextSeason,
          anime: nextSeason.anime.map(anime => 
            anime.id === animeId 
              ? { ...anime, selected: true } 
              : anime
          )
        });
      }
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
      saveSelectedAnime(newSelected);
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
      saveSelectedAnime(newSelected);
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

  const value = {
    currentSeason,
    nextSeason,
    isLoading,
    selectedAnime,
    malConnected,
    loadCurrentSeason,
    loadNextSeason,
    loadSeason,
    toggleSelection,
    addToSelected,
    isSelected,
    applyRules,
    getSelectedAnime
  };

  return (
    <AnimeListContext.Provider value={value}>
      {children}
    </AnimeListContext.Provider>
  );
};

// Hook to use the anime list context
export const useAnimeList = () => {
  const context = useContext(AnimeListContext);
  if (context === undefined) {
    throw new Error('useAnimeList must be used within an AnimeListProvider');
  }
  return context;
};
