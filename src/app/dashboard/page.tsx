"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Edit2, Upload, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storage } from "@/lib/storage";
import { DailyPrayerTime } from "@/lib/types";
import { getNextPrayer, formatTimeRemaining, capitalize, to12Hour, prayerNames } from "@/lib/prayer-utils";
import { PrayerTimeCard } from "@/components/PrayerTimeCard";

export default function DashboardPage() {
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
    }

    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      if (times) {
        const next = getNextPrayer(times);
        setNextPrayer(next);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{mosqueName || "Prayer Times"}</h1>
          <Link href="/settings">
            <Button variant="outline" size="icon">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex-1 text-center">
            <p className="text-lg font-medium">
              {new Date(todayTimes.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {todayTimes.date !== currentTime.toISOString().split('T')[0] && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Not today&apos;s date
                </p>
                {allTimes.findIndex(t => t.date === currentTime.toISOString().split('T')[0]) >= 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={goToToday}
                    className="h-auto p-0 text-sm"
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
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/10 to-background">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Next Prayer</p>
              <h2 className="mt-2 text-4xl font-bold">{capitalize(nextPrayer.name)}</h2>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {to12Hour(nextPrayer.time)}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-lg">
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

      {/* Hijri Date (if available) */}
      {todayTimes.hijriDate && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Hijri Date</p>
              <p className="mt-1 text-lg font-medium">{todayTimes.hijriDate}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
