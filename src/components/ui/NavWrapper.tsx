import { getUser } from "@/lib/services/user";
import Nav from "./Nav";

export default async function NavWrapper() {
  const user = await getUser();
  return <Nav initialUser={user} />;
}
