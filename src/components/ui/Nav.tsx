"use client";

import { signOut, saveTestResult } from "@/app/actions";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { TITLE_GRADIENTS } from "@/lib/constants";
import {
  Info,
  LogIn,
  LogOut,
  Menu,
  Settings,
  Trophy,
  User2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "../ui/LogoutButton";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet";
import { AnnouncementBar } from "./AnnouncementBar";

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [gradient, setGradient] = useState("");
  const [hoverColor, setHoverColor] = useState("");

  // Fetch user function
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/get-user");
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Subscribe to auth changes
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user on mount and pathname change (handles server action redirects)
  useEffect(() => {
    fetchUser();
  }, [pathname]);

  // Check for pending results on login
  useEffect(() => {
    const checkPendingResults = async () => {
      if (user) {
        const pendingResult = localStorage.getItem("pendingResult");
        if (pendingResult) {
          // Remove immediately to prevent double-submission (e.g. strict mode double effect)
          localStorage.removeItem("pendingResult");

          try {
            const result = JSON.parse(pendingResult);
            await saveTestResult(result);
            toast.success("Saved your recent test result!");
          } catch (error) {
            console.error("Error saving pending result:", error);
            // If failed, put it back so we can try again later
            localStorage.setItem("pendingResult", pendingResult);
          }
        }
      }
    };

    checkPendingResults();
  }, [user]);

  // Select Navbar theme
  useEffect(() => {
    const themes = Object.keys(TITLE_GRADIENTS);
    const randomThemeIndex = themes[Math.floor(Math.random() * themes.length)];
    const theme = TITLE_GRADIENTS[randomThemeIndex];
    let gradientString: string;
    let hoverColorString: string;

    if (theme.via && theme.via2) {
      gradientString = `from-[${theme.from}] via-[${theme.via}] via-[${theme.via2}] to-[${theme.to}]`;
      hoverColorString = `hover:text-[${theme.via2}]`;
    } else if (theme.via) {
      gradientString = `from-[${theme.from}] via-[${theme.via}] to-[${theme.to}]`;
      hoverColorString = `hover:text-[${theme.via}]`;
    } else {
      gradientString = `from-[${theme.from}] to-[${theme.to}]`;
      hoverColorString = `hover:text-[${theme.to}]`;
    }

    console.log(theme);
    setGradient(gradientString);
    setHoverColor(hoverColorString);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
    },
    {
      name: "About",
      href: "/about",
      icon: Info,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const NavLinks = () => {
    return (
      <>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${hoverColor} transition-all`}
              aria-label={item.name}
              title={item.name}
            >
              <Icon className="size-5 mx-5" />
              <p className="lg:hidden">{item.name}</p>
            </Link>
          );
        })}
      </>
    );
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 mb-10">
      {/* <AnnouncementBar
        message="Services are currently offline pending database upgrade"
        storageKey="announcement-db-upgrade-2025-12-01"
      /> */}
      <nav
        className={`transition-all duration-200 bg-background/95 backdrop-blur-sm ${scrolled ? "shadow-md" : ""
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Title */}
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-foreground"
            >
              <img
                src="/KeyRush_Logo.svg"
                alt="KeyRush Logo"
                className="size-8"
              />
              KeyRush
            </Link>

            {/* Site Nav - fades during typing test */}
            <div
              className="hidden md:flex items-center space-x-4 transition-opacity duration-300"
              id="navbar-links"
            >
              <NavLinks />
            </div>

            {/* User - fades during typing test */}
            {user ? (
              <div
                className="hidden md:flex items-center space-x-8 transition-opacity duration-300"
                id="navbar-user"
              >
                <Link
                  href="/profile"
                  className="hover:text-muted transition-all flex items-center gap-2"
                  title="Profile"
                >
                  <User2 className="size-5" />
                  {user.profile?.username}
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`${hoverColor} transition-all duration-300`}
                  id="navbar-login"
                  aria-label="Login"
                  title="Login"
                >
                  <LogIn className="size-5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetTitle aria-describedby="Navigation Menu" />
              <SheetContent side="right" className="w-64 z-[100]">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks />
                  <div className="border-t pt-4">
                    {user ? (
                      <>
                        <Link
                          href="/profile"
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                              ${isActive("/profile")
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                            }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <User2 className="h-4 w-4" />
                          {user.profile?.username || "Profile"}
                        </Link>
                        <form action={signOut}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 mt-2"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </Button>
                        </form>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/auth/login"
                          onClick={() => setIsOpen(false)}
                        >
                          <Button variant="ghost" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => setIsOpen(false)}
                        >
                          <Button className="w-full">Register</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
}
