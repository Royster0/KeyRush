"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

type FormState = {
  error?: string;
} | null;

export async function login(prevState: FormState, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(prevState: FormState, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (data.password.length < 6) {
    return {
      error: "Password must be at least 6 characters long",
    };
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (signUpError || !authData.user) {
    return {
      error: "Error signing up user",
    };
  }

  // Redirect to create-username page (same flow as OAuth)
  // Profile creation happens there after auth has propagated
  revalidatePath("/", "layout");
  redirect("/auth/create-username");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  
  // Determine the site URL
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (process.env.NODE_ENV === "development") {
    siteUrl = "http://localhost:3000";
  } else if (!siteUrl && process.env.NEXT_PUBLIC_VERCEL_URL) {
    siteUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  } else if (!siteUrl && process.env.VERCEL_URL) {
    siteUrl = `https://${process.env.VERCEL_URL}`;
  }

  if (!siteUrl) {
    siteUrl = "http://localhost:3000";
  }

  const redirectTo = `${siteUrl}/auth/callback`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo,
    },
  });

  if (error) {
    redirect("/auth/auth-code-error");
  }

  if (data.url) {
    redirect(data.url);
  }
}
