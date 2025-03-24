
// Anime Types
export interface Anime {
  id: number;
  title: string;
  alternativeTitles?: {
    japanese?: string;
    english?: string;
  };
  image: string;
  synopsis: string;
  score?: number;
  season?: string;
  year?: number;
  status: string;
  genres: string[];
  studios?: string[];
  episodes?: number;
  airingStart?: string;
  selected?: boolean;
  inSonarr?: boolean;
}

export type Season = 'winter' | 'spring' | 'summer' | 'fall';

export interface SeasonData {
  season: Season;
  year: number;
  anime: Anime[];
}

// Sonarr Types
export interface SonarrConfig {
  url: string;
  apiKey: string;
  connected: boolean;
}

// MAL API Types
export interface MalConfig {
  clientId: string;
  connected: boolean;
}

// Auto-Selection Rules
export interface AutoRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: RuleCondition[];
}

export interface RuleCondition {
  field: 'genre' | 'studio' | 'score' | 'title';
  operator: 'contains' | 'equals' | 'greater' | 'less' | 'matches';
  value: string | number;
}
