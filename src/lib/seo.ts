import type { Metadata } from "next";

export const SITE_NAME = "KeyRush";
export const DEFAULT_DESCRIPTION = "Ranked typing";

export function getSiteUrl(): string {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl && process.env.NEXT_PUBLIC_VERCEL_URL) {
    siteUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  } else if (!siteUrl && process.env.VERCEL_URL) {
    siteUrl = `https://${process.env.VERCEL_URL}`;
  }

  if (!siteUrl) {
    siteUrl = "http://localhost:3000";
  }

  return siteUrl;
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  type?: "website" | "profile";
};

export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
  type = "website",
}: BuildMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = new URL(path, siteUrl);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
