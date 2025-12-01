/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(prevState: any, formData: FormData) {
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

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    username: formData.get("username") as string,
  };

  if (data.password.length < 6) {
    return {
      error: "Password must be at least 6 characters long",
    };
  }
  if (data.username.length < 3) {
    return {
      error: "Username must be at least 3 characters long",
    };
  }

  // Create user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (signUpError) {
    console.log(signUpError.message);
    return {
      error: "Error signing up user",
    };
  }

  // Wait a second to ensure user is created
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user!.id,
      username: data.username,
    });

    if (profileError) {
      console.log(profileError.message);
      return {
        error: "Error creating user profile.",
      };
    }
  } catch (err) {
    console.log("Profile creation error:", err);
    return {
      error:
        "Account created but profile setup failed. Please contact support.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
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
    redirect("/error");
  }

  if (data.url) {
    redirect(data.url);
  }
}
