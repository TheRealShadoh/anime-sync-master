
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAnimeList } from '@/hooks/useAnimeList';
import { useSonarr } from '@/hooks/useSonarr';
import AnimeCard from '@/components/AnimeCard';
import AnimeFilter, { AnimeFilters } from '@/components/AnimeFilter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Anime } from '@/lib/types';
import { Plus, CheckCircle2, AlertCircle, Star, Check, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getAllSonarrSeries } from '@/lib/api';

const SelectedAnime: React.FC = () => {
  const { getSelectedAnime, toggleSelection, isSelected } = useAnimeList();
  const { addToSonarr, isConnected, isPending, config } = useSonarr();
  const [selectedAnime, setSelectedAnime] = useState<Anime[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([]);
  const [selectedAnimeDetail, setSelectedAnimeDetail] = useState<Anime | null>(null);
  const [sonarrSeries, setSonarrSeries] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<AnimeFilters>({
    genres: [],
    seasons: [],
    studios: []
  });

  // Load selected anime and Sonarr series on mount
  useEffect(() => {
    const loadAnime = () => {
      const anime = getSelectedAnime();
      setSelectedAnime(anime);
      setFilteredAnime(anime);
    };

    loadAnime();

    // Fetch Sonarr series and check if selected anime are already in Sonarr
    const fetchSonarrSeries = async () => {
      if (isConnected) {
        setIsLoading(true);
        try {
          const series = await getAllSonarrSeries();
          // Extract titles to check against anime titles
          const titles = series.map(s => s.title.toLowerCase());
          const altTitles = series.flatMap(s => 
            s.alternateTitles?.map(alt => alt.title.toLowerCase()) || []
          );
          
          // Combined list of all titles
          const allTitles = [...titles, ...altTitles];
          
          // Mark anime that are already in Sonarr
          const updatedSelectedAnime = getSelectedAnime().map(anime => ({
            ...anime,
            inSonarr: allTitles.some(title => 
              title === anime.title.toLowerCase() || 
              title === anime.alternativeTitles?.english?.toLowerCase()
            )
          }));
          
          setSelectedAnime(updatedSelectedAnime);
          setFilteredAnime(updatedSelectedAnime);
          
          // Store IDs of anime in Sonarr for quick reference
          const inSonarrIds = updatedSelectedAnime
            .filter(anime => anime.inSonarr)
            .map(anime => anime.id);
            
          setSonarrSeries(inSonarrIds);
        } catch (error) {
          console.error('Error fetching Sonarr series:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSonarrSeries();
  }, [getSelectedAnime, isConnected]);

  // Apply filters when they change
  useEffect(() => {
    const applyFilters = () => {
      const filtered = selectedAnime.filter(anime => {
        // Genre filter
        if (filters.genres.length > 0 && 
            !anime.genres.some(genre => filters.genres.includes(genre))) {
          return false;
        }
        
        // Season filter
        if (filters.seasons.length > 0 && 
            anime.season && 
            !filters.seasons.includes(anime.season)) {
          return false;
        }
        
        // Year filter
        if (filters.year && anime.year !== filters.year) {
          return false;
        }
        
        // Studio filter
        if (filters.studios.length > 0 && 
            (!anime.studios || 
             !anime.studios.some(studio => filters.studios.includes(studio)))) {
          return false;
        }
        
        // Score filter
        if (filters.scoreAbove && 
            (!anime.score || anime.score < filters.scoreAbove)) {
          return false;
        }
        
        return true;
      });
      
      setFilteredAnime(filtered);
    };
    
    applyFilters();
  }, [selectedAnime, filters]);

  const handleAddAllToSonarr = async () => {
    if (!isConnected) return;
    
    // Filter out anime that are already in Sonarr
    const animeToAdd = filteredAnime.filter(anime => !anime.inSonarr && !isPending(anime.id));
    
    setIsLoading(true);
    for (const anime of animeToAdd) {
      const success = await addToSonarr(anime);
      if (success) {
        setSonarrSeries(prev => [...prev, anime.id]);
        // Update the selected anime list
        setSelectedAnime(prev => 
          prev.map(a => a.id === anime.id ? { ...a, inSonarr: true } : a)
        );
      }
    }
    setIsLoading(false);
  };

  const isInSonarr = (animeId: number) => {
    return sonarrSeries.includes(animeId);
  };

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Selected Anime</h1>
          <p className="text-muted-foreground">
            Manage your selected anime and add them to Sonarr
          </p>
        </div>
        
        {selectedAnime.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No anime selected</h3>
            <p className="text-muted-foreground max-w-md">
              Browse the seasonal anime and select the ones you're interested in
            </p>
            <Button 
              className="mt-6" 
              onClick={() => window.location.href = '/'}
            >
              Browse Anime
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-medium">
                  {selectedAnime.length} {selectedAnime.length === 1 ? 'anime' : 'animes'} selected
                </h2>
              </div>
              
              {isConnected && (
                <Button 
                  onClick={handleAddAllToSonarr} 
                  disabled={isLoading || filteredAnime.every(anime => anime.inSonarr || isPending(anime.id))}
                >
                  {isLoading ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Add All to Sonarr
                </Button>
              )}
            </div>
            
            {!isConnected && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect to Sonarr in the settings to add these anime to your library
                </AlertDescription>
              </Alert>
            )}
            
            {/* Filter Component */}
            <div className="mb-6">
              <AnimeFilter 
                animeList={selectedAnime}
                onFiltersChange={setFilters}
              />
            </div>
            
            {filteredAnime.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium">No anime match the selected filters</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or select different anime
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAnime.map(anime => (
                  <AnimeCard 
                    key={anime.id}
                    anime={anime}
                    isSelected={isSelected(anime.id)}
                    onToggleSelect={() => toggleSelection(anime.id)}
                    onClick={() => setSelectedAnimeDetail(anime)}
                    inSonarr={isInSonarr(anime.id) || anime.inSonarr}
                    isPending={isPending(anime.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Anime Detail Dialog */}
        <Dialog 
          open={!!selectedAnimeDetail} 
          onOpenChange={(open) => !open && setSelectedAnimeDetail(null)}
        >
          <DialogContent className="max-w-3xl overflow-hidden glass">
            {selectedAnimeDetail && (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 md:w-1/3">
                  <img 
                    src={selectedAnimeDetail.image} 
                    alt={selectedAnimeDetail.title}
                    className="w-full aspect-[2/3] object-cover rounded-md"
                  />
                </div>
                
                <div className="flex-grow md:w-2/3">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedAnimeDetail.title}</DialogTitle>
                    <DialogDescription>
                      {selectedAnimeDetail.alternativeTitles?.japanese && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {selectedAnimeDetail.alternativeTitles.japanese}
                        </div>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedAnimeDetail.genres.map((genre, index) => (
                        <Badge key={index} variant="secondary">{genre}</Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      {selectedAnimeDetail.score && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span>{selectedAnimeDetail.score.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {selectedAnimeDetail.episodes && (
                        <div>Episodes: {selectedAnimeDetail.episodes}</div>
                      )}
                      
                      {selectedAnimeDetail.studios && selectedAnimeDetail.studios.length > 0 && (
                        <div>Studio: {selectedAnimeDetail.studios.join(', ')}</div>
                      )}
                    </div>
                    
                    <p className="text-sm">{selectedAnimeDetail.synopsis}</p>
                    
                    <div className="flex gap-3 pt-4">
                      {isInSonarr(selectedAnimeDetail.id) || selectedAnimeDetail.inSonarr ? (
                        <Button variant="secondary" disabled>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          In Sonarr
                        </Button>
                      ) : isPending(selectedAnimeDetail.id) ? (
                        <Button variant="secondary" disabled>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Adding to Sonarr...
                        </Button>
                      ) : isConnected ? (
                        <Button 
                          onClick={() => addToSonarr(selectedAnimeDetail)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add to Sonarr
                        </Button>
                      ) : null}
                      
                      <Button 
                        variant={isSelected(selectedAnimeDetail.id) ? "secondary" : "default"} 
                        onClick={() => toggleSelection(selectedAnimeDetail.id)}
                      >
                        {isSelected(selectedAnimeDetail.id) ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Selected
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Select
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default SelectedAnime;
