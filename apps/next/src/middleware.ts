import { NextRequest, NextResponse } from "next/server";
import { isTokenExpired, refreshSession } from "./lib/auth/server";

export async function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const accessToken = request.cookies.get("access_token")?.value;
  if (request.nextUrl.pathname.startsWith("/login")) {
    // only login when not authenticated
    if (!refreshToken || !accessToken || isTokenExpired(refreshToken)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isTokenExpired(refreshToken)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isTokenExpired(accessToken)) {
    // refresh
    const result = await refreshSession({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
    if (result.data) {
      const response = NextResponse.next();
      response.cookies.set("access_token", result.data.access_token);
      response.cookies.set("refresh_token", result.data.refresh_token);
      return response;
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
}

export const config = {
  matcher: ["/login/:path*", "/profile/:path*"],
};
