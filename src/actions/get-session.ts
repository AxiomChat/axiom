"use server";

import createClient from "@/lib/supa";

export default async function getSession() {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.user.id;
}
