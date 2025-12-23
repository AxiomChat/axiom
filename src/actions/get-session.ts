"use server";

import createClient from "@/actions/supa";

export default async function getSessionUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  const user = data.user;

  if (!user) return null;

  return user.id;
}
