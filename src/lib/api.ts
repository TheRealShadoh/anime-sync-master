
import { Anime, Season, SeasonData, SonarrConfig, AutoRule } from "./types";
import { toast } from "sonner";

// Mock data for initial development before integrating real APIs
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
let currentSeason: Season = "winter";

if (currentMonth >= 3 && currentMonth < 6) currentSeason = "spring";
else if (currentMonth >= 6 && currentMonth < 9) currentSeason = "summer";
else if (currentMonth >= 9 && currentMonth < 12) currentSeason = "fall";

// Sample anime data
const sampleAnime: Anime[] = [
  {
    id: 1,
    title: "Attack on Titan Final Season",
    alternativeTitles: {
      japanese: "進撃の巨人 The Final Season",
      english: "Attack on Titan Final Season",
    },
    image: "https://cdn.myanimelist.net/images/anime/1000/110531.jpg",
    synopsis: "The final season of Attack on Titan.",
    score: 9.1,
    season: "winter",
    year: currentYear,
    status: "Currently Airing",
    genres: ["Action", "Drama", "Fantasy", "Mystery"],
    studios: ["MAPPA"],
    episodes: 16,
    airingStart: "2021-01-10",
  },
  {
    id: 2,
    title: "My Hero Academia 5",
    alternativeTitles: {
      japanese: "僕のヒーローアカデミア 5",
      english: "My Hero Academia Season 5",
    },
    image: "https://cdn.myanimelist.net/images/anime/1000/113613.jpg",
    synopsis: "The fifth season of My Hero Academia.",
    score: 8.2,
    season: "spring",
    year: currentYear,
    status: "Currently Airing",
    genres: ["Action", "Comedy", "Superhero", "School"],
    studios: ["Bones"],
    episodes: 25,
    airingStart: "2021-03-27",
  },
  {
    id: 3,
    title: "Demon Slayer: Entertainment District Arc",
    alternativeTitles: {
      japanese: "鬼滅の刃 遊郭編",
      english: "Demon Slayer: Entertainment District Arc",
    },
    image: "https://cdn.myanimelist.net/images/anime/1908/120036.jpg",
    synopsis: "Tanjiro and friends embark on a new mission in the Entertainment District.",
    score: 8.9,
    season: "winter",
    year: currentYear,
    status: "Currently Airing",
    genres: ["Action", "Fantasy", "Historical", "Supernatural"],
    studios: ["ufotable"],
    episodes: 11,
    airingStart: "2021-12-05",
  },
  {
    id: 4,
    title: "Jujutsu Kaisen 0",
    alternativeTitles: {
      japanese: "呪術廻戦 0",
      english: "Jujutsu Kaisen 0",
    },
    image: "https://cdn.myanimelist.net/images/anime/1121/119044.jpg",
    synopsis: "Yuta Okkotsu enrolls at Tokyo Jujutsu High to control the cursed spirit of his childhood friend.",
    score: 8.7,
    season: "winter",
    year: currentYear,
    status: "Finished Airing",
    genres: ["Action", "Fantasy", "Supernatural"],
    studios: ["MAPPA"],
    episodes: 1,
    airingStart: "2021-12-24",
  },
  {
    id: 5,
    title: "Spy x Family",
    alternativeTitles: {
      japanese: "スパイファミリー",
      english: "Spy x Family",
    },
    image: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
    synopsis: "A spy, an assassin, and a telepath form a fake family while keeping their identities secret from each other.",
    score: 8.6,
    season: "spring",
    year: currentYear,
    status: "Currently Airing",
    genres: ["Action", "Comedy", "Spy", "Supernatural"],
    studios: ["Wit Studio", "CloverWorks"],
    episodes: 12,
    airingStart: "2022-04-09",
  },
  {
    id: 6,
    title: "Chainsaw Man",
    alternativeTitles: {
      japanese: "チェンソーマン",
      english: "Chainsaw Man",
    },
    image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    synopsis: "Denji has a simple dream—to live a happy and peaceful life with the power of a devil inside him.",
    score: 8.8,
    season: "fall",
    year: currentYear,
    status: "Currently Airing",
    genres: ["Action", "Fantasy", "Gore", "Supernatural"],
    studios: ["MAPPA"],
    episodes: 12,
    airingStart: "2022-10-11",
  },
];

// Helper function to get anime by season
export const getSeasonalAnime = async (
  season: Season = currentSeason,
  year: number = currentYear
): Promise<SeasonData> => {
  // In a real implementation, we would call the MyAnimeList API
  // For now, return mock data
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter sample data by season and year
    const filteredAnime = sampleAnime.filter(anime => 
      anime.season === season && anime.year === year
    );
    
    return {
      season,
      year,
      anime: filteredAnime.length > 0 ? filteredAnime : sampleAnime
    };
  } catch (error) {
    console.error("Error fetching seasonal anime:", error);
    toast.error("Failed to load seasonal anime");
    throw error;
  }
};

// Get current season's anime
export const getCurrentSeasonAnime = (): Promise<SeasonData> => {
  return getSeasonalAnime(currentSeason, currentYear);
};

// Get next season's anime
export const getNextSeasonAnime = (): Promise<SeasonData> => {
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

// Sonarr API integration
let sonarrConfig: SonarrConfig = {
  url: "",
  apiKey: "",
  connected: false
};

// Save Sonarr configuration
export const saveSonarrConfig = async (config: SonarrConfig): Promise<boolean> => {
  try {
    // In a real implementation, validate the connection with Sonarr
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just save the config and assume it works
    sonarrConfig = {
      ...config,
      connected: true
    };
    
    localStorage.setItem("sonarrConfig", JSON.stringify(sonarrConfig));
    toast.success("Successfully connected to Sonarr");
    return true;
  } catch (error) {
    console.error("Error saving Sonarr config:", error);
    toast.error("Failed to connect to Sonarr");
    return false;
  }
};

// Get Sonarr configuration
export const getSonarrConfig = (): SonarrConfig => {
  const savedConfig = localStorage.getItem("sonarrConfig");
  if (savedConfig) {
    sonarrConfig = JSON.parse(savedConfig);
  }
  return sonarrConfig;
};

// Add anime to Sonarr
export const addAnimeToSonarr = async (anime: Anime): Promise<boolean> => {
  try {
    // In a real implementation, call the Sonarr API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just pretend it worked
    toast.success(`Added "${anime.title}" to Sonarr`);
    return true;
  } catch (error) {
    console.error("Error adding anime to Sonarr:", error);
    toast.error(`Failed to add "${anime.title}" to Sonarr`);
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
