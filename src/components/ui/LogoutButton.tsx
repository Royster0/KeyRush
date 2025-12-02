import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { signOut } from "@/app/actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button variant="ghost" size="icon" aria-label="Logout" title="Logout">
        <LogOut className="size-4" />
      </Button>
    </form>
  );
}
