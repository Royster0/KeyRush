import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { signOut } from "@/app/actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Logout"
        title="Logout"
        className="hover:bg-transparent hover:text-primary transition-all"
      >
        <LogOut className="size-5" />
      </Button>
    </form>
  );
}
