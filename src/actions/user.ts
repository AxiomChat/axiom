"use server";

import createClient from "@/actions/supa";

/**
 * Register a new user
 */
export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  if (!username || !email || !password) {
    throw new Error("Missing required fields");
  }

  const supabase = await createClient();

  // Check if username is already taken
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    throw new Error("Username already used");
  }

  // Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "User registration failed");
  }

  // Insert profile
  await supabase.from("profiles").insert({
    id: authData.user.id,
    username,
    display_name: username,
    avatar_url: "",
    node_address: "",
  });

  return {
    message: "User registered. Please check your email to verify your account.",
    user_id: authData.user.id,
    email_sent: true,
  };
}

/**
 * Login a user
 */
export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error("Invalid credentials");
  }

  const { session } = data;

  return session.user?.id;
}
