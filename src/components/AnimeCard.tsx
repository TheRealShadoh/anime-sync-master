
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Anime } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Plus, Star, Calendar, Play, Loader2 } from 'lucide-react';
import { useSonarr } from '@/hooks/useSonarr';

interface AnimeCardProps {
  anime: Anime;
  isSelected: boolean;
  onToggleSelect: () => void;
  onClick?: () => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ 
  anime, 
  isSelected, 
  onToggleSelect,
  onClick 
}) => {
  const { addToSonarr, isPending, isConnected } = useSonarr();

  const handleAddToSonarr = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnected) {
      await addToSonarr(anime);
    }
  };

  const handleToggleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect();
  };

  return (
    <Card 
      className="overflow-hidden h-full transition-all-fast hover:shadow-lg cursor-pointer border-transparent hover:border-primary/20 glass-card animate-scale-in"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img 
          src={anime.image} 
          alt={anime.title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {anime.score && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 backdrop-blur-sm bg-black/60 text-white border-0 flex items-center gap-1"
          >
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {anime.score.toFixed(1)}
          </Badge>
        )}
        
        <Button 
          variant={isSelected ? "secondary" : "default"} 
          size="sm"
          className="absolute bottom-2 left-2 transition-all"
          onClick={handleToggleSelect}
        >
          {isSelected ? (
            <>
              <Check className="mr-1 h-3 w-3" />
              Selected
            </>
          ) : (
            <>
              <Plus className="mr-1 h-3 w-3" />
              Select
            </>
          )}
        </Button>
        
        {isConnected && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30 h-8 w-8"
            onClick={handleAddToSonarr}
            disabled={isPending(anime.id)}
          >
            {isPending(anime.id) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {anime.season && anime.year && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} {anime.year}
            </Badge>
          )}
          
          {anime.studios && anime.studios.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {anime.studios[0]}
            </Badge>
          )}
        </div>
        
        <h3 className="font-medium leading-tight line-clamp-2 h-[40px]">
          {anime.title}
        </h3>
        
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 h-[32px]">
          {anime.synopsis}
        </p>
      </CardContent>
    </Card>
  );
};

export default AnimeCard;
