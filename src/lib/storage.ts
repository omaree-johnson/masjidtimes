import { Timetable, DailyPrayerTime } from './types';

const STORAGE_KEY = 'prayer_timetable';
const MOSQUE_NAME_KEY = 'mosque_name';

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
};
