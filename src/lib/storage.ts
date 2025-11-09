import { Timetable, DailyPrayerTime } from './types';

const STORAGE_KEY = 'prayer_timetable';
const MOSQUE_NAME_KEY = 'mosque_name';
const MOSQUES_KEY = 'prayer_mosques';
const ACTIVE_MOSQUE_KEY = 'active_mosque_id';
const DEFAULT_MOSQUE_KEY = 'default_mosque_id';

// LocalStorage utilities for offline fallback
export const storage = {
  saveTimetable: (timetable: Timetable) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timetable));
    }
  },

  getTimetable: (): Timetable | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  saveMosqueName: (name: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOSQUE_NAME_KEY, name);
    }
  },

  getMosqueName: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(MOSQUE_NAME_KEY);
    }
    return null;
  },

  getTodayPrayerTimes: (): DailyPrayerTime | null => {
    const timetable = storage.getTimetable();
    if (!timetable || !timetable.times || timetable.times.length === 0) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayTimes = timetable.times.find(t => t.date === today);
    
    // If today's date not found, return the first available date
    // This helps when viewing timetables for future/past months
    if (!todayTimes && timetable.times.length > 0) {
      console.log(`Today's date ${today} not found. Using first available date: ${timetable.times[0].date}`);
      return timetable.times[0];
    }
    
    return todayTimes || null;
  },

  getFirstAvailablePrayerTimes: (): DailyPrayerTime | null => {
    const timetable = storage.getTimetable();
    if (!timetable || !timetable.times || timetable.times.length === 0) return null;
    return timetable.times[0];
  },

  getAllPrayerTimes: (): DailyPrayerTime[] => {
    const timetable = storage.getTimetable();
    if (!timetable || !timetable.times) return [];
    return timetable.times;
  },

  clearAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MOSQUE_NAME_KEY);
    }
  },

  // Multiple Mosques Management
  getAllMosques: (): Timetable[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(MOSQUES_KEY);
      return data ? JSON.parse(data) : [];
    }
    return [];
  },

  saveMosque: (timetable: Timetable) => {
    if (typeof window !== 'undefined') {
      const mosques = storage.getAllMosques();
      const existingIndex = mosques.findIndex(m => m.id === timetable.id);
      
      if (existingIndex >= 0) {
        mosques[existingIndex] = timetable;
      } else {
        mosques.push(timetable);
      }
      
      localStorage.setItem(MOSQUES_KEY, JSON.stringify(mosques));
      
      // Also save as active mosque and legacy format
      storage.setActiveMosque(timetable.id);
      storage.saveTimetable(timetable);
      storage.saveMosqueName(timetable.mosqueName);
    }
  },

  deleteMosque: (mosqueId: string): boolean => {
    if (typeof window !== 'undefined') {
      const mosques = storage.getAllMosques();
      const filtered = mosques.filter(m => m.id !== mosqueId);
      
      if (filtered.length === mosques.length) {
        return false; // Mosque not found
      }
      
      localStorage.setItem(MOSQUES_KEY, JSON.stringify(filtered));
      
      // If deleted mosque was active, switch to first available
      if (storage.getActiveMosqueId() === mosqueId) {
        if (filtered.length > 0) {
          storage.setActiveMosque(filtered[0].id);
          storage.saveTimetable(filtered[0]);
          storage.saveMosqueName(filtered[0].mosqueName);
        } else {
          storage.clearAll();
          localStorage.removeItem(ACTIVE_MOSQUE_KEY);
          localStorage.removeItem(DEFAULT_MOSQUE_KEY);
        }
      }
      
      return true;
    }
    return false;
  },

  getMosqueById: (mosqueId: string): Timetable | null => {
    const mosques = storage.getAllMosques();
    return mosques.find(m => m.id === mosqueId) || null;
  },

  getActiveMosqueId: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACTIVE_MOSQUE_KEY);
    }
    return null;
  },

  setActiveMosque: (mosqueId: string) => {
    if (typeof window !== 'undefined') {
      const mosque = storage.getMosqueById(mosqueId);
      if (mosque) {
        localStorage.setItem(ACTIVE_MOSQUE_KEY, mosqueId);
        storage.saveTimetable(mosque);
        storage.saveMosqueName(mosque.mosqueName);
      }
    }
  },

  getActiveMosque: (): Timetable | null => {
    const activeId = storage.getActiveMosqueId();
    if (activeId) {
      return storage.getMosqueById(activeId);
    }
    // Fallback to legacy storage
    return storage.getTimetable();
  },

  setDefaultMosque: (mosqueId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEFAULT_MOSQUE_KEY, mosqueId);
    }
  },

  getDefaultMosqueId: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DEFAULT_MOSQUE_KEY);
    }
    return null;
  },
};
