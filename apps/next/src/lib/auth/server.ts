import "server-only";

import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { BackendAPIBaseResponse } from "../api";

export async function refreshSession({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const response = await fetch(
    new URL("/api/auth/refresh", "http://localhost:3000"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    },
  );
  const result: BackendAPIBaseResponse<{
    access_token: string;
    refresh_token: string;
  }> = await response.json();
  return result;
}

export function isTokenExpired(token: string) {
  const decoded = decodeJwt(token);
  if (!decoded.exp) {
    return true;
  }
  const tokenExprMilis = decoded.exp * 1000;
  const currTime = Date.now();
  if (currTime > tokenExprMilis) {
    return true;
  }
  return false;
}

export async function auth() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) {
    return {
      accessToken: "",
      refreshToken: "",
      isAuthenticated: false,
    };
  }
  if (isTokenExpired(refreshToken)) {
    return {
      accessToken: "",
      refreshToken: "",
      isAuthenticated: false,
    };
  }
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) {
    return {
      accessToken: "",
      refreshToken: "",
      isAuthenticated: false,
    };
  }
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    isAuthenticated: true,
  };
}
