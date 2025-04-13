
// Database service for storing anime data and selections
import { Anime, SeasonData } from './types';

// Database configuration
const DB_NAME = 'animeSyncMasterDB';
const DB_VERSION = 1;
const STORES = {
  SEASONS: 'seasons',
  SELECTIONS: 'selections'
};

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening database:', event);
      reject('Could not open database');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.SEASONS)) {
        db.createObjectStore(STORES.SEASONS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.SELECTIONS)) {
        db.createObjectStore(STORES.SELECTIONS, { keyPath: 'id' });
      }
    };
  });
};

// Get a specific season from the database
export const getSeasonFromDB = async (seasonId: string): Promise<SeasonData | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEASONS, 'readonly');
      const store = transaction.objectStore(STORES.SEASONS);
      const request = store.get(seasonId);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error('Error getting season:', event);
        reject('Failed to get season from database');
      };
    });
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
};

// Save a season to the database
export const saveSeasonToDB = async (seasonId: string, seasonData: SeasonData): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SEASONS, 'readwrite');
      const store = transaction.objectStore(STORES.SEASONS);
      const request = store.put({ id: seasonId, ...seasonData });
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error saving season:', event);
        reject('Failed to save season to database');
      };
    });
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
};

// Get selected anime IDs from the database
export const getSelectionsFromDB = async (): Promise<number[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SELECTIONS, 'readonly');
      const store = transaction.objectStore(STORES.SELECTIONS);
      const request = store.get('selected-anime');
      
      request.onsuccess = () => {
        resolve(request.result?.ids || []);
      };
      
      request.onerror = (event) => {
        console.error('Error getting selections:', event);
        reject('Failed to get selections from database');
      };
    });
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
};

// Save selected anime IDs to the database
export const saveSelectionsToDB = async (animeIds: number[]): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SELECTIONS, 'readwrite');
      const store = transaction.objectStore(STORES.SELECTIONS);
      const request = store.put({ id: 'selected-anime', ids: animeIds });
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error saving selections:', event);
        reject('Failed to save selections to database');
      };
    });
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
};

// Helper function to generate season ID
export const getSeasonId = (season: string, year: number): string => {
  return `${season}-${year}`;
};
