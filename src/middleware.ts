import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
// import type { Session } from "@/lib/auth";

// const fetchSession = async ({
//   headers,
//   nextUrl,
// }: NextRequest): Promise<Session | null> => {
//   const response = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
//     headers: {
//       baseURL: nextUrl.origin,
//       cookie: headers.get("cookie") || "",
//     },
//   });

//   try {
//     return await response.json();
//   } catch (error) {
//     return null;
//   }
// };

export default async function authMiddleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
