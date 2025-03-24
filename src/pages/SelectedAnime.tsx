
import React, { useState } from 'react';
import Header from '@/components/Header';
import { useAnimeList } from '@/hooks/useAnimeList';
import { useSonarr } from '@/hooks/useSonarr';
import AnimeCard from '@/components/AnimeCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Anime } from '@/lib/types';
import { Plus, CheckCircle2, AlertCircle, Star, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const SelectedAnime: React.FC = () => {
  const { getSelectedAnime, toggleSelection, isSelected } = useAnimeList();
  const { addToSonarr, isConnected } = useSonarr();
  const selectedAnime = getSelectedAnime();
  const [selectedAnimeDetail, setSelectedAnimeDetail] = useState<Anime | null>(null);

  const handleAddAllToSonarr = async () => {
    if (!isConnected) return;
    
    for (const anime of selectedAnime) {
      await addToSonarr(anime);
    }
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
                <Button onClick={handleAddAllToSonarr}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {selectedAnime.map(anime => (
                <AnimeCard 
                  key={anime.id}
                  anime={anime}
                  isSelected={isSelected(anime.id)}
                  onToggleSelect={() => toggleSelection(anime.id)}
                  onClick={() => setSelectedAnimeDetail(anime)}
                />
              ))}
            </div>
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
