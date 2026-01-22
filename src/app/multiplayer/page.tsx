import { getUser } from "@/app/actions";
import MultiplayerClient from "@/components/multiplayer/MultiplayerClient";

export default async function MultiplayerPage() {
  const user = await getUser();
  return <MultiplayerClient user={user} />;
}
