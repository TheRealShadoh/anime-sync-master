
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getSelectionsFromDB, saveSelectionsToDB } from '@/lib/db';

export const useAnimeStorage = () => {
  const [selectedAnime, setSelectedAnime] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load saved selections from IndexedDB
  const loadSelectedAnime = async () => {
    setIsLoading(true);
    try {
      const savedSelections = await getSelectionsFromDB();
      setSelectedAnime(new Set(savedSelections));
    } catch (error) {
      console.error('Error loading saved selections:', error);
      toast.error('Failed to load your anime selections');
      
      // Fallback to localStorage if IndexedDB fails
      const localStorageSelections = localStorage.getItem('selected_anime_ids');
      if (localStorageSelections) {
        try {
          const parsedSelections = JSON.parse(localStorageSelections);
          setSelectedAnime(new Set(parsedSelections));
          
          // Migrate data to IndexedDB
          saveSelectionsToDB(parsedSelections);
        } catch (parseError) {
          console.error('Error parsing saved selections:', parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save selections to IndexedDB
  const saveSelectedAnime = async (animeSet: Set<number>) => {
    const animeArray = Array.from(animeSet);
    try {
      await saveSelectionsToDB(animeArray);
      
      // Also save to localStorage as backup
      localStorage.setItem('selected_anime_ids', JSON.stringify(animeArray));
    } catch (error) {
      console.error('Error saving selections:', error);
      toast.error('Failed to save your anime selections');
      
      // Fallback to localStorage
      localStorage.setItem('selected_anime_ids', JSON.stringify(animeArray));
    }
  };

  // Load selections on mount
  useEffect(() => {
    loadSelectedAnime();
  }, []);

  return {
    selectedAnime,
    setSelectedAnime,
    loadSelectedAnime,
    saveSelectedAnime,
    isLoading
  };
};
