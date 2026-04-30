import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
