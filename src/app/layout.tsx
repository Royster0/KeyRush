import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { GameProvider } from "@/contexts/GameContext";
import { Toaster } from "react-hot-toast";
import Nav from "@/components/ui/Nav";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo";
import { getUser } from "@/lib/services/user";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: getSiteUrl(),
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <GameProvider>
              <Toaster
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                }}
              />
              <Nav initialUser={user} />
              <main className="pt-20">
                {children}
                <Analytics />
                <SpeedInsights />
              </main>
            </GameProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
