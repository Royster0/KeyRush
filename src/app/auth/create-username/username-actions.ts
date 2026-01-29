"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type FormState = { error?: string } | null;

export async function createUsername(prevState: FormState, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in to create a username",
    };
  }

  const username = formData.get("username") as string | null;

  if (!username || username.length < 3) {
    return {
      error: "Username must be at least 3 characters long",
    };
  }

  // Check if username is taken (case-insensitive)
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("username")
    .ilike("username", username)
    .single();

  if (existingUser) {
    return {
      error: "Username is already taken",
    };
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username: username,
  });

  if (error) {
    // Check for unique constraint violation (PostgreSQL error code 23505)
    if (error.code === "23505") {
      return {
        error: "Username is already taken",
      };
    }
    return {
      error: "Failed to create username. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
