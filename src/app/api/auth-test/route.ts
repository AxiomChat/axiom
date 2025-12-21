import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { supabase } from "../supa";
/**
 * GET /api/auth-test?id=<serverId>?key=<serverKey>
 * Called by a (DM node / Server) to check if the auth config is correct.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const serverId = url.searchParams.get("id");
  const key = url.searchParams.get("key");

  if (!serverId || !key)
    return NextResponse.json(
      { message: "There should be a id and a key parameter" },
      { status: StatusCodes.BAD_REQUEST }
    );

  const { data: server } = await supabase
    .from("servers")
    .select("id, created_at, owner, address, name")
    .eq("key", key)
    .eq("id", serverId)
    .maybeSingle();

  if (!server)
    return NextResponse.json(
      { message: "Invalid key or id" },
      { status: StatusCodes.UNAUTHORIZED }
    );

  return NextResponse.json({ message: "ok", ...server });
}
