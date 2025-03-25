
import { Anime, Season, SeasonData, SonarrConfig, AutoRule, MalConfig, SonarrRootFolder, SonarrSeries, SonarrSeriesLookup } from "./types";
import { toast } from "sonner";
import axios from "axios";

// Jikan API base URL
const JIKAN_API_BASE = "https://api.jikan.moe/v4";

// Get current season and year
const getCurrentSeasonInfo = () => {
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  let season: Season;
  if (month >= 0 && month < 3) season = "winter";
  else if (month >= 3 && month < 6) season = "spring";
  else if (month >= 6 && month < 9) season = "summer";
  else season = "fall";
  
  return { season, year };
};

const { season: currentSeason, year: currentYear } = getCurrentSeasonInfo();

// Transform Jikan API response to our Anime type
const transformJikanAnime = (jikanAnime: any): Anime => {
  return {
    id: jikanAnime.mal_id,
    title: jikanAnime.title || jikanAnime.title_english || "Unknown Title",
    alternativeTitles: {
      japanese: jikanAnime.title_japanese || undefined,
      english: jikanAnime.title_english || undefined,
    },
    image: jikanAnime.images?.jpg?.large_image_url || jikanAnime.images?.jpg?.image_url || "",
    synopsis: jikanAnime.synopsis || "No synopsis available",
    score: jikanAnime.score,
    season: jikanAnime.season,
    year: jikanAnime.year,
    status: jikanAnime.status || "Unknown Status",
    genres: jikanAnime.genres?.map((g: any) => g.name) || [],
    studios: jikanAnime.studios?.map((s: any) => s.name) || [],
    episodes: jikanAnime.episodes,
    airingStart: jikanAnime.aired?.from ? new Date(jikanAnime.aired.from).toISOString() : undefined,
    selected: false,
    inSonarr: false
  };
};

// Rate limiting helper for Jikan API (which has a limit of 3 requests per second)
const jikanRateLimit = async () => {
  await new Promise(resolve => setTimeout(resolve, 400)); // Ensure we don't exceed rate limits
};

// Helper function to get anime by season
export const getSeasonalAnime = async (
  season: Season = currentSeason,
  year: number = currentYear
): Promise<SeasonData> => {
  try {
    // Log what we're fetching
    console.log(`Fetching ${season} ${year} anime from Jikan API`);
    
    // Make the API request
    const response = await axios.get(`${JIKAN_API_BASE}/seasons/${year}/${season}`);
    await jikanRateLimit();
    
    // Check if the response is valid
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response from Jikan API");
    }
    
    // Transform the data to our format
    const animeList = response.data.data.map(transformJikanAnime);
    
    return {
      season,
      year,
      anime: animeList
    };
  } catch (error) {
    console.error("Error fetching seasonal anime:", error);
    toast.error("Failed to load seasonal anime");
    throw error;
  }
};

// Get current season's anime
export const getCurrentSeasonAnime = async (): Promise<SeasonData> => {
  return getSeasonalAnime(currentSeason, currentYear);
};

// Get next season's anime
export const getNextSeasonAnime = async (): Promise<SeasonData> => {
  let nextSeason: Season;
  let nextYear = currentYear;
  
  switch (currentSeason) {
    case "winter": nextSeason = "spring"; break;
    case "spring": nextSeason = "summer"; break;
    case "summer": nextSeason = "fall"; break;
    case "fall": nextSeason = "winter"; nextYear = currentYear + 1; break;
  }
  
  return getSeasonalAnime(nextSeason, nextYear);
};

// Get more anime from MAL API with auth token (more detailed anime for authenticated users)
export const fetchMoreAnime = async (season: Season, year: number): Promise<Anime[]> => {
  try {
    if (!getMalConfig().connected) {
      return [];
    }
    
    // This would use the authenticated MAL API in a real implementation
    // But for now, just return empty array as we're focusing on public data
    return [];
  } catch (error) {
    console.error("Error fetching authorized anime:", error);
    return [];
  }
};

