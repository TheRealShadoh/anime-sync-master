
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
  defaultRootFolder?: string;
  rootFolders?: SonarrRootFolder[];
}

export interface SonarrRootFolder {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace?: number;
  totalSpace?: number;
  unmappedFolders: Array<{
    name: string;
    path: string;
  }>;
}

export interface SonarrSeries {
  id: number;
  title: string;
  titleSlug: string;
  alternateTitles: Array<{
    title: string;
    seasonNumber?: number;
  }>;
  sortTitle: string;
  status: string;
  overview?: string;
  network?: string;
  airTime?: string;
  monitored: boolean;
  seasonFolder: boolean;
  path: string;
  statistics: {
    seasonCount: number;
    episodeFileCount: number;
    episodeCount: number;
    totalEpisodeCount: number;
    sizeOnDisk: number;
    percentOfEpisodes: number;
  };
  images: Array<{
    coverType: string;
    url: string;
  }>;
  seasons: Array<{
    seasonNumber: number;
    monitored: boolean;
    statistics: {
      episodeFileCount: number;
      episodeCount: number;
      totalEpisodeCount: number;
      sizeOnDisk: number;
      percentOfEpisodes: number;
    };
  }>;
}

export interface SonarrSeriesLookup {
  title: string;
  sortTitle: string;
  status: string;
  overview?: string;
  network?: string;
  airTime?: string;
  images: Array<{
    coverType: string;
    url: string;
  }>;
  remotePoster?: string;
  seasons: Array<{
    seasonNumber: number;
    monitored: boolean;
  }>;
  year: number;
  tvdbId: number;
  titleSlug: string;
  alternateTitles?: Array<{
    title: string;
    seasonNumber?: number;
  }>;
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
