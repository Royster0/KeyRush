import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import AuthPageClient from "./AuthPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Login | KeyRush",
  description: "Log in or create an account to save your typing stats.",
  path: "/auth/login",
  noIndex: true,
});

export default function AuthPage() {
  return <AuthPageClient />;
}
