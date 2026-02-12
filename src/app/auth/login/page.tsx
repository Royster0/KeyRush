import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import AuthPageClient from "./AuthPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Login | KeyRush",
  description: "Log in or create an account to save your typing stats.",
  path: "/auth/login",
  noIndex: true,
});

type LoginPageSearchParams = {
  mode?: string | string[] | undefined;
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<LoginPageSearchParams>;
}) {
  const params = await searchParams;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const initialMode = mode === "signup" ? "signup" : "login";

  return <AuthPageClient initialMode={initialMode} />;
}