// Fetch anime details using Jikan API
export const fetchAnimeDetails = async (animeId: number): Promise<Anime | null> => {
  try {
    const response = await axios.get(`${JIKAN_API_BASE}/anime/${animeId}/full`);
    await jikanRateLimit();
    
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response from Jikan API");
    }
    
    return transformJikanAnime(response.data.data);
  } catch (error) {
    console.error(`Error fetching anime details for ID ${animeId}:`, error);
    return null;
  }
};

// Sonarr API integration
let sonarrConfig: SonarrConfig = {
  url: "",
  apiKey: "",
  connected: false
};

// Test Sonarr connection
export const testSonarrConnection = async (url: string, apiKey: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${url}/api/v3/system/status`, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });
    
    if (response.status === 200) {
      toast.success('Successfully connected to Sonarr');
      return true;
    } else {
      toast.error('Failed to connect to Sonarr');
      return false;
    }
  } catch (error) {
    console.error('Error testing Sonarr connection:', error);
    toast.error('Failed to connect to Sonarr');
    return false;
  }
};

// Save Sonarr configuration
export const saveSonarrConfig = async (config: SonarrConfig): Promise<boolean> => {
  try {
    // Test connection first
    const isConnected = await testSonarrConnection(config.url, config.apiKey);
    if (!isConnected) {
      return false;
    }

    // Get root folders
    const rootFolders = await getSonarrRootFolders();
    
    // Save configuration with root folders
    sonarrConfig = {
      ...config,
      connected: true,
      rootFolders: rootFolders
    };
    
    localStorage.setItem('sonarrConfig', JSON.stringify(sonarrConfig));
    return true;
  } catch (error) {
    console.error('Error saving Sonarr config:', error);
    toast.error('Failed to save Sonarr configuration');
    return false;
  }
};

// Sonarr API Functions

// Get root folders from Sonarr
export const getSonarrRootFolders = async (): Promise<SonarrRootFolder[]> => {
  try {
    const config = getSonarrConfig();
    if (!config.connected) {
      throw new Error('Sonarr is not connected');
    }

    const response = await axios.get(`${config.url}/api/v3/rootfolder`, {
      headers: {
        'X-Api-Key': config.apiKey,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error getting root folders:', error);
    toast.error(`Failed to get root folders: ${error.message}`);
    return [];
  }
};

// Search for series in Sonarr
export const searchSonarrSeries = async (searchTerm: string): Promise<SonarrSeriesLookup[]> => {
  try {
    const config = getSonarrConfig();
    if (!config.connected) {
      throw new Error('Sonarr is not connected');
    }

    const response = await axios.get(`${config.url}/api/v3/series/lookup`, {
      headers: {
        'X-Api-Key': config.apiKey,
      },
      params: {
        term: searchTerm
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error searching series:', error);
    toast.error(`Failed to search series: ${error.message}`);
    return [];
  }
};

// Get all series from Sonarr
export const getAllSonarrSeries = async (): Promise<SonarrSeries[]> => {
  try {
    const config = getSonarrConfig();
    if (!config.connected) {
      throw new Error('Sonarr is not connected');
    }

    const response = await axios.get(`${config.url}/api/v3/series`, {
      headers: {
        'X-Api-Key': config.apiKey,
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error getting series:', error);
    toast.error(`Failed to get series: ${error.message}`);
    return [];
  }
};

// Get series by ID
export const getSonarrSeriesById = async (id: number): Promise<SonarrSeries | null> => {
  try {
    const config = getSonarrConfig();
    if (!config.connected) {
      throw new Error('Sonarr is not connected');
    }

    const response = await axios.get(`${config.url}/api/v3/series/${id}`, {
      headers: {
        'X-Api-Key': config.apiKey,
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error getting series by ID:', error);
    toast.error(`Failed to get series details: ${error.message}`);
    return null;
  }
};

// Sonarr configuration management
export const getSonarrConfig = (): SonarrConfig => {
  const savedConfig = localStorage.getItem("sonarrConfig");
  if (savedConfig) {
    sonarrConfig = JSON.parse(savedConfig);
    // Also load default root folder if saved
    const defaultRootFolder = localStorage.getItem("defaultRootFolder");
    if (defaultRootFolder) {
      sonarrConfig.defaultRootFolder = defaultRootFolder;
    }
  }
  return sonarrConfig;
};

// Set default root folder
export const setDefaultRootFolder = (path: string): void => {
  localStorage.setItem("defaultRootFolder", path);
  sonarrConfig.defaultRootFolder = path;
  toast.success('Default root folder updated');
};

// Selected anime storage
let selectedAnime: Anime[] = [];

// Get selected anime
export const getSelectedAnime = (): Anime[] => {
  return selectedAnime;
};

// Toggle anime selection
export const toggleAnimeSelection = (anime: Anime): void => {
  const index = selectedAnime.findIndex(a => a.id === anime.id);
  if (index >= 0) {
    selectedAnime = selectedAnime.filter(a => a.id !== anime.id);
  } else {
    selectedAnime.push({...anime, selected: true});
  }
};

// Clear all selections
export const clearAnimeSelections = (): void => {
  selectedAnime = [];
};

// Add multiple selected anime to Sonarr
export const addSelectedAnimeToSonarr = async (rootFolderPath?: string): Promise<boolean> => {
  try {
    const config = getSonarrConfig();
    if (!config.connected) {
      throw new Error('Sonarr is not connected');
    }

    const selected = getSelectedAnime();
    if (selected.length === 0) {
      throw new Error('No anime selected');
    }

    const results = await Promise.all(
      selected.map(anime => addAnimeToSonarr(anime, rootFolderPath))
    );

    const successCount = results.filter(Boolean).length;
    if (successCount === selected.length) {
      toast.success(`Successfully added ${successCount} anime to Sonarr`);
      clearAnimeSelections();
      return true;
    } else {
      toast.error(`Added ${successCount}/${selected.length} anime to Sonarr`);
      return false;
    }
  } catch (error: any) {
    console.error('Error adding selected anime to Sonarr:', error);
    toast.error(`Failed to add anime: ${error.message}`);
    return false;
  }
};

// Add anime to Sonarr with lookup
export const addAnimeToSonarr = async (anime: Anime, rootFolderPath?: string): Promise<boolean> => {
  try {
    const config = getSonarrConfig();
    if (!config.connected) {
      throw new Error('Sonarr is not connected');
    }

    // Search for the series first to get proper TVDb ID
    const searchResults = await searchSonarrSeries(anime.title);
    if (!searchResults.length) {
      throw new Error('No matching series found in Sonarr');
    }

    // Find best match from search results
    const series = searchResults.find(s => 
      s.title.toLowerCase() === anime.title.toLowerCase() ||
      (s.alternateTitles && s.alternateTitles.some(alt => 
        alt.title.toLowerCase() === anime.title.toLowerCase()
      ))
    ) || searchResults[0];

    // Use provided root folder path or default from config
    const folderPath = rootFolderPath || config.defaultRootFolder || '/tv/';

    const response = await axios.post(`${config.url}/api/v3/series`, {
      title: series.title,
      tvdbId: series.tvdbId,
      titleSlug: series.titleSlug,
      images: series.images,
      qualityProfileId: 1, // Using default profile
      seasonFolder: true,
      monitored: true,
      rootFolderPath: folderPath,
      seriesType: 'anime',
      addOptions: {
        monitor: 'all',
        searchForMissingEpisodes: true
      }
    }, {
      headers: {
        'X-Api-Key': config.apiKey,
      },
    });

    toast.success(`Added "${anime.title}" to Sonarr`);
    return true;
  } catch (error: any) {
    console.error("Error adding anime to Sonarr:", error);
    toast.error(`Failed to add "${anime.title}" to Sonarr: ${error.message}`);
    return false;
  }
};

// Auto-selection rules
let savedRules: AutoRule[] = [];

// Get saved rules
export const getAutoRules = (): AutoRule[] => {
  const savedRulesString = localStorage.getItem("autoRules");
  if (savedRulesString) {
    savedRules = JSON.parse(savedRulesString);
  }
  return savedRules;
};

// Save auto-selection rule
export const saveAutoRule = (rule: AutoRule): void => {
  const rules = getAutoRules();
  const existingRuleIndex = rules.findIndex(r => r.id === rule.id);
  
  if (existingRuleIndex >= 0) {
    rules[existingRuleIndex] = rule;
  } else {
    rules.push(rule);
  }
  
  localStorage.setItem("autoRules", JSON.stringify(rules));
  savedRules = rules;
  toast.success(`Rule "${rule.name}" saved`);
};

// Delete auto-selection rule
export const deleteAutoRule = (ruleId: string): void => {
  const rules = getAutoRules();
  const filteredRules = rules.filter(r => r.id !== ruleId);
  
  localStorage.setItem("autoRules", JSON.stringify(filteredRules));
  savedRules = filteredRules;
  toast.success("Rule deleted");
};

// Apply auto-selection rules to anime list
export const applyAutoRules = (animeList: Anime[]): Anime[] => {
  const rules = getAutoRules().filter(r => r.enabled);
  
  if (rules.length === 0) return animeList;
  
  return animeList.map(anime => {
    // Check each rule against the anime
    for (const rule of rules) {
      // Assumes all conditions must match (AND logic)
      const allConditionsMatch = rule.conditions.every(condition => {
        switch (condition.field) {
          case 'genre':
            return anime.genres.some(genre => 
              condition.operator === 'contains' 
                ? genre.toLowerCase().includes(String(condition.value).toLowerCase())
                : genre.toLowerCase() === String(condition.value).toLowerCase()
            );
          case 'studio':
            return anime.studios?.some(studio => 
              condition.operator === 'contains' 
                ? studio.toLowerCase().includes(String(condition.value).toLowerCase())
                : studio.toLowerCase() === String(condition.value).toLowerCase()
            ) || false;
          case 'score':
            if (!anime.score) return false;
            switch (condition.operator) {
              case 'greater': return anime.score > Number(condition.value);
              case 'less': return anime.score < Number(condition.value);
              case 'equals': return anime.score === Number(condition.value);
              default: return false;
            }
          case 'title':
            return condition.operator === 'contains' 
              ? anime.title.toLowerCase().includes(String(condition.value).toLowerCase())
              : condition.operator === 'matches' 
                ? new RegExp(String(condition.value), 'i').test(anime.title)
                : anime.title.toLowerCase() === String(condition.value).toLowerCase();
          default:
            return false;
        }
      });
      
      if (allConditionsMatch) {
        return { ...anime, selected: true };
      }
    }
    
    return anime;
  });
};

// MAL API integration
let malConfig = {
  clientId: "",
  connected: false
};

// Get MAL configuration
export const getMalConfig = () => {
  const savedConfig = localStorage.getItem("malConfig");
  if (savedConfig) {
    malConfig = JSON.parse(savedConfig);
  }
  return malConfig;
};

// Save MAL configuration
export const saveMalConfig = async (config: { clientId: string, connected: boolean }): Promise<boolean> => {
  try {
    // In a real implementation, validate the connection with MAL API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just save the config and assume it works
    malConfig = {
      ...config,
      connected: true
    };
    
    localStorage.setItem("malConfig", JSON.stringify(malConfig));
    return true;
  } catch (error) {
    console.error("Error saving MAL config:", error);
    return false;
  }
};
