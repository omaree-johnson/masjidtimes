"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Calendar, Clock, Edit2, Upload, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storage } from "@/lib/storage";
import { DailyPrayerTime } from "@/lib/types";
import { getNextPrayer, formatTimeRemaining, capitalize, to12Hour, prayerNames } from "@/lib/prayer-utils";
import { PrayerTimeCard } from "@/components/PrayerTimeCard";
import { notificationService } from "@/lib/notifications";
import { darkModeScheduler } from "@/lib/dark-mode-scheduler";
import { useSwipe } from "@/hooks/use-swipe";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { toast } from "sonner";

export default function DashboardPage() {
  const { setTheme } = useTheme();
  const [todayTimes, setTodayTimes] = useState<DailyPrayerTime | null>(null);
  const [mosqueName, setMosqueName] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<ReturnType<typeof getNextPrayer>>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allTimes, setAllTimes] = useState<DailyPrayerTime[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Load data from storage
    const times = storage.getTodayPrayerTimes();
    const name = storage.getMosqueName();
    const all = storage.getAllPrayerTimes();
    
    setTodayTimes(times);
    setMosqueName(name);
    setAllTimes(all);
    
    // Find index of current displayed date
    if (times && all.length > 0) {
      const index = all.findIndex(t => t.date === times.date);
      setCurrentIndex(index >= 0 ? index : 0);
    }

    if (times) {
      const next = getNextPrayer(times);
      setNextPrayer(next);
      
      // Schedule notifications for today's prayers
      notificationService.scheduleNotifications(times);
      
      // Initialize dark mode scheduler
      darkModeScheduler.initialize(times, setTheme);
    }

    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      if (times) {
        const next = getNextPrayer(times);
        setNextPrayer(next);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      notificationService.clearScheduledNotifications();
      darkModeScheduler.clearScheduledChanges();
    };
  }, [setTheme]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousDay();
      } else if (e.key === 'ArrowRight') {
        goToNextDay();
      } else if (e.key === 't' || e.key === 'T') {
        goToToday();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allTimes]);

  const goToPreviousDay = () => {
    if (currentIndex > 0 && allTimes.length > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setTodayTimes(allTimes[newIndex]);
      const next = getNextPrayer(allTimes[newIndex]);
      setNextPrayer(next);
    }
  };

  const goToNextDay = () => {
    if (currentIndex < allTimes.length - 1 && allTimes.length > 0) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setTodayTimes(allTimes[newIndex]);
      const next = getNextPrayer(allTimes[newIndex]);
      setNextPrayer(next);
    }
  };

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const index = allTimes.findIndex(t => t.date === today);
    if (index >= 0) {
      setCurrentIndex(index);
      setTodayTimes(allTimes[index]);
      const next = getNextPrayer(allTimes[index]);
      setNextPrayer(next);
    }
  };

  const handleRefresh = async () => {
    // Reload data from storage
    const times = storage.getTodayPrayerTimes();
    const name = storage.getMosqueName();
    const all = storage.getAllPrayerTimes();
    
    setTodayTimes(times);
    setMosqueName(name);
    setAllTimes(all);
    
    if (times) {
      const index = all.findIndex((t: DailyPrayerTime) => t.date === times.date);
      setCurrentIndex(index >= 0 ? index : 0);
      const next = getNextPrayer(times);
      setNextPrayer(next);
    }
    
    toast.success('Prayer times refreshed');
    
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // Swipe gestures for day navigation
  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNextDay,
    onSwipeRight: goToPreviousDay,
  });

  // Pull to refresh
  const { isPulling, isRefreshing, pullDistance, shouldRefresh } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: !!todayTimes,
  });

  if (!todayTimes) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Timetable Found</AlertTitle>
          <AlertDescription>
            You haven&apos;t uploaded a prayer timetable yet. Upload one to get started.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Timetable
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="container mx-auto max-w-4xl px-4 py-6 sm:py-12 relative"
      {...swipeHandlers}
    >
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 transition-all duration-200"
          style={{
            opacity: isPulling ? Math.min(pullDistance / 80, 1) : 1,
            transform: `translate(-50%, ${isPulling ? pullDistance / 3 : 0}px)`,
          }}
        >
          <div className="bg-background/95 backdrop-blur border rounded-full p-3 shadow-lg">
            <RefreshCw 
              className={`h-5 w-5 ${isRefreshing || shouldRefresh ? 'animate-spin' : ''} text-primary`}
              style={{
                transform: !isRefreshing ? `rotate(${pullDistance * 2}deg)` : undefined,
              }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{mosqueName || "Prayer Times"}</h1>
          <Link href="/settings">
            <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            disabled={currentIndex === 0}
            className="h-9 px-2 sm:px-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          <div className="flex-1 text-center min-w-0">
            <p className="text-sm sm:text-lg font-medium px-2 wrap-break-word">
              {new Date(todayTimes.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {todayTimes.date !== currentTime.toISOString().split('T')[0] && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mt-1">
                <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Not today&apos;s date
                </p>
                {allTimes.findIndex(t => t.date === currentTime.toISOString().split('T')[0]) >= 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={goToToday}
                    className="h-auto p-0 text-xs sm:text-sm"
                  >
                    Go to today
                  </Button>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Day {currentIndex + 1} of {allTimes.length}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            disabled={currentIndex === allTimes.length - 1}
            className="h-9 px-2 sm:px-4"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <Card className="mb-6 sm:mb-8 border-primary/50 bg-linear-to-br from-primary/10 to-background">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Next Prayer</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold">{capitalize(nextPrayer.name)}</h2>
              <p className="mt-2 text-xl sm:text-2xl font-semibold text-primary">
                {to12Hour(nextPrayer.time)}
              </p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-base sm:text-lg">
                  {formatTimeRemaining(nextPrayer.timeRemaining)} remaining
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Prayer Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Prayer Times
          </CardTitle>
          <CardDescription>
            All times shown in 12-hour format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {prayerNames.map((prayerName) => (
              <PrayerTimeCard
                key={prayerName}
                prayerName={prayerName}
                time={todayTimes[prayerName]}
                iqamaTime={todayTimes[`${prayerName}Iqama` as keyof typeof todayTimes] as string | undefined}
                isNext={nextPrayer?.name === prayerName}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Qibla Finder */}
        <Link href="/qibla">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Qibla Finder</h3>
                  <p className="text-sm text-muted-foreground">Find prayer direction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Hijri Date */}
        {todayTimes.hijriDate && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Hijri Date</h3>
                  <p className="text-sm text-muted-foreground">{todayTimes.hijriDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
