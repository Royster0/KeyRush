import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Authentication Error | KeyRush",
  description: "There was an error signing you in. Please try again.",
  path: "/auth/auth-code-error",
  noIndex: true,
});

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Authentication Error</h1>
      <p className="text-lg mb-8">
        There was an error signing you in. Please try again.
      </p>
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Back to Login
      </Link>
    </div>
  );
}
