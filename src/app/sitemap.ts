import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getPublicProfileUsernames } from "@/lib/services/user";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const staticRoutes = ["/", "/about", "/leaderboard", "/multiplayer"];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
  }));

  const usernames = await getPublicProfileUsernames();
  const profileEntries: MetadataRoute.Sitemap = usernames.map((username) => ({
    url: new URL(`/u/${encodeURIComponent(username)}`, siteUrl).toString(),
  }));

  return [...staticEntries, ...profileEntries];
}
