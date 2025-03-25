
import React from 'react';
import { Anime } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Play, Plus, Check, Loader2 } from 'lucide-react';
import { useSonarr } from '@/hooks/useSonarr';
import { useAnimeList } from '@/hooks/useAnimeList';

interface AnimeBannerProps {
  anime: Anime;
  isSelected: boolean;
  onToggleSelect: () => void;
}

const AnimeBanner: React.FC<AnimeBannerProps> = ({ 
  anime, 
  isSelected,
  onToggleSelect 
}) => {
  const { addToSonarr, isPending, isConnected } = useSonarr();
  const { addToSelected } = useAnimeList();

  const handleAddToSonarr = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnected) {
      // Mark as selected when adding to Sonarr
      if (!isSelected) {
        addToSelected(anime.id);
      }
      await addToSonarr(anime);
    }
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-xl mb-10 group animate-fade-in">
      {/* Background Image */}
      <div className="absolute inset-0 bg-black">
        <img 
          src={anime.image} 
          alt={anime.title}
          className="w-full h-full object-cover opacity-60 image-fade-mask"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
            {anime.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {anime.genres.slice(0, 4).map((genre, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white"
              >
                {genre}
              </span>
            ))}
          </div>
          
          <p className="text-white/90 text-sm md:text-base line-clamp-3 md:max-w-[70%] drop-shadow-sm">
            {anime.synopsis}
          </p>
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button 
            variant={isSelected ? "secondary" : "default"} 
            onClick={onToggleSelect}
            className="transition-all-fast"
          >
            {isSelected ? (
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
          
          {isConnected && (
            <Button
              variant="outline"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
              onClick={handleAddToSonarr}
              disabled={isPending(anime.id)}
            >
              {isPending(anime.id) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Add to Sonarr
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeBanner;
