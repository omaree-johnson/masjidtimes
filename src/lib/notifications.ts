import { DailyPrayerTime } from "./types";
import { prayerNames } from "./prayer-utils";

export interface NotificationSettings {
  enabled: boolean;
  beforeMinutes: number; // Minutes before prayer to notify
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  sound: boolean;
  vibrate: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  beforeMinutes: 15,
  prayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  sound: true,
  vibrate: true,
};

const STORAGE_KEY = "notification-settings";
const PERMISSION_KEY = "notification-permission-asked";

export class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: number[] = [];

  private constructor() {
    this.initializeServiceWorker();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log("Service Worker ready for notifications");
      } catch (error) {
        console.error("Service Worker initialization error:", error);
      }
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return "Notification" in window;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  }

  // Check if user has been asked for permission before
  hasAskedPermission(): boolean {
    return localStorage.getItem(PERMISSION_KEY) === "true";
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return "denied";
    }

    localStorage.setItem(PERMISSION_KEY, "true");

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Get notification settings
  getSettings(): NotificationSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
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

  // Save notification settings
  saveSettings(settings: NotificationSettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  // Schedule notifications for today's prayers
  scheduleNotifications(prayerTimes: DailyPrayerTime): void {
    // Clear existing scheduled notifications
    this.clearScheduledNotifications();

    const settings = this.getSettings();
    if (!settings.enabled || this.getPermissionStatus() !== "granted") {
      return;
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Only schedule if the prayer times are for today
    if (prayerTimes.date !== today) {
      return;
    }

    prayerNames.forEach((prayer) => {
      const prayerKey = prayer.toLowerCase() as keyof typeof settings.prayers;
      
      if (!settings.prayers[prayerKey]) {
        return; // Skip if notifications disabled for this prayer
      }

      const prayerTime = prayerTimes[prayer];
      if (!prayerTime) return;

      // Parse prayer time
      const [hours, minutes] = prayerTime.split(":").map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);

      // Calculate notification time (X minutes before prayer)
      const notificationTime = new Date(prayerDate.getTime() - settings.beforeMinutes * 60 * 1000);

      // Only schedule if notification time is in the future
      if (notificationTime > now) {
        const timeUntilNotification = notificationTime.getTime() - now.getTime();
        
        const timeoutId = window.setTimeout(() => {
          this.showNotification(prayer, prayerTime, settings);
        }, timeUntilNotification);

        this.scheduledNotifications.push(timeoutId);
      }
    });

    console.log(`Scheduled ${this.scheduledNotifications.length} notifications`);
  }

  // Show a notification
  private showNotification(prayer: string, time: string, settings: NotificationSettings): void {
    if (this.getPermissionStatus() !== "granted") return;

    const title = `${prayer} Prayer Time`;
    const body = `${prayer} prayer is at ${this.formatTime(time)}`;

    const options: NotificationOptions & { vibrate?: number[] } = {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      tag: `prayer-${prayer.toLowerCase()}`,
      requireInteraction: false,
      vibrate: settings.vibrate ? [200, 100, 200] : undefined,
      silent: !settings.sound,
      data: {
        prayer,
        time,
        url: "/dashboard",
      },
    };

    // Try to use service worker notification if available
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      }).catch(() => {
        // Fallback to regular notification
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  }

  // Format time for display
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  // Clear all scheduled notifications
  clearScheduledNotifications(): void {
    this.scheduledNotifications.forEach((id) => window.clearTimeout(id));
    this.scheduledNotifications = [];
  }

  // Test notification (for settings page)
  async testNotification(): Promise<boolean> {
    if (this.getPermissionStatus() !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return false;
      }
    }

    const settings = this.getSettings();
    this.showNotification("Test", "12:00", settings);
    return true;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
