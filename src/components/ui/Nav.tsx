"use client";

import { signOut } from "@/app/actions";
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

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [gradient, setGradient] = useState("");
  const [hoverColor, setHoverColor] = useState("");

  // Get user
  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/get-user");
      const data = await res.json();
      setUser(data.user);
    }

    fetchUser();
  }, []);

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
                <Button variant="ghost" size="icon">
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
                              ${
                                isActive("/profile")
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
