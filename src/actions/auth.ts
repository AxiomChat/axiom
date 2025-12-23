"use server";

import createClient from "@/actions/supa";
import getSession from "./get-session";

/**
 * Request a temporary relay token for a DM node or server.
 */
export async function authRelay(server_id: string) {
  const supabase = await createClient();

  const user_id = await getSession();

  if (!user_id) {
    throw new Error("Invalid user id");
  }

  const { data: relayToken, error: errorRelay } = await supabase
    .from("server_auth")
    .insert({ user_id: user_id, server_id })
    .select("key")
    .maybeSingle();

  if (!relayToken || errorRelay) {
    throw new Error("Failed to create relay token");
  }

  return relayToken.key as string;
}
