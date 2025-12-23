import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { supabase } from "../supa";
/**
 * GET /api/auth?token=<relayToken>?key=<serverKey>
 * Called by a (DM node / Server) to verify a temporary relay token.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const key = url.searchParams.get("key");

  if (!token || !key)
    return NextResponse.json(
      { message: "There should be a token and a key parameter" },
      { status: StatusCodes.BAD_REQUEST }
    );

  const { data: server } = await supabase
    .from("servers")
    .select("id, created_at, owner, address")
    .eq("key", key)
    .maybeSingle();

  if (!server)
    return NextResponse.json(
      { message: "Key unauthorized" },
      { status: StatusCodes.UNAUTHORIZED }
    );

  const { data: auth } = await supabase
    .from("server_auth")
    .delete()
    .eq("key", token)
    .select()
    .maybeSingle();

  if (!auth)
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: StatusCodes.NOT_FOUND }
    );

  if (auth.server_id !== server.id)
    return NextResponse.json(
      { message: "Invalid id" },
      { status: StatusCodes.UNAUTHORIZED }
    );

  return NextResponse.json({ message: "ok", ...auth });
}
