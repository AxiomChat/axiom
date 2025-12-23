"use server";

import createClient from "@/actions/supa";

export async function getServerById(id: string) {
  const supabase = await createClient();

  const { error, data: server } = await supabase
    .from("servers")
    .select("id, name, created_at, owner, address, icon_url")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (!server) throw "Server is null";

  return server;
}
