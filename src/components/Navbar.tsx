"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Settings, Upload, Home, Calendar, Menu, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: Calendar },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/qibla", label: "Qibla", icon: Navigation },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-14 sm:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="font-bold text-base sm:text-lg">
              <span className="hidden sm:inline">Masjid Times</span>
              <span className="sm:hidden">Masjid</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button 
                  variant={pathname === href ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 sm:h-10 sm:w-10">
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/settings" className="hidden sm:inline-flex">
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="text-left mb-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-2">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                    <Button 
                      variant={pathname === href ? "secondary" : "ghost"} 
                      className={cn(
                        "w-full justify-start gap-3 text-base",
                        pathname === href && "bg-secondary"
                      )}
                      size="lg"
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Button>
                  </Link>
                ))}
                <Link href="/settings" onClick={() => setIsOpen(false)}>
                  <Button 
                    variant={pathname === "/settings" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-base",
                      pathname === "/settings" && "bg-secondary"
                    )}
                    size="lg"
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
