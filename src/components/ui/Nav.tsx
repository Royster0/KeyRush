"use client";

import { signOut, saveTestResult, respondToFriendRequest } from "@/app/actions";
import toast, { type Toast } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import type { UserWithProfile } from "@/types/auth.types";
import {
  Award,
  Check,
  History,
  Home,
  Info,
  LogIn,
  LogOut,
  Menu,
  Settings,
  Trophy,
  User2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet";
import { AnnouncementBar } from "./AnnouncementBar";
import { KeyRushLogo } from "./KeyRushLogo";
import { useGameContext } from "@/contexts/GameContext";
import { ThemeModal } from "../ThemeModal";
import { XpBar } from "./XpBar";
import { getLevelProgress } from "@/lib/xp";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav({ initialUser = null }: { initialUser?: UserWithProfile | null }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserWithProfile | null>(initialUser);
  const [xpGainedDisplay, setXpGainedDisplay] = useState<number | null>(null);
  const { isGameActive } = useGameContext();
  const hasMounted = useRef(false);

  // Fetch user function
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/get-user");
      const data = await res.json();
      setUser(data.user);
    } catch {
      // User fetch failed, will retry on next auth event
    }
  };

  // Subscribe to auth changes (deferred to avoid blocking first paint)
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    const scheduleIdle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
    const idleId = scheduleIdle(() => {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          fetchUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      });
      subscription = data.subscription;
    });

    return () => {
      (window.cancelIdleCallback ?? clearTimeout)(idleId);
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user on pathname change (handles server action redirects)
  // Skip initial mount since we have the server-provided initialUser
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    fetchUser();
  }, [pathname]);

  const handleFriendRequestAction = async (
    requestId: string,
    action: "accepted" | "declined",
  ) => {
    const result = await respondToFriendRequest(requestId, action);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success(
      action === "accepted" ? "Friend added!" : "Request declined.",
    );
    return true;
  };

  // Listen for XP updates from game completion
  useEffect(() => {
    const handleXpUpdate = (
      event: CustomEvent<{ totalXp: number; level: number; xpGained?: number }>,
    ) => {
      setUser((prev) => {
        if (!prev?.profile) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            total_xp: event.detail.totalXp,
            level: event.detail.level,
          },
        };
      });

      // Show XP gained animation
      if (event.detail.xpGained && event.detail.xpGained > 0) {
        setXpGainedDisplay(event.detail.xpGained);
        // Clear after animation completes
        setTimeout(() => setXpGainedDisplay(null), 2000);
      }
    };

    window.addEventListener("xp-updated", handleXpUpdate as EventListener);
    return () =>
      window.removeEventListener("xp-updated", handleXpUpdate as EventListener);
  }, []);

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
          } catch {
            // If failed, put it back so we can try again later
            localStorage.setItem("pendingResult", pendingResult);
          }
        }
      }
    };

    checkPendingResults();
  }, [user]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track online presence for friends (deferred to avoid blocking first paint)
  useEffect(() => {
    if (!user?.id) return;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    const scheduleIdle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
    const idleId = scheduleIdle(() => {
      const supabase = createClient();
      channel = supabase.channel("online-users", {
        config: { presence: { key: user.id } },
      });
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel!.track({ user_id: user.id });
        }
      });
    });

    return () => {
      (window.cancelIdleCallback ?? clearTimeout)(idleId);
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  // Live friend request notifications (deferred to avoid blocking first paint)
  useEffect(() => {
    if (!user?.id) return;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    const scheduleIdle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
    const idleId = scheduleIdle(() => {
      const supabase = createClient();
      channel = supabase
        .channel(`friend-requests-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "friend_requests",
            filter: `receiver_id=eq.${user.id}`,
          },
          async (payload) => {
            const request = payload.new as {
              id?: string;
              sender_id?: string;
              status?: string;
            };
            if (
              !request.id ||
              !request.sender_id ||
              (request.status && request.status !== "pending")
            ) {
              return;
            }

            const { data: senderProfile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", request.sender_id)
              .single();

            const senderName = senderProfile?.username || "Someone";

            toast.custom(
              (t: Toast) => (
                <div className="w-72 rounded-lg border border-border bg-background p-4 shadow-lg">
                  <p className="font-semibold">Friend request</p>
                  <p className="text-sm text-muted-foreground">
                    {senderName} wants to add you.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        const ok = await handleFriendRequestAction(
                          request.id!,
                          "accepted",
                        );
                        if (ok) {
                          toast.dismiss(t.id);
                        }
                      }}
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const ok = await handleFriendRequestAction(
                          request.id!,
                          "declined",
                        );
                        if (ok) {
                          toast.dismiss(t.id);
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ),
              { duration: 10000 },
            );
          },
        )
        .subscribe();
    });

    return () => {
      (window.cancelIdleCallback ?? clearTimeout)(idleId);
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  const isActive = (path: string) => pathname === path;
  const showThemeModal = [
    "/multiplayer",
    "/leaderboard",
    "/about",
    "/profile",
    "/badges",
    "/u",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Multiplayer",
      href: "/multiplayer",
      icon: Users,
    },
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
              className={`hover:text-primary transition-all`}
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
    <>
      <div className="fixed top-0 left-0 right-0 z-50 mb-10">
        {/* <AnnouncementBar
        message="Services are currently offline pending database upgrade"
        storageKey="announcement-db-upgrade-2025-12-01"
      /> */}
        <nav
          className={`transition-all duration-200 bg-background/95 backdrop-blur-sm ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Title */}
              <Link
                href="/"
                className="flex items-center gap-2 text-2xl font-bold text-foreground group"
                aria-label="Home"
                title="Home"
              >
                <div className="size-8 text-primary transition-colors group-hover:text-primary/80">
                  <KeyRushLogo />
                </div>
                KeyRush
              </Link>

              {/* Site Nav - fades during typing test */}
              <div
                className="hidden md:flex items-center space-x-4 transition-opacity duration-300"
                style={{ opacity: isGameActive ? 0 : 1 }}
              >
                <NavLinks />
              </div>

              {/* User - fades during typing test */}
              {user ? (
                <div
                  className="hidden md:flex items-center space-x-8 transition-opacity duration-300"
                  style={{ opacity: isGameActive ? 0 : 1 }}
                >
                  <div className="relative group">
                    <Link
                      href="/profile"
                      className="hover:text-primary transition-all flex flex-col gap-1"
                      title="Profile"
                    >
                      <div className="flex items-center gap-2">
                        <User2 className="size-5" />
                        {user.profile?.username}
                        <AnimatePresence>
                          {xpGainedDisplay && (
                            <motion.span
                              initial={{ opacity: 0, y: 10, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.8 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className="text-xs font-semibold text-primary"
                            >
                              +{xpGainedDisplay} XP
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      {user.profile && (() => {
                        const xpProgress = getLevelProgress(user.profile.total_xp ?? 0);
                        return (
                          <XpBar
                            level={xpProgress.level}
                            progress={xpProgress.progress}
                          />
                        );
                      })()}
                    </Link>
                    <div className="absolute left-0 top-full w-48 rounded-lg border border-border/60 bg-background/95 shadow-lg opacity-0 translate-y-1 pointer-events-none transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        >
                          <User2 className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/friends"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        >
                          <Users className="h-4 w-4" />
                          Friends
                        </Link>
                        <Link
                          href="/badges"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        >
                          <Award className="h-4 w-4" />
                          Badges
                        </Link>
                        <Link
                          href="/match-history"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        >
                          <History className="h-4 w-4" />
                          Match History
                        </Link>
                        <div className="my-1 border-t border-border/60" />
                        <form action={signOut}>
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hover:text-primary transition-opacity duration-300"
                  style={{ opacity: isGameActive ? 0 : 1 }}
                  aria-label="Login"
                  title="Login"
                >
                  <LogIn className="size-5" />
                </Link>
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
                            href="/friends"
                            className={`flex flex-col gap-1 px-4 py-2 rounded-md transition-colors
                              ${
                                isActive("/friends")
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Friends
                            </div>
                          </Link>
                          <Link
                            href="/badges"
                            className={`flex flex-col gap-1 px-4 py-2 rounded-md transition-colors
                              ${
                                isActive("/badges")
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Badges
                            </div>
                          </Link>
                          <Link
                            href="/match-history"
                            className={`flex flex-col gap-1 px-4 py-2 rounded-md transition-colors
                              ${
                                isActive("/match-history")
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-2">
                              <History className="h-4 w-4" />
                              Match History
                            </div>
                          </Link>
                          <Link
                            href="/profile"
                            className={`flex flex-col gap-1 px-4 py-2 rounded-md transition-colors
                              ${
                                isActive("/profile")
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-2">
                              <User2 className="h-4 w-4" />
                              {user.profile?.username || "Profile"}
                              <AnimatePresence>
                                {xpGainedDisplay && (
                                  <motion.span
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="text-xs font-semibold text-primary"
                                  >
                                    +{xpGainedDisplay} XP
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                            {user.profile && (() => {
                              const xpProgress = getLevelProgress(user.profile.total_xp ?? 0);
                              return (
                                <XpBar
                                  level={xpProgress.level}
                                  progress={xpProgress.progress}
                                />
                              );
                            })()}
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
      {showThemeModal && <ThemeModal />}
    </>
  );
}
