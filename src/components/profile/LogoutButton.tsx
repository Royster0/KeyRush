import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { signOut } from "@/app/profile/actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button variant="ghost" size="icon">
        <LogOut className="size-4" />
      </Button>
    </form>
  );
}
