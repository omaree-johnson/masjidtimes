import { DailyPrayerTime } from "./types";

export interface DarkModeSettings {
  autoSchedule: boolean; // Auto switch based on prayer times
  darkStart: "maghrib" | "isha" | "sunset"; // When to enable dark mode
  lightStart: "fajr" | "sunrise"; // When to enable light mode
}

const STORAGE_KEY = "dark-mode-settings";

const DEFAULT_SETTINGS: DarkModeSettings = {
  autoSchedule: true,
  darkStart: "maghrib",
  lightStart: "fajr",
};

export class DarkModeScheduler {
  private static instance: DarkModeScheduler;
  private scheduledTimeouts: number[] = [];
  private currentPrayerTimes: DailyPrayerTime | null = null;

  private constructor() {}

  static getInstance(): DarkModeScheduler {
    if (!DarkModeScheduler.instance) {
      DarkModeScheduler.instance = new DarkModeScheduler();
    }
    return DarkModeScheduler.instance;
  }

  // Get settings
  getSettings(): DarkModeSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }

  // Save settings
  saveSettings(settings: DarkModeSettings): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  // Initialize with prayer times
  initialize(prayerTimes: DailyPrayerTime | null, setTheme: (theme: string) => void): void {
    this.currentPrayerTimes = prayerTimes;
    const settings = this.getSettings();

    if (!settings.autoSchedule || !prayerTimes) {
      return;
    }

    // Set initial theme based on current time
    const currentTheme = this.getCurrentTheme();
    if (currentTheme) {
      setTheme(currentTheme);
    }

    // Schedule theme changes
    this.scheduleThemeChanges(prayerTimes, setTheme);
  }

  // Get current theme based on prayer times
  getCurrentTheme(): "light" | "dark" | null {
    const settings = this.getSettings();
    if (!settings.autoSchedule || !this.currentPrayerTimes) {
      return null;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const darkStartTime = this.getPrayerTimeInMinutes(settings.darkStart);
    const lightStartTime = this.getPrayerTimeInMinutes(settings.lightStart);

    if (darkStartTime === null || lightStartTime === null) {
      return null;
    }

    // Handle case where dark period crosses midnight
    if (darkStartTime > lightStartTime) {
      // Dark mode from darkStart to midnight, and from midnight to lightStart
      if (currentMinutes >= darkStartTime || currentMinutes < lightStartTime) {
        return "dark";
      }
      return "light";
    } else {
      // This shouldn't normally happen, but handle it
      if (currentMinutes >= darkStartTime && currentMinutes < lightStartTime) {
        return "dark";
      }
      return "light";
    }
  }

  // Get prayer time in minutes since midnight
  private getPrayerTimeInMinutes(prayerKey: string): number | null {
    if (!this.currentPrayerTimes) return null;

    let time: string | undefined;

    if (prayerKey === "fajr") {
      time = this.currentPrayerTimes.fajr;
    } else if (prayerKey === "maghrib") {
      time = this.currentPrayerTimes.maghrib;
    } else if (prayerKey === "isha") {
      time = this.currentPrayerTimes.isha;
    } else if (prayerKey === "sunrise" || prayerKey === "sunset") {
      // These would need to be calculated or stored separately
      // For now, fall back to fajr/maghrib
      time = prayerKey === "sunrise" ? this.currentPrayerTimes.fajr : this.currentPrayerTimes.maghrib;
    }

    if (!time) return null;

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Schedule theme changes for today
  private scheduleThemeChanges(prayerTimes: DailyPrayerTime, setTheme: (theme: string) => void): void {
    // Clear existing scheduled changes
    this.clearScheduledChanges();

    const settings = this.getSettings();
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Only schedule if prayer times are for today
    if (prayerTimes.date !== today) {
      return;
    }

    // Schedule dark mode
    const darkStartTime = this.getPrayerTimeInMinutes(settings.darkStart);
    if (darkStartTime !== null) {
      const darkDate = new Date(now);
      const darkHours = Math.floor(darkStartTime / 60);
      const darkMinutes = darkStartTime % 60;
      darkDate.setHours(darkHours, darkMinutes, 0, 0);

      if (darkDate > now) {
        const timeUntilDark = darkDate.getTime() - now.getTime();
        const timeoutId = window.setTimeout(() => {
          setTheme("dark");
          console.log("Auto-switched to dark mode");
        }, timeUntilDark);
        this.scheduledTimeouts.push(timeoutId);
      }
    }

    // Schedule light mode for next day (after midnight)
    const lightStartTime = this.getPrayerTimeInMinutes(settings.lightStart);
    if (lightStartTime !== null) {
      const lightDate = new Date(now);
      const lightHours = Math.floor(lightStartTime / 60);
      const lightMinutes = lightStartTime % 60;
      
      // If light time hasn't passed today, schedule for today
      // Otherwise, schedule for tomorrow
      lightDate.setHours(lightHours, lightMinutes, 0, 0);
      if (lightDate <= now) {
        lightDate.setDate(lightDate.getDate() + 1);
      }

      const timeUntilLight = lightDate.getTime() - now.getTime();
      const timeoutId = window.setTimeout(() => {
        setTheme("light");
        console.log("Auto-switched to light mode");
      }, timeUntilLight);
      this.scheduledTimeouts.push(timeoutId);
    }

    console.log(`Scheduled ${this.scheduledTimeouts.length} theme changes`);
  }

  // Clear scheduled changes
  clearScheduledChanges(): void {
    this.scheduledTimeouts.forEach((id) => window.clearTimeout(id));
    this.scheduledTimeouts = [];
  }

  // Update prayer times and reschedule
  updatePrayerTimes(prayerTimes: DailyPrayerTime | null, setTheme: (theme: string) => void): void {
    this.currentPrayerTimes = prayerTimes;
    const settings = this.getSettings();
    
    if (settings.autoSchedule && prayerTimes) {
      this.scheduleThemeChanges(prayerTimes, setTheme);
    }
  }
}

// Export singleton instance
export const darkModeScheduler = DarkModeScheduler.getInstance();
