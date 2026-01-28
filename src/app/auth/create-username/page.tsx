import { createClient } from "@/utils/supabase/server";
import { CreateUsernameForm } from "./CreateUsernameForm";

export default async function CreateUsernamePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get pending username from signup metadata (if user signed up via email)
  const pendingUsername = user?.user_metadata?.pending_username as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <CreateUsernameForm defaultUsername={pendingUsername} />
    </div>
  );
}
