"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Save, Upload, Moon, Sun, Monitor, Bell, BellOff, Volume2, VolumeX, Smartphone, Check, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { storage } from "@/lib/storage";
import { notificationService, NotificationSettings } from "@/lib/notifications";
import { darkModeScheduler, DarkModeSettings } from "@/lib/dark-mode-scheduler";
import { Timetable } from "@/lib/types";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mosqueName, setMosqueName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mosques, setMosques] = useState<Timetable[]>([]);
  const [activeMosqueId, setActiveMosqueId] = useState<string | null>(null);
  const [defaultMosqueId, setDefaultMosqueId] = useState<string | null>(null);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
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
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  
  // Dark mode settings
  const [darkModeSettings, setDarkModeSettings] = useState<DarkModeSettings>({
    autoSchedule: false,
    darkStart: "maghrib",
    lightStart: "fajr",
  });

  useEffect(() => {
    setMounted(true);
    const name = storage.getMosqueName();
    if (name) {
      setMosqueName(name);
    }
    
    // Load mosques
    const allMosques = storage.getAllMosques();
    setMosques(allMosques);
    setActiveMosqueId(storage.getActiveMosqueId());
    setDefaultMosqueId(storage.getDefaultMosqueId());
    
    // Load notification settings
    setNotificationSettings(notificationService.getSettings());
    
    // Load dark mode settings
    setDarkModeSettings(darkModeScheduler.getSettings());
    
    // Check notification permission
    if (notificationService.isSupported()) {
      setNotificationPermission(notificationService.getPermissionStatus());
    }
  }, []);

  const handleSaveMosqueName = () => {
    if (mosqueName.trim()) {
      storage.saveMosqueName(mosqueName.trim());
      toast.success("Mosque name updated");
    }
  };

  const handleClearData = () => {
    storage.clearAll();
    toast.success("All data cleared");
    router.push("/");
  };

  const handleSwitchMosque = (mosqueId: string) => {
    storage.setActiveMosque(mosqueId);
    setActiveMosqueId(mosqueId);
    toast.success("Switched mosque");
    router.refresh();
  };

  const handleSetDefaultMosque = (mosqueId: string) => {
    storage.setDefaultMosque(mosqueId);
    setDefaultMosqueId(mosqueId);
    toast.success("Default mosque set");
  };

  const handleDeleteMosque = (mosqueId: string, mosqueName: string) => {
    const success = storage.deleteMosque(mosqueId);
    if (success) {
      setMosques(storage.getAllMosques());
      setActiveMosqueId(storage.getActiveMosqueId());
      toast.success(`Deleted ${mosqueName}`);
    } else {
      toast.error("Failed to delete mosque");
    }
  };

  const handleRequestNotificationPermission = async () => {
    const permission = await notificationService.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      toast.success("Notifications enabled!");
    } else {
      toast.error("Notification permission denied");
    }
  };

  const handleSaveNotificationSettings = () => {
    notificationService.saveSettings(notificationSettings);
    toast.success("Notification settings saved");
    
    // Reschedule notifications with new settings
    const todayTimes = storage.getTodayPrayerTimes();
    if (todayTimes) {
      notificationService.scheduleNotifications(todayTimes);
    }
  };

  const handleTestNotification = async () => {
    const success = await notificationService.testNotification();
    if (success) {
      toast.success("Test notification sent!");
    } else {
      toast.error("Could not send test notification");
    }
  };

  const handleSaveDarkModeSettings = () => {
    darkModeScheduler.saveSettings(darkModeSettings);
    toast.success("Dark mode settings saved");
    
    // Re-initialize dark mode scheduler
    const todayTimes = storage.getTodayPrayerTimes();
    darkModeScheduler.updatePrayerTimes(todayTimes, setTheme);
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your preferences and data
        </p>
      </div>

      <div className="grid gap-6">
        {/* Mosque Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Mosque Information</CardTitle>
            <CardDescription>
              Update your mosque name and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mosque-name">Mosque Name</Label>
              <div className="flex gap-2">
                <Input
                  id="mosque-name"
                  value={mosqueName}
                  onChange={(e) => setMosqueName(e.target.value)}
                  placeholder="Enter mosque name"
                />
                <Button onClick={handleSaveMosqueName}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose your preferred theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={theme} onValueChange={setTheme}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                  <Sun className="h-4 w-4" />
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                  <Moon className="h-4 w-4" />
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                  <Monitor className="h-4 w-4" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Timetable Management */}
        <Card>
          <CardHeader>
            <CardTitle>Timetable Management</CardTitle>
            <CardDescription>
              Manage your prayer timetable data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/upload')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload New Timetable
            </Button>
          </CardContent>
        </Card>

        {/* Multiple Mosques Management */}
        {mosques.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Mosques</CardTitle>
              <CardDescription>
                Manage multiple mosque timetables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mosques.map((mosque) => (
                <div
                  key={mosque.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{mosque.mosqueName}</h3>
                      {activeMosqueId === mosque.id && (
                        <Badge variant="default">Active</Badge>
                      )}
                      {defaultMosqueId === mosque.id && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {mosque.times.length} days • Added {new Date(mosque.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {activeMosqueId !== mosque.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSwitchMosque(mosque.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                    )}
                    {defaultMosqueId !== mosque.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetDefaultMosque(mosque.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    {mosques.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Mosque?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {mosque.mosqueName}? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMosque(mosque.id, mosque.mosqueName)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Prayer Notifications
            </CardTitle>
            <CardDescription>
              Get notified before prayer times
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationPermission !== "granted" && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-3">
                  Enable notifications to receive prayer time reminders
                </p>
                <Button onClick={handleRequestNotificationPermission} className="w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </Button>
              </div>
            )}

            {notificationPermission === "granted" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive prayer time reminders
                    </p>
                  </div>
                  <Switch
                    id="notifications-enabled"
                    checked={notificationSettings.enabled}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, enabled: checked })
                    }
                  />
                </div>

                {notificationSettings.enabled && (
                  <>
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="before-minutes">Notify Before Prayer</Label>
                      <Select
                        value={notificationSettings.beforeMinutes.toString()}
                        onValueChange={(value) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            beforeMinutes: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger id="before-minutes">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes before</SelectItem>
                          <SelectItem value="10">10 minutes before</SelectItem>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <Label className="mb-3 block">Notify for Prayers</Label>
                      <div className="space-y-2">
                        {Object.entries(notificationSettings.prayers).map(([prayer, enabled]) => (
                          <div key={prayer} className="flex items-center justify-between">
                            <Label htmlFor={`prayer-${prayer}`} className="capitalize">
                              {prayer}
                            </Label>
                            <Switch
                              id={`prayer-${prayer}`}
                              checked={enabled}
                              onCheckedChange={(checked) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  prayers: { ...notificationSettings.prayers, [prayer]: checked },
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sound">Sound</Label>
                        <p className="text-xs text-muted-foreground">Play notification sound</p>
                      </div>
                      <Switch
                        id="sound"
                        checked={notificationSettings.sound}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, sound: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="vibrate">Vibrate</Label>
                        <p className="text-xs text-muted-foreground">Vibrate on notification</p>
                      </div>
                      <Switch
                        id="vibrate"
                        checked={notificationSettings.vibrate}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, vibrate: checked })
                        }
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveNotificationSettings} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </Button>
                      <Button onClick={handleTestNotification} variant="outline">
                        Test
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Auto Dark Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Auto Dark Mode
            </CardTitle>
            <CardDescription>
              Automatically switch theme based on prayer times
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-schedule">Auto Dark Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Enable dark mode from Maghrib to Fajr
                </p>
              </div>
              <Switch
                id="auto-schedule"
                checked={darkModeSettings.autoSchedule}
                onCheckedChange={(checked) =>
                  setDarkModeSettings({ ...darkModeSettings, autoSchedule: checked })
                }
              />
            </div>

            {darkModeSettings.autoSchedule && (
              <>
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="dark-start">Dark Mode Starts At</Label>
                  <Select
                    value={darkModeSettings.darkStart}
                    onValueChange={(value: "maghrib" | "isha" | "sunset") =>
                      setDarkModeSettings({ ...darkModeSettings, darkStart: value })
                    }
                  >
                    <SelectTrigger id="dark-start">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maghrib">Maghrib (Sunset)</SelectItem>
                      <SelectItem value="isha">Isha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="light-start">Light Mode Starts At</Label>
                  <Select
                    value={darkModeSettings.lightStart}
                    onValueChange={(value: "fajr" | "sunrise") =>
                      setDarkModeSettings({ ...darkModeSettings, lightStart: value })
                    }
                  >
                    <SelectTrigger id="light-start">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fajr">Fajr</SelectItem>
                      <SelectItem value="sunrise">Sunrise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveDarkModeSettings} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* PWA Install Info */}
        <Card>
          <CardHeader>
            <CardTitle>Install App</CardTitle>
            <CardDescription>
              Install this app on your device for offline access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              To install this app:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>On iOS: Tap the share button, then &quot;Add to Home Screen&quot;</li>
              <li>On Android: Tap the menu button, then &quot;Install app&quot;</li>
              <li>On Desktop: Look for the install icon in the address bar</li>
            </ul>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    prayer timetable and all associated data from this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Separator />

        {/* App Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>My Masjid Timetable v1.0.0</p>
              <p className="mt-1">Built with Next.js, Tailwind CSS, and shadcn/ui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
