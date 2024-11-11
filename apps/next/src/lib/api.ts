import "server-only";
import { auth, isTokenExpired, refreshSession } from "./auth/server";

const BACKEND_URL = process.env.BACKEND_APP_URL!;

export interface BackendAPIBaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface FetchWithSessionResult<TData> {
  error?: string;
  isSuccess: boolean;
  data?: BackendAPIBaseResponse<TData>;
}

export async function fetchWithSession<TData>(
  path: string,
  init?: RequestInit,
): Promise<FetchWithSessionResult<TData>> {
  try {
    const session = await auth();
    let accessToken = session.accessToken;
    if (isTokenExpired(accessToken)) {
      const result = await refreshSession({
        accessToken: accessToken,
        refreshToken: session.refreshToken,
      });
      if (!result.success) {
        return {
          isSuccess: false,
          error: result.message,
        };
      }
      if (!result.data) {
        return {
          isSuccess: false,
          error: "Empty result data",
        };
      }
      accessToken = result.data.access_token;
    }

    const response = await fetch(new URL(path, BACKEND_URL), {
      method: init?.method,
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      ...init,
    });
    const result: BackendAPIBaseResponse<TData> = await response.json();
    if (!response.ok) {
      return {
        isSuccess: false,
        error: result.message,
      };
    }
    return {
      isSuccess: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        isSuccess: false,
        error: error.message,
      };
    }
    return {
      isSuccess: false,
      error: "Network error",
    };
  }
}
