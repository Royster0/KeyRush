import { KeyRushLogo } from "@/components/ui/KeyRushLogo";
import Link from "next/link";

export function NavSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 mb-10">
      <nav className="transition-all duration-200 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-foreground"
              aria-label="Home"
            >
              <div className="size-8 text-primary">
                <KeyRushLogo />
              </div>
              KeyRush
            </Link>

            {/* Nav links skeleton */}
            <div className="hidden md:flex items-center space-x-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="size-5 mx-5 bg-muted/40 rounded animate-pulse" />
              ))}
            </div>

            {/* User skeleton */}
            <div className="hidden md:flex items-center">
              <div className="h-5 w-20 bg-muted/40 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
