import Link from "next/link";
import { Upload, Calendar, Clock, Smartphone, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span>Simple, Fast, Offline-Ready</span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Mosque&apos;s Prayer Times,
            <span className="text-primary"> Always at Hand</span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Upload your mosque&apos;s timetable once. Access prayer times instantly, even offline.
            No more searching through PDFs or scrolling through WhatsApp messages.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/upload">
              <Button size="lg" className="w-full sm:w-auto">
                <Upload className="mr-2 h-5 w-5" />
                Upload Timetable
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Why Masjid Times?</h2>
        
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Upload className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Easy Upload</CardTitle>
              <CardDescription>
                Upload PDF, image, or CSV files. We&apos;ll automatically extract the prayer times.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Next Prayer Countdown</CardTitle>
              <CardDescription>
                See exactly how much time until the next prayer. Never miss a prayer time again.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Offline Access</CardTitle>
              <CardDescription>
                Install as a PWA and access your timetable offline. Works on all devices.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Your data stays on your device. Optional sync with Supabase for multi-device access.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Full Month View</CardTitle>
              <CardDescription>
                See all prayer times for the entire month at a glance. Edit times manually if needed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built with Next.js 15 and optimized for performance. Instant load times.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-20">
        <Card className="mx-auto max-w-3xl border-primary/50">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center md:p-12">
            <h3 className="text-2xl font-bold md:text-3xl">
              Ready to Get Started?
            </h3>
            <p className="text-muted-foreground">
              Upload your mosque&apos;s timetable in less than a minute
            </p>
            <Link href="/upload">
              <Button size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Upload Your Timetable Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
