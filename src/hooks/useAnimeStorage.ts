
import { useState } from 'react';

// LocalStorage key for selected anime
const SELECTED_ANIME_KEY = 'selected_anime_ids';

export const useAnimeStorage = () => {
  const [selectedAnime, setSelectedAnime] = useState<Set<number>>(new Set());

  // Load saved selections from localStorage
  const loadSelectedAnime = () => {
    const savedSelections = localStorage.getItem(SELECTED_ANIME_KEY);
    if (savedSelections) {
      try {
        const parsedSelections = JSON.parse(savedSelections);
        setSelectedAnime(new Set(parsedSelections));
      } catch (error) {
        console.error('Error parsing saved selections:', error);
      }
    }
  };

  // Save selections to localStorage
  const saveSelectedAnime = (animeSet: Set<number>) => {
    localStorage.setItem(SELECTED_ANIME_KEY, JSON.stringify(Array.from(animeSet)));
  };

  return {
    selectedAnime,
    setSelectedAnime,
    loadSelectedAnime,
    saveSelectedAnime
  };
};
