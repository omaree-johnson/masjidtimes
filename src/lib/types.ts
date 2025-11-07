export interface PrayerTime {
  fajr: string;
  fajrIqama?: string;
  dhuhr: string;
  dhuhrIqama?: string;
  asr: string;
  asrIqama?: string;
  maghrib: string;
  maghribIqama?: string;
  isha: string;
  ishaIqama?: string;
}

export interface DailyPrayerTime extends PrayerTime {
  date: string; // ISO date string
  hijriDate?: string;
}

export interface Timetable {
  id: string;
  userId: string;
  mosqueName: string;
  createdAt: string;
  updatedAt: string;
  times: DailyPrayerTime[];
  fileUrl?: string;
}

export interface Mosque {
  id: string;
  name: string;
  location?: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  mosqueName?: string;
  createdAt: string;
}

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface NextPrayer {
  name: PrayerName;
  time: string;
  timeRemaining: number; // in milliseconds
}
