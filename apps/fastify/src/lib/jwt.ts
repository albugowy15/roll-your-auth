import { FastifyRequest } from "fastify";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { z, ZodSchema } from "zod";

export const accessTokenPayloadSchema = z
  .object({
    sub: z.string().min(5).max(16),
  })
  .required();
export const refreshTokenPayloadSchema = z
  .object({
    sub: z.string().min(5).max(16),
    access_token: z.string().min(16),
  })
  .required();

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;

export interface ValidateJWTFromHeadersResult {
  error?: {
    message: string;
    code: number;
  };
  payload?: AccessTokenPayload;
}

export function sign(
  payload: string | Buffer | object,
  secret: string,
  options?: jwt.SignOptions,
): string {
  const token = jwt.sign(payload, secret, options);
  return token;
}

export function verify(
  token: string,
  secret: string,
  payloadSchema: ZodSchema,
) {
  const payload = jwt.verify(token, secret);
  const parsedPayload = payloadSchema.safeParse(payload);
  return parsedPayload;
}

export function validateJwtFromHeaders(
  request: FastifyRequest,
  secret: string,
): ValidateJWTFromHeadersResult {
  const headers = request.headers;
  const authHeader = headers.authorization;
  if (!authHeader) {
    return {
      error: {
        message: "Missing authentication header",
        code: 401,
      },
    };
  }

  const authHeaderVals = authHeader.split(" ");
  if (authHeaderVals.length != 2) {
    return {
      error: {
        message: "Invalid bearer token format",
        code: 401,
      },
    };
  }
  const token = authHeaderVals[1];
  if (token === "") {
    return {
      error: {
        message: "Invalid bearer token format",
        code: 401,
      },
    };
  }

  try {
    const payload = verify(token, secret, accessTokenPayloadSchema);
    if (!payload.success) {
      return {
        error: {
          message: "Invalid bearer token format",
          code: 401,
        },
      };
    }
    return {
      payload: payload.data,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        error: {
          message: "Token expired",
          code: 401,
        },
      };
    }
    if (error instanceof JsonWebTokenError) {
      return {
        error: {
          message: error.message,
          code: 401,
        },
      };
    }
    return {
      error: {
        message: "Unknown error when validating token",
        code: 500,
      },
    };
  }
}
