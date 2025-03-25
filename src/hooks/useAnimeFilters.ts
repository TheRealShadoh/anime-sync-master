
import { Anime } from '@/lib/types';

export const useAnimeFilters = () => {
  // Apply filters to the anime list
  const applyFiltersToAnime = (animeList: Anime[], filters: {
    genres?: string[];
    seasons?: string[];
    year?: number;
    studios?: string[];
    scoreAbove?: number;
  }) => {
    return animeList.filter(anime => {
      // Genre filter
      if (filters.genres && filters.genres.length > 0 && 
          !anime.genres.some(genre => filters.genres!.includes(genre))) {
        return false;
      }
      
      // Season filter
      if (filters.seasons && filters.seasons.length > 0 && 
          anime.season && 
          !filters.seasons.includes(anime.season)) {
        return false;
      }
      
      // Year filter
      if (filters.year && anime.year !== filters.year) {
        return false;
      }
      
      // Studio filter
      if (filters.studios && filters.studios.length > 0 && 
          (!anime.studios || 
           !anime.studios.some(studio => filters.studios!.includes(studio)))) {
        return false;
      }
      
      // Score filter
      if (filters.scoreAbove && 
          (!anime.score || anime.score < filters.scoreAbove)) {
        return false;
      }
      
      return true;
    });
  };

  return { applyFiltersToAnime };
};
