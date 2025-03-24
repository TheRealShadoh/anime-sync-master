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
    
    // Now automatically fetch more anime from MAL public API
    const additionalAnime = await fetchPublicMalAnime(season, year);
    
    return {
      season,
      year,
      anime: [...filteredAnime, ...additionalAnime]
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

// Fetch anime from MAL Public API (no auth required)
export const fetchPublicMalAnime = async (season: Season, year: number): Promise<Anime[]> => {
  try {
    // In a real implementation, we would use the MAL public API
    // For now, generate additional mock anime for demonstration
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate more diverse mock data to simulate public API results
    const publicAnimeList: Anime[] = [
      {
        id: 201,
        title: "Sword Art Online: Progressive",
        image: "https://cdn.myanimelist.net/images/anime/1993/118883.jpg",
        synopsis: "A retelling of Sword Art Online's Aincrad arc, where Kirito and Asuna climb through the floating castle one floor at a time.",
        score: 8.1,
        season,
        year,
        status: "Currently Airing",
        genres: ["Action", "Adventure", "Fantasy", "Romance"],
        studios: ["A-1 Pictures"],
        episodes: 12,
      },
      {
        id: 202,
        title: "Made in Abyss: The Golden City",
        image: "https://cdn.myanimelist.net/images/anime/1473/126143.jpg",
        synopsis: "The story follows Riko and Reg as they descend into the Abyss, a giant hole in the earth filled with mysterious creatures and artifacts.",
        score: 8.9,
        season,
        year,
        status: "Currently Airing",
        genres: ["Adventure", "Mystery", "Drama", "Fantasy", "Sci-Fi"],
        studios: ["Kinema Citrus"],
        episodes: 13,
      },
      {
        id: 203,
        title: "Violet Evergarden Movie",
        image: "https://cdn.myanimelist.net/images/anime/1825/110716.jpg",
        synopsis: "After the war, Violet Evergarden searches for the meaning behind the last words her mentor said to her.",
        score: 9.0,
        season,
        year,
        status: "Finished Airing",
        genres: ["Drama", "Fantasy", "Slice of Life"],
        studios: ["Kyoto Animation"],
        episodes: 1,
      },
      {
        id: 204,
        title: "Kaguya-sama: Love is War - Ultra Romantic",
        image: "https://cdn.myanimelist.net/images/anime/1160/122627.jpg",
        synopsis: "The elite members of Shuchiin Academy's student council continue their competitive day-to-day antics.",
        score: 9.1,
        season,
        year,
        status: "Currently Airing",
        genres: ["Comedy", "Romance", "Psychological"],
        studios: ["A-1 Pictures"],
        episodes: 13,
      },
      {
        id: 205,
        title: "Mushoku Tensei: Jobless Reincarnation",
        image: "https://cdn.myanimelist.net/images/anime/1530/117776.jpg",
        synopsis: "A 34-year-old NEET is reincarnated into a magical world as Rudeus Greyrat and resolves to live his new life to the fullest.",
        score: 8.7,
        season,
        year,
        status: "Currently Airing",
        genres: ["Drama", "Fantasy", "Ecchi"],
        studios: ["Studio Bind"],
        episodes: 23,
      },
      {
        id: 206,
        title: "86 EIGHTY-SIX",
        image: "https://cdn.myanimelist.net/images/anime/1987/117507.jpg",
        synopsis: "The Republic of San Magnolia has been at war with the Empire of Giad for nine years. Though they claim to have no casualties, the truth is they send those of the 86th sector to fight with unmanned drones.",
        score: 8.3,
        season,
        year,
        status: "Currently Airing",
        genres: ["Action", "Drama", "Sci-Fi", "Mecha"],
        studios: ["A-1 Pictures"],
        episodes: 23,
      },
      {
        id: 207,
        title: "Vinland Saga Season 2",
        image: "https://cdn.myanimelist.net/images/anime/1170/124312.jpg",
        synopsis: "Thorfinn pursues a journey with his father's killer to take revenge and end his life in a duel to the death.",
        score: 8.8,
        season,
        year,
        status: "Currently Airing",
        genres: ["Action", "Adventure", "Drama", "Historical"],
        studios: ["MAPPA"],
        episodes: 24,
      },
      {
        id: 208,
        title: "Jujutsu Kaisen Season 2",
        image: "https://cdn.myanimelist.net/images/anime/1792/138022.jpg",
        synopsis: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman school to be able to locate the demon's other body parts and thus exorcise himself.",
        score: 8.9,
        season,
        year,
        status: "Currently Airing",
        genres: ["Action", "Supernatural"],
        studios: ["MAPPA"],
        episodes: 23,
      },
      {
        id: 209,
        title: "Chainsaw Man",
        image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
        synopsis: "Denji has a simple dream—to live a happy and peaceful life with the power of a devil inside him.",
        score: 8.7,
        season,
        year,
        status: "Currently Airing",
        genres: ["Action", "Fantasy", "Horror", "Supernatural"],
        studios: ["MAPPA"],
        episodes: 12,
      },
      {
        id: 210,
        title: "Fullmetal Alchemist: Brotherhood",
        image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
        synopsis: "Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes wrong and leaves them in damaged physical forms.",
        score: 9.1,
        season,
        year,
        status: "Finished Airing",
        genres: ["Action", "Adventure", "Drama", "Fantasy"],
        studios: ["Bones"],
        episodes: 64,
      },
      {
        id: 211,
        title: "Attack on Titan: The Final Season",
        image: "https://cdn.myanimelist.net/images/anime/1000/110531.jpg",
        synopsis: "The final season of Attack on Titan.",
        score: 9.0,
        season,
        year,
        status: "Currently Airing",
        genres: ["Action", "Drama", "Fantasy", "Mystery"],
        studios: ["MAPPA"],
        episodes: 16,
      },
      {
        id: 212,
        title: "Demon Slayer: Entertainment District Arc",
        image: "https://cdn.myanimelist.net/images/anime/1908/120036.jpg",
        synopsis: "Tanjiro and his friends join the Sound Hashira, Tengen Uzui, to investigate demon activity in the Entertainment District.",
        score: 8.8,
        season,
        year,
        status: "Currently Airing",
        genres: ["Action", "Fantasy", "Historical", "Supernatural"],
        studios: ["ufotable"],
        episodes: 11,
      },
    ];
    
    return publicAnimeList;
  } catch (error) {
    console.error("Error fetching public MAL anime:", error);
    toast.error("Failed to load anime from MyAnimeList");
    return [];
  }
};

// Get more anime from MAL API with auth token
export const fetchMoreAnime = async (season: Season, year: number): Promise<Anime[]> => {
  try {
    if (!malConfig.connected || !malConfig.clientId) {
      return [];
    }
    
    // In a real implementation, call the MAL API with auth token
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, generate additional mock anime
    const additionalAnime: Anime[] = [
      {
        id: 301,
        title: "Authorized Anime 1",
        image: "https://cdn.myanimelist.net/images/anime/1000/110531.jpg",
        synopsis: "This anime is only visible with MAL authorization.",
        score: 8.3,
        season,
        year,
        status: "Currently Airing",
        genres: ["Action", "Adventure"],
        studios: ["A-1 Pictures"],
        episodes: 12,
      },
      {
        id: 302,
        title: "Authorized Anime 2",
        image: "https://cdn.myanimelist.net/images/anime/1000/113613.jpg",
        synopsis: "Another anime only visible with MAL authorization.",
        score: 7.9,
        season,
        year,
        status: "Currently Airing",
        genres: ["Comedy", "Romance"],
        studios: ["Madhouse"],
        episodes: 13,
      },
    ];
    
    return additionalAnime;
  } catch (error) {
    console.error("Error fetching authorized anime:", error);
    return [];
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
