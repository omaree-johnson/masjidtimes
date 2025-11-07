import { PrayerTime, PrayerName, NextPrayer } from './types';

// Prayer names in order
export const prayerNames: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Get next prayer
export function getNextPrayer(currentTime: PrayerTime): NextPrayer | null {
  const now = new Date();
  const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM format

  for (const prayerName of prayerNames) {
    const prayerTime = currentTime[prayerName];
    if (prayerTime > currentTimeStr) {
      const [hours, minutes] = prayerTime.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      return {
        name: prayerName,
        time: prayerTime,
        timeRemaining: prayerDate.getTime() - now.getTime(),
      };
    }
  }

  // If no prayer found today, next prayer is Fajr tomorrow
  const [hours, minutes] = currentTime.fajr.split(':').map(Number);
  const prayerDate = new Date();
  prayerDate.setDate(prayerDate.getDate() + 1);
  prayerDate.setHours(hours, minutes, 0, 0);

  return {
    name: 'fajr',
    time: currentTime.fajr,
    timeRemaining: prayerDate.getTime() - now.getTime(),
  };
}

// Format time remaining (e.g., "2h 30m")
export function formatTimeRemaining(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Convert 24h to 12h format
export function to12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
