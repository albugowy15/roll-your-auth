import { NextRequest, NextResponse } from "next/server";
import { ApiPostLoginResponse, LoginAPIResponse, loginSchema } from "./schema";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<LoginAPIResponse | unknown>> {
  const requestBody = await request.json();
  const parsedData = loginSchema.safeParse(requestBody);
  if (!parsedData.success) {
    return NextResponse.json(
      {
        success: true,
        message: "Validation error",
        fieldErrors: parsedData.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  try {
    const result = await fetch(
      new URL("/login", process.env.BACKEND_APP_URL!),
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(parsedData.data),
      },
    );
    const resBody = (await result.json()) as ApiPostLoginResponse;
    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: resBody.message,
        },
        { status: result.status },
      );
    }
    if (resBody.data) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: "access_token",
        value: resBody.data.access_token,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      });
      cookieStore.set({
        name: "refresh_token",
        value: resBody.data.refresh_token,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      });
      return NextResponse.json(
        {
          success: true,
          message: "Success",
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Empty access token",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Unknown error" },
      { status: 500 },
    );
  }
}
