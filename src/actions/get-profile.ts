"use server";

import createClient from "@/lib/supa";

export async function getProfileById(id: string) {
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
