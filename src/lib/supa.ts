import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value) {
          cookieStore.set(name, value);
        },
        remove(name) {
          cookieStore.delete(name);
        },
      },
    }
  );
}
