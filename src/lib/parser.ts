import { DailyPrayerTime, PrayerTime } from './types';

/**
 * Parse extracted OCR text into structured prayer times
 * This is a heuristic parser that looks for common patterns in prayer timetables
 */
export function parsePrayerTimetable(text: string): DailyPrayerTime[] {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const results: DailyPrayerTime[] = [];

  console.log('Parsing timetable. Total lines:', lines.length);
  console.log('First 10 lines:', lines.slice(0, 10));

  // Common prayer name variations - expanded to catch more
  const prayerPatterns = {
    fajr: /\b(fajr|fajar|fair|dawn|subh|subuh|FAJR|FAJAR)\b/i,
    dhuhr: /\b(dhuhr|zuhr|dhuhar|noon|zohr|DHUHR|ZUHR)\b/i,
    asr: /\b(asr|aser|asar|afternoon|ASR)\b/i,
    maghrib: /\b(maghrib|magrib|maghreb|sunset|MAGHRIB)\b/i,
    isha: /\b(isha|esha|ishaa|isya|night|ISHA)\b/i,
  };

  // Enhanced time pattern - matches times like 5:51, 7:00, 12:19, etc.
  const timePattern = /\b(\d{1,2}):(\d{2})\b/g;
  
  // Backup time pattern for OCR that misses colons (e.g., "506" for "5:06", "1247" for "12:47")
  const timeNoColonPattern = /\b([0-2]?\d)([0-5]\d)\b/g;

  // Date pattern (various formats) - enhanced to match day numbers
  const datePattern = /\b(\d{1,2})[\/\-\.\s]+(\d{1,2})[\/\-\.\s]+(\d{2,4})\b/;
  const dayPattern = /\b(\d{1,2})\b/; // Just a day number

  // Strategy 1: Find header row to identify column positions
  let headerLine = '';
  let headerIndex = -1;
  let prayerColumns: { [key: string]: number } = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matchCount = 0;
    
    // Check if this line contains multiple prayer names (likely a header)
    for (const pattern of Object.values(prayerPatterns)) {
      if (pattern.test(line)) matchCount++;
    }
    
    if (matchCount >= 3) {
      headerLine = line;
      headerIndex = i;
      console.log('Found header at line', i, ':', line);
      break;
    }
  }

  // Strategy 2: Process table rows - look for lines with dates and multiple times
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip header rows and empty lines
    if (i === headerIndex || line.length < 10) continue;
    
    // Extract all times from the line (try both patterns)
    let times: Array<{0: string, 1: string, 2: string}> = Array.from(line.matchAll(timePattern)).map(m => ({
      0: m[0],
      1: m[1],
      2: m[2]
    }));
    
    // If we don't have enough times with colons, try without colons
    if (times.length < 5) {
      const noColonTimes = Array.from(line.matchAll(timeNoColonPattern));
      // Filter for reasonable times (3-4 digits, not random numbers like "150")
      const validNoColonTimes = noColonTimes.filter(match => {
        const combined = match[0];
        if (combined.length === 3) {
          // Format: HMM (e.g., 506 = 5:06)
          const h = parseInt(combined[0]);
          const mm = parseInt(combined.slice(1));
          return h >= 0 && h <= 9 && mm >= 0 && mm <= 59;
        } else if (combined.length === 4) {
          // Format: HHMM (e.g., 1247 = 12:47)
          const hh = parseInt(combined.slice(0, 2));
          const mm = parseInt(combined.slice(2));
          return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
        }
        return false;
      });
      
      // Convert to standard time match format
      if (validNoColonTimes.length >= 5) {
        times = validNoColonTimes.map(match => {
          const combined = match[0];
          if (combined.length === 3) {
            return {
              0: match[0],
              1: combined[0],
              2: combined.slice(1),
            };
          } else {
            return {
              0: match[0],
              1: combined.slice(0, 2),
              2: combined.slice(2),
            };
          }
        });
      }
    }
    
    // Extract day number - handle pipes and various formats
    // Patterns: "| 1 |", "1 SAT", "| 1 [SAT", "0 150", "sow [i", etc.
    // More flexible pattern to catch day numbers at start of line
    const dayMatch = line.match(/^\s*\|?\s*(\d{1,2})\s+/);
    const dateMatch = line.match(datePattern);
    
    // If we have at least 5 times in a row, it's likely a data row
    if (times.length >= 5) {
      let date: string;
      
      if (dateMatch) {
        // Full date found
        const [, day, month, year] = dateMatch;
        const fullYear = year.length === 2 ? `20${year}` : year;
        date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else if (dayMatch) {
        // Only day found - use current month/year from context
        const day = dayMatch[1];
        // Try to find month from header or context
        const currentDate = new Date();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        
        // Look for month name in surrounding lines
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december'];
        
        for (let j = Math.max(0, i - 10); j < Math.min(lines.length, i + 5); j++) {
          const contextLine = lines[j].toLowerCase();
          for (let m = 0; m < monthNames.length; m++) {
            if (contextLine.includes(monthNames[m])) {
              month = m + 1;
              // Try to find year too
              const yearMatch = contextLine.match(/\b(20\d{2})\b/);
              if (yearMatch) year = parseInt(yearMatch[1]);
              break;
            }
          }
        }
        
        date = `${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        // No date found, skip this row
        continue;
      }
      
      // Extract the first 5 times as prayer times
      // IMPROVED: Smarter time selection for timetables with begin/jamat pairs
      const validTimes = times.filter(time => {
        const hours = parseInt(time[1]);
        const minutes = parseInt(time[2]);
        // Validate time is reasonable
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      });
      
      // Skip if we don't have enough valid times
      if (validTimes.length < 5) {
        continue;
      }
      
      let prayerTimes: string[];
      
      if (validTimes.length >= 10) {
        // Likely has begin/jamat pairs
        // Pattern: Fajr(0-1), Sunrise(2), Dhuhr(3-4), Asr(5-6), Maghrib(7-8), Isha(9-10)
        // We want: Fajr beginning, Dhuhr beginning, Asr beginning, Maghrib beginning, Isha beginning
        prayerTimes = [
          validTimes[0], // Fajr beginning
          validTimes[3], // Dhuhr beginning (skip sunrise at index 2)
          validTimes[5], // Asr beginning
          validTimes[7], // Maghrib beginning
          validTimes[9], // Isha beginning
        ].filter(Boolean).map(time => {
          const hours = time[1];
          const minutes = time[2];
          return `${hours.padStart(2, '0')}:${minutes}`;
        });
      } else {
        // Simple format: just take first 5 times
        prayerTimes = validTimes.slice(0, 5).map(time => {
          const hours = time[1];
          const minutes = time[2];
          return `${hours.padStart(2, '0')}:${minutes}`;
        });
      }
      
      if (prayerTimes.length === 5) {
        console.log('Found prayer times for', date, ':', prayerTimes);
        results.push({
          date,
          fajr: prayerTimes[0],
          dhuhr: prayerTimes[1],
          asr: prayerTimes[2],
          maghrib: prayerTimes[3],
          isha: prayerTimes[4],
        });
      }
    }
  }

  console.log('Strategy 2 results:', results.length, 'days found');

  // If Strategy 2 worked, return results
  if (results.length > 0) {
    return results;
  }

  // Strategy 3: More aggressive line-by-line parsing
  let currentDate: string | null = null;
  let currentPrayerTimes: Partial<PrayerTime> = {};
  const prayerTimesMap: Map<string, Partial<PrayerTime>> = new Map();

  for (const line of lines) {
    // Try to extract date
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      // Save previous prayer times if complete
      if (currentDate && Object.keys(currentPrayerTimes).length === 5) {
        prayerTimesMap.set(currentDate, { ...currentPrayerTimes });
      }
      
      const [, day, month, year] = dateMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;
      currentDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      currentPrayerTimes = {};
      continue;
    }

    // Try to extract prayer times
    const times = Array.from(line.matchAll(timePattern));
    if (times.length > 0) {
      // Check which prayers are mentioned in this line
      for (const [prayerKey, pattern] of Object.entries(prayerPatterns)) {
        if (pattern.test(line)) {
          // Find the time closest to this prayer name
          const time = times[0];
          if (time) {
            const hours = time[1];
            const minutes = time[2];
            currentPrayerTimes[prayerKey as keyof PrayerTime] = `${hours.padStart(2, '0')}:${minutes}`;
          }
        }
      }
    }
  }

  // Save last prayer times
  if (currentDate && Object.keys(currentPrayerTimes).length === 5) {
    prayerTimesMap.set(currentDate, { ...currentPrayerTimes });
  }

  // Convert map to results
  prayerTimesMap.forEach((times, date) => {
    if (validatePrayerTimes(times)) {
      results.push({
        date,
        ...times as PrayerTime,
      });
    }
  });

  console.log('Strategy 3 results:', results.length, 'days found');

  // Strategy 4: If we still have no results, try to find at least one complete set for today
  if (results.length === 0) {
    const allPrayerTimes: Partial<PrayerTime> = {};
    
    for (const line of lines) {
      const times = Array.from(line.matchAll(timePattern));
      if (times.length > 0) {
        for (const [prayerKey, pattern] of Object.entries(prayerPatterns)) {
          if (pattern.test(line) && !allPrayerTimes[prayerKey as keyof PrayerTime]) {
            const time = times[0];
            if (time) {
              const hours = time[1];
              const minutes = time[2];
              allPrayerTimes[prayerKey as keyof PrayerTime] = `${hours.padStart(2, '0')}:${minutes}`;
            }
          }
        }
      }
    }

    // If we found all 5 prayers, use today's date
    if (validatePrayerTimes(allPrayerTimes)) {
      const today = new Date().toISOString().split('T')[0];
      console.log('Strategy 4: Found complete set for today');
      results.push({
        date: today,
        ...allPrayerTimes as PrayerTime,
      });
    }
  }

  console.log('Final results:', results.length, 'days found');
  return results;
}

/**
 * Validate prayer times
 */
export function validatePrayerTimes(times: Partial<PrayerTime>): times is PrayerTime {
  const required: (keyof PrayerTime)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  return required.every(key => times[key] && /^\d{2}:\d{2}$/.test(times[key] as string));
}

/**
 * Parse CSV timetable
 */
export function parseCSVTimetable(csvText: string): DailyPrayerTime[] {
  const lines = csvText.trim().split('\n');
  const results: DailyPrayerTime[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length >= 6) {
      // Expected format: Date,Fajr,Dhuhr,Asr,Maghrib,Isha
      const [date, fajr, dhuhr, asr, maghrib, isha] = values;
      
      results.push({
        date,
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
      });
    }
  }

  return results;
}

/**
 * Smart parser that attempts multiple parsing strategies
 */
export async function smartParse(text: string, fileType: string): Promise<DailyPrayerTime[]> {
  // If CSV, use CSV parser
  if (fileType.includes('csv') || text.includes(',')) {
    const csvResults = parseCSVTimetable(text);
    if (csvResults.length > 0) {
      return csvResults;
    }
  }

  // Otherwise, use OCR text parser
  const ocrResults = parsePrayerTimetable(text);
  return ocrResults;
}
