"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Save, Upload, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
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

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mosqueName, setMosqueName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const name = storage.getMosqueName();
    if (name) {
      setMosqueName(name);
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
