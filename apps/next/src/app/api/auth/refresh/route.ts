import { NextRequest, NextResponse } from "next/server";
import {
  ApiRefreshTokenResponse,
  refreshTokenApiSchema,
  RefreshTokenResponse,
} from "./schema";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RefreshTokenResponse>> {
  const parsedRequestBody = refreshTokenApiSchema.safeParse(
    await request.json(),
  );
  if (!parsedRequestBody.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body",
      },
      { status: 400 },
    );
  }
  try {
    const fetchResponse = await fetch(
      new URL("/refresh", process.env.BACKEND_APP_URL),
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(parsedRequestBody.data),
      },
    );
    const result: ApiRefreshTokenResponse = await fetchResponse.json();
    if (!fetchResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: fetchResponse.status },
      );
    }
    if (!result.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Empty response data",
        },
        { status: 400 },
      );
    }
    const cookieStore = await cookies();
    cookieStore.set({
      name: "access_token",
      value: result.data.access_token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
    cookieStore.set({
      name: "refresh_token",
      value: result.data.refresh_token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: {
          access_token: result.data.access_token,
          refresh_token: result.data.refresh_token,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Unknown error" },
      { status: 500 },
    );
  }
}
