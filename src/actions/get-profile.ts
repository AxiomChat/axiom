"use server";

import createClient from "@/actions/supa";
import { ProfileSettings } from "@/types/settings";
import getSession from "./get-session";
import { UserProfile } from "@/hooks/get-user";

export async function getProfileById(id: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { error, data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, node_address")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getProfileByUsername(
  username: string
): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { error, data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, node_address")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfile(profile: ProfileSettings) {
  const supabase = await createClient();
  const user_id = await getSession();

  if (!user_id) {
    throw new Error("User id invalid");
  }

  const { error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", user_id);

  if (error) {
    throw error;
  }
}
