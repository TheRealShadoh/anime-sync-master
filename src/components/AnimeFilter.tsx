
import React, { useState, useEffect } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal, Tag, Calendar, Star, Building2 } from 'lucide-react';
import { Anime, Season } from '@/lib/types';

export interface AnimeFilters {
  genres: string[];
  seasons: string[];
  year?: number;
  studios: string[];
  scoreAbove?: number;
}

interface AnimeFilterProps {
  animeList: Anime[];
  onFiltersChange: (filters: AnimeFilters) => void;
}

const AnimeFilter: React.FC<AnimeFilterProps> = ({ animeList, onFiltersChange }) => {
  const [activeFilters, setActiveFilters] = useState<AnimeFilters>({
    genres: [],
    seasons: [],
    studios: [],
  });
  
  // Extract unique values for filter options
  const allGenres = [...new Set(animeList.flatMap(anime => anime.genres || []))].sort();
  const allSeasons = [...new Set(animeList.map(anime => anime.season).filter(Boolean))].sort();
  const allYears = [...new Set(animeList.map(anime => anime.year).filter(Boolean))].sort((a, b) => b - a);
  const allStudios = [...new Set(animeList.flatMap(anime => anime.studios || []))].sort();

  useEffect(() => {
    onFiltersChange(activeFilters);
  }, [activeFilters, onFiltersChange]);

  const toggleGenre = (genre: string) => {
    setActiveFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const toggleSeason = (season: string) => {
    setActiveFilters(prev => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter(s => s !== season)
        : [...prev.seasons, season]
    }));
  };

  const toggleStudio = (studio: string) => {
    setActiveFilters(prev => ({
      ...prev,
      studios: prev.studios.includes(studio)
        ? prev.studios.filter(s => s !== studio)
        : [...prev.studios, studio]
    }));
  };

  const setYear = (year: string) => {
    setActiveFilters(prev => ({
      ...prev,
      year: year === "any" ? undefined : parseInt(year)
    }));
  };

  const setScoreAbove = (score: string) => {
    setActiveFilters(prev => ({
      ...prev,
      scoreAbove: score === "any" ? undefined : parseFloat(score)
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      genres: [],
      seasons: [],
      studios: []
    });
  };

  const removeGenre = (genre: string) => {
    setActiveFilters(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  const removeSeason = (season: string) => {
    setActiveFilters(prev => ({
      ...prev,
      seasons: prev.seasons.filter(s => s !== season)
    }));
  };

  const removeStudio = (studio: string) => {
    setActiveFilters(prev => ({
      ...prev,
      studios: prev.studios.filter(s => s !== studio)
    }));
  };

  const clearYear = () => {
    setActiveFilters(prev => ({
      ...prev,
      year: undefined
    }));
  };

  const clearScore = () => {
    setActiveFilters(prev => ({
      ...prev,
      scoreAbove: undefined
    }));
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.genres.length > 0 ||
      activeFilters.seasons.length > 0 ||
      activeFilters.studios.length > 0 ||
      activeFilters.year !== undefined ||
      activeFilters.scoreAbove !== undefined
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {/* Genre Filter */}
              <DropdownMenuLabel className="flex items-center gap-2">
                <Tag className="h-4 w-4" /> Genres
              </DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto py-1">
                {allGenres.map(genre => (
                  <DropdownMenuCheckboxItem
                    key={genre}
                    checked={activeFilters.genres.includes(genre)}
                    onCheckedChange={() => toggleGenre(genre)}
                  >
                    {genre}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Season Filter */}
              <DropdownMenuLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Seasons
              </DropdownMenuLabel>
              <div className="py-1">
                {allSeasons.map(season => (
                  <DropdownMenuCheckboxItem
                    key={season}
                    checked={activeFilters.seasons.includes(season)}
                    onCheckedChange={() => toggleSeason(season)}
                  >
                    {season.charAt(0).toUpperCase() + season.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Studio Filter */}
              <DropdownMenuLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Studios
              </DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto py-1">
                {allStudios.map(studio => (
                  <DropdownMenuCheckboxItem
                    key={studio}
                    checked={activeFilters.studios.includes(studio)}
                    onCheckedChange={() => toggleStudio(studio)}
                  >
                    {studio}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Year Filter */}
          <Select value={activeFilters.year?.toString() || 'any'} onValueChange={setYear}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Year</SelectItem>
              {allYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Score Filter */}
          <Select value={activeFilters.scoreAbove?.toString() || 'any'} onValueChange={setScoreAbove}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="Min Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Score</SelectItem>
              <SelectItem value="7">7+</SelectItem>
              <SelectItem value="7.5">7.5+</SelectItem>
              <SelectItem value="8">8+</SelectItem>
              <SelectItem value="8.5">8.5+</SelectItem>
              <SelectItem value="9">9+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            Clear All
          </Button>
        )}
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.genres.map(genre => (
            <Badge key={genre} variant="secondary" className="pl-2 h-6">
              {genre}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => removeGenre(genre)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {activeFilters.seasons.map(season => (
            <Badge key={season} variant="secondary" className="pl-2 h-6 bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-300">
              {season.charAt(0).toUpperCase() + season.slice(1)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => removeSeason(season)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {activeFilters.studios.map(studio => (
            <Badge key={studio} variant="secondary" className="pl-2 h-6 bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-300">
              {studio}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => removeStudio(studio)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {activeFilters.year && (
            <Badge variant="secondary" className="pl-2 h-6 bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-300">
              Year: {activeFilters.year}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={clearYear}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {activeFilters.scoreAbove && (
            <Badge variant="secondary" className="pl-2 h-6 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-700 dark:text-yellow-300">
              Score: {activeFilters.scoreAbove}+
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={clearScore}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeFilter;
