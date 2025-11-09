'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Compass, AlertCircle, Info } from 'lucide-react';
import {
  calculateQiblaDirection,
  getUserLocation,
  getCardinalDirection,
  getFullDirectionName,
  isCompassSupported,
  requestOrientationPermission,
  type QiblaDirection,
  type GeolocationPosition,
} from '@/lib/qibla';
import { toast } from 'sonner';

export default function QiblaCompass() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<QiblaDirection | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [compassEnabled, setCompassEnabled] = useState(false);
  const [compassSupported, setCompassSupported] = useState(false);

  // Check compass support on mount
  useEffect(() => {
    setCompassSupported(isCompassSupported());
  }, []);

  // Handle device orientation
  useEffect(() => {
    if (!compassEnabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // Check for absolute orientation first (more accurate)
      if (event.absolute && event.alpha !== null) {
        heading = 360 - event.alpha;
      } else if ((event as any).webkitCompassHeading !== undefined) {
        // iOS fallback
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Relative orientation fallback
        heading = 360 - event.alpha;
      }

      if (heading !== null) {
        setDeviceHeading(heading);
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    window.addEventListener('deviceorientation', handleOrientation as any, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.removeEventListener('deviceorientation', handleOrientation as any, true);
    };
  }, [compassEnabled]);

  const handleGetLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await getUserLocation();
      setUserLocation(position);

      const direction = calculateQiblaDirection(position.latitude, position.longitude);
      setQiblaDirection(direction);

      toast.success('Location found successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEnableCompass = useCallback(async () => {
    if (!compassSupported) {
      toast.error('Compass not supported on this device');
      return;
    }

    try {
      const granted = await requestOrientationPermission();
      if (granted) {
        setCompassEnabled(true);
        toast.success('Compass enabled');
      } else {
        toast.error('Compass permission denied');
      }
    } catch (err) {
      toast.error('Failed to enable compass');
    }
  }, [compassSupported]);

  // Calculate rotation for compass needle
  const calculateNeedleRotation = (): number => {
    if (!qiblaDirection) return 0;
    
    if (deviceHeading !== null) {
      // Adjust for device rotation
      return qiblaDirection.direction - deviceHeading;
    }
    
    // Static mode: point north
    return qiblaDirection.direction;
  };

  const needleRotation = calculateNeedleRotation();

  return (
    <div className="space-y-4">
      {/* Location Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Find Qibla Direction
          </CardTitle>
          <CardDescription>
            Get the direction to the Kaaba in Makkah from your current location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!userLocation && (
            <Button
              onClick={handleGetLocation}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <MapPin className="mr-2 h-5 w-5" />
              {loading ? 'Getting Location...' : 'Get My Location'}
            </Button>
          )}

          {userLocation && qiblaDirection && (
            <div className="space-y-4">
              {/* Location Info */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Location</span>
                  <span className="font-mono">
                    {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Distance to Kaaba</span>
                  <span className="font-semibold">{qiblaDirection.distance.toLocaleString()} km</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Qibla Direction</span>
                  <span className="font-semibold">
                    {qiblaDirection.direction}° {getCardinalDirection(qiblaDirection.direction)}
                  </span>
                </div>
              </div>

              {/* Compass Controls */}
              {compassSupported && !compassEnabled && (
                <Button
                  onClick={handleEnableCompass}
                  variant="outline"
                  className="w-full"
                >
                  <Compass className="mr-2 h-4 w-4" />
                  Enable Live Compass
                </Button>
              )}

              {compassEnabled && deviceHeading !== null && (
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Compass className="h-3 w-3" />
                    Live Compass Active
                  </Badge>
                </div>
              )}

              <Button
                onClick={handleGetLocation}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Update Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compass Display */}
      {qiblaDirection && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Compass Circle */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 bg-gradient-to-br from-background to-muted">
                {/* Cardinal Directions */}
                <div className="absolute inset-0">
                  {/* North */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2">
                    <span className="text-lg font-bold text-primary">N</span>
                  </div>
                  {/* East */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="text-lg font-bold text-muted-foreground">E</span>
                  </div>
                  {/* South */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <span className="text-lg font-bold text-muted-foreground">S</span>
                  </div>
                  {/* West */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <span className="text-lg font-bold text-muted-foreground">W</span>
                  </div>
                </div>

                {/* Degree Marks */}
                <div className="absolute inset-4">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const angle = i * 10;
                    const isMajor = angle % 30 === 0;
                    return (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 origin-top-left"
                        style={{
                          transform: `rotate(${angle}deg) translateX(-50%)`,
                          height: '50%',
                        }}
                      >
                        <div
                          className={`w-0.5 ${
                            isMajor ? 'h-4 bg-foreground' : 'h-2 bg-muted-foreground/50'
                          } mx-auto`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Qibla Needle */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${needleRotation}deg)`,
                    width: '8px',
                    height: '45%',
                  }}
                >
                  {/* Green Arrow pointing to Qibla */}
                  <div className="relative h-full w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[40px] border-t-green-500 drop-shadow-lg" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-green-500" />
                  </div>
                </div>

                {/* Center Dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg z-10" />
              </div>

              {/* Direction Label */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center">
                <p className="text-sm text-muted-foreground">
                  Face {getFullDirectionName(qiblaDirection.direction)}
                </p>
                {compassEnabled && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Green arrow points to Qibla
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {qiblaDirection && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {compassEnabled ? (
              <>
                <strong>Hold your device flat</strong> and rotate until the green arrow points upward.
                That direction is toward the Qibla.
              </>
            ) : (
              <>
                <strong>Point the top of your screen toward North</strong>, then face the direction of the green arrow
                to face the Qibla.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
