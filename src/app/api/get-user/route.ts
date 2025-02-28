import { getUser } from "@/app/actions";

export async function GET() {
  const user = await getUser();

  return new Response(JSON.stringify({ user }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
