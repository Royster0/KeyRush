import { getUser } from "@/app/actions";
import MultiplayerClient from "@/components/multiplayer/MultiplayerClient";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Multiplayer | KeyRush",
  description: "Race in real-time 1v1 typing matches and climb the ladder.",
  path: "/multiplayer",
});

export default async function MultiplayerPage() {
  const user = await getUser();
  return <MultiplayerClient user={user} />;
}
