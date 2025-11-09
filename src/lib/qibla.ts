/**
 * Qibla direction calculation utilities
 * Calculates the direction to the Kaaba in Makkah from any location
 */

// Kaaba coordinates in Makkah, Saudi Arabia
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export interface QiblaDirection {
  direction: number; // Direction in degrees (0-360)
  distance: number; // Distance in kilometers
}

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate the Qibla direction from a given location
 * Uses the Haversine formula and bearing calculation
 * 
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @returns QiblaDirection object with direction (degrees) and distance (km)
 */
export function calculateQiblaDirection(
  userLat: number,
  userLng: number
): QiblaDirection {
  // Convert to radians
  const lat1 = toRadians(userLat);
  const lat2 = toRadians(KAABA_LAT);
  const dLng = toRadians(KAABA_LNG - userLng);

  // Calculate bearing (direction) to Kaaba
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  let bearing = Math.atan2(y, x);
  bearing = toDegrees(bearing);
  
  // Normalize to 0-360
  const direction = (bearing + 360) % 360;

  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(KAABA_LAT - userLat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return {
    direction: Math.round(direction * 10) / 10, // Round to 1 decimal
    distance: Math.round(distance),
  };
}

/**
 * Get user's current position using Geolocation API
 * @returns Promise with position or error
 */
export function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Get cardinal direction from degrees
 * @param degrees Direction in degrees (0-360)
 * @returns Cardinal direction string (e.g., "N", "NE", "ENE")
 */
export function getCardinalDirection(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get full cardinal direction name
 * @param degrees Direction in degrees (0-360)
 * @returns Full direction name (e.g., "North", "North-Northeast")
 */
export function getFullDirectionName(degrees: number): string {
  const directions = [
    'North', 'North-Northeast', 'Northeast', 'East-Northeast',
    'East', 'East-Southeast', 'Southeast', 'South-Southeast',
    'South', 'South-Southwest', 'Southwest', 'West-Southwest',
    'West', 'West-Northwest', 'Northwest', 'North-Northwest'
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Check if device supports compass (orientation sensors)
 */
export function isCompassSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'DeviceOrientationEvent' in window &&
    typeof (DeviceOrientationEvent as any).requestPermission !== 'function' ||
    'ondeviceorientationabsolute' in window;
}

/**
 * Request permission for device orientation (iOS 13+)
 */
export async function requestOrientationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }
  
  // Permission not needed on this device
  return true;
}

/**
 * Check if user is facing the Qibla within tolerance
 * @param currentHeading Current device heading in degrees
 * @param qiblaDirection Qibla direction in degrees
 * @param tolerance Tolerance in degrees (default 15°)
 * @returns true if facing Qibla within tolerance
 */
export function isFacingQibla(
  currentHeading: number,
  qiblaDirection: number,
  tolerance: number = 15
): boolean {
  // Calculate the difference between current heading and qibla direction
  let diff = Math.abs(currentHeading - qiblaDirection);
  
  // Handle wrap-around (e.g., 350° vs 10°)
  if (diff > 180) {
    diff = 360 - diff;
  }
  
  return diff <= tolerance;
}

/**
 * Trigger haptic feedback (vibration) if supported
 * @param pattern Vibration pattern in milliseconds
 */
export function triggerHapticFeedback(pattern: number | number[] = 200): void {
  if (typeof window === 'undefined') return;
  
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/**
 * Play confirmation sound when facing Qibla
 * Uses Web Audio API for better mobile support
 */
export function playConfirmationSound(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant confirmation tone (similar to success sound)
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Failed to play confirmation sound:', error);
  }
}
