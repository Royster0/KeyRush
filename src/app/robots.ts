import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/profile", "/settings", "/friends", "/badges"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
