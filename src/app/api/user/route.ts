import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { supabase } from "../supa";

/**
 * POST /api/user
 * Register new user
 * Body: { username, email, password }
 */
export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!email || !password || !username)
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: StatusCodes.BAD_REQUEST }
    );

  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existing)
    return NextResponse.json(
      { message: "Username already used" },
      { status: StatusCodes.CONFLICT }
    );

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError)
    return NextResponse.json(
      { message: authError.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );

  if (!authData.user)
    return NextResponse.json(
      { message: "User is null" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );

  await supabase.from("profiles").insert({
    id: authData.user.id,
    username,
    display_name: username,
    avatar_url: "",
    node_address: "",
  });

  return NextResponse.json({
    message: "User registered. Please check your email to verify your account.",
    user_id: authData.user?.id,
    email_sent: true,
  });
}

/**
 * GET /api/user
 * Login user
 * Params: { username, password }
 */
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const [email, password] = [params.get("email"), params.get("password")];

  if (!email || !password)
    return NextResponse.json(
      { message: "Params email and password are required" },
      { status: StatusCodes.BAD_REQUEST }
    );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error)
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: StatusCodes.UNAUTHORIZED }
    );

  const { session } = data;
  const res = NextResponse.json({
    message: "ok",
    access_token: session?.access_token,
    refresh_token: session?.refresh_token,
    user_id: session?.user?.id,
  });

  res.cookies.set("token", session?.access_token ?? "", { httpOnly: true });

  return res;
}
