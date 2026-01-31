import { CreateUsernameForm } from "./CreateUsernameForm";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Create Username | KeyRush",
  description: "Choose a username to finish setting up your KeyRush account.",
  path: "/auth/create-username",
  noIndex: true,
});

export default function CreateUsernamePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <CreateUsernameForm />
    </div>
  );
}
