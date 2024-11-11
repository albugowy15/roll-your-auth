import { ApiPostLoginResponse } from "@/app/api/auth/login/schema";

interface LoginCredentials {
  username: string;
  password: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public httpCode: number,
  ) {
    super(message);
  }
}

export async function login(credentials: LoginCredentials) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  const result: ApiPostLoginResponse = await response.json();
  if (!result.success) {
    throw new AuthError(result.message, response.status);
  }
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (!result.success) {
    throw new AuthError(result.message, response.status);
  }
}
