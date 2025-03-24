
import React, { useState } from 'react';
import { useAnimeList } from '@/hooks/useAnimeList';
import AnimeCard from './AnimeCard';
import AnimeBanner from './AnimeBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Anime } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Star, Check, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SeasonBrowser: React.FC = () => {
  const { 
    currentSeason, 
    nextSeason, 
    isLoading, 
    isSelected, 
    toggleSelection,
    loadCurrentSeason,
    loadNextSeason
  } = useAnimeList();
  
  const [selectedTab, setSelectedTab] = useState('current');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  
  const handleRefresh = () => {
    if (selectedTab === 'current') {
      loadCurrentSeason();
    } else {
      loadNextSeason();
    }
  };
  
  const featuredAnime = selectedTab === 'current' 
    ? currentSeason?.anime[0]
    : nextSeason?.anime[0];

  return (
    <div className="w-full animate-fade-in">
      {/* Featured Anime Banner */}
      {featuredAnime && (
        <AnimeBanner 
          anime={featuredAnime}
          isSelected={isSelected(featuredAnime.id)}
          onToggleSelect={() => toggleSelection(featuredAnime.id)}
        />
      )}
      
      {/* Season Tabs */}
      <div className="mb-6 flex justify-between items-center">
        <Tabs 
          defaultValue="current" 
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="current">
                Current Season 
                {currentSeason?.anime && (
                  <span className="ml-2 text-xs bg-muted-foreground/20 px-2 py-0.5 rounded-full">
                    {currentSeason.anime.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="next">
                Next Season
                {nextSeason?.anime && (
                  <span className="ml-2 text-xs bg-muted-foreground/20 px-2 py-0.5 rounded-full">
                    {nextSeason.anime.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="ml-2"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <TabsContent value="current" className="mt-0">
            {isLoading && !currentSeason ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, i) => (
                  <AnimeCardSkeleton key={i} />
                ))}
              </div>
            ) : currentSeason?.anime.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium">No anime found for this season</h3>
                <p className="text-muted-foreground">Check back later or try a different season</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {currentSeason?.anime.map((anime) => (
                  <AnimeCard 
                    key={anime.id}
                    anime={anime}
                    isSelected={isSelected(anime.id)}
                    onToggleSelect={() => toggleSelection(anime.id)}
                    onClick={() => setSelectedAnime(anime)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="next" className="mt-0">
            {isLoading && !nextSeason ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, i) => (
                  <AnimeCardSkeleton key={i} />
                ))}
              </div>
            ) : nextSeason?.anime.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium">No anime found for next season</h3>
                <p className="text-muted-foreground">Check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {nextSeason?.anime.map((anime) => (
                  <AnimeCard 
                    key={anime.id}
                    anime={anime}
                    isSelected={isSelected(anime.id)}
                    onToggleSelect={() => toggleSelection(anime.id)}
                    onClick={() => setSelectedAnime(anime)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Anime Detail Dialog */}
      <Dialog 
        open={!!selectedAnime} 
        onOpenChange={(open) => !open && setSelectedAnime(null)}
      >
        <DialogContent className="max-w-3xl overflow-hidden glass">
          {selectedAnime && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 md:w-1/3">
                <img 
                  src={selectedAnime.image} 
                  alt={selectedAnime.title}
                  className="w-full aspect-[2/3] object-cover rounded-md"
                />
              </div>
              
              <div className="flex-grow md:w-2/3">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedAnime.title}</DialogTitle>
                  <DialogDescription>
                    {selectedAnime.alternativeTitles?.japanese && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {selectedAnime.alternativeTitles.japanese}
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedAnime.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 text-sm">
                    {selectedAnime.score && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>{selectedAnime.score.toFixed(1)}</span>
                      </div>
                    )}
                    
                    {selectedAnime.episodes && (
                      <div>Episodes: {selectedAnime.episodes}</div>
                    )}
                    
                    {selectedAnime.studios && selectedAnime.studios.length > 0 && (
                      <div>Studio: {selectedAnime.studios.join(', ')}</div>
                    )}
                  </div>
                  
                  <p className="text-sm">{selectedAnime.synopsis}</p>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant={isSelected(selectedAnime.id) ? "secondary" : "default"} 
                      onClick={() => toggleSelection(selectedAnime.id)}
                    >
                      {isSelected(selectedAnime.id) ? (
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
    </div>
  );
};

// Skeleton loader for anime cards
const AnimeCardSkeleton = () => {
  return (
    <div className="overflow-hidden h-full border rounded-lg">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
};

export default SeasonBrowser;
