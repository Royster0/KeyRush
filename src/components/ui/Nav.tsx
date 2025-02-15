"use client";

import {
  Info,
  LogIn,
  LogOut,
  Menu,
  Settings,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "../ui/LogoutButton";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet";
import { signOut } from "@/app/actions";
import { TITLE_GRADIENTS } from "@/lib/constants";

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(true);
  const [gradient, setGradient] = useState("");
  const [hoverColor, setHoverColor] = useState("");

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
    <div className="sticky top-4 z-50 mb-10">
      <nav
        className={`transition-shadow duration-200 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-15 items-center justify-between">
            {/* Title */}
            <Link
              href="/"
              className={`bg-gradient-to-r ${gradient} text-2xl font-bold text-transparent bg-clip-text`}
            >
              Key Rush
            </Link>

            {/* Site Nav */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLinks />
            </div>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="/profile"
                  className="hover:text-muted transition-all"
                >
                  <User className="size-5" />
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`${hoverColor} transition-all`}
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
              <SheetContent side="right" className="w-64">
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
                          <User className="h-4 w-4" />
                          Profile
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
