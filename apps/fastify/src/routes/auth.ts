import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { User, users } from "../data";
import { Envs } from "../lib/config";
import { refreshTokenPayloadSchema, sign, verify } from "../lib/jwt";
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";

const JWT_ACCESS_TOKEN_EXPIRES_IN = "10m";
const JWT_REFRESH_TOKEN_EXPIRES_IN = "2d";

export function authRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  fastify.post("/login", async (request, reply) => {
    const reqBody = request.body as User;
    const findUser = users.find((user) => user.username === reqBody.username);
    if (!findUser) {
      reply.code(400).send({
        success: false,
        message: "Invalid username or password",
      });
      return;
    }
    const isPasswordCorrect = findUser.password === reqBody.password;
    if (!isPasswordCorrect) {
      reply.code(400).send({
        success: false,
        message: "Invalid username or password",
      });
      return;
    }
    const tokenPayload = {
      sub: findUser.id,
    };
    const secret = fastify.getEnvs<Envs>().JWT_SECRET;
    const token = sign(tokenPayload, secret, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshTokenPayload = {
      sub: findUser.id,
      access_token: token,
    };
    const refreshToken = sign(refreshTokenPayload, secret, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      success: true,
      message: "Success",
      data: {
        access_token: token,
        refresh_token: refreshToken,
      },
    };
  });

  fastify.post("/refresh", async (request, reply) => {
    const secret = fastify.getEnvs<Envs>().JWT_SECRET;
    const body = request.body as {
      access_token: string;
      refresh_token: string;
    };
    try {
      const refreshTokenPayload = verify(
        body.refresh_token,
        secret,
        refreshTokenPayloadSchema,
      );
      if (refreshTokenPayload.data.access_token != body.access_token) {
        reply.code(400).send({
          success: false,
          message: "Access token not match",
        });
        return;
      }
      const newAccessTokenPayload = {
        sub: refreshTokenPayload.data?.sub,
      };
      const newAccessToken = sign(newAccessTokenPayload, secret, {
        expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
      });
      const newRefreshTokenPayload = {
        sub: refreshTokenPayload.data?.sub,
        access_token: newAccessToken,
      };
      const newRefreshToken = sign(newRefreshTokenPayload, secret, {
        expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
      });
      reply.code(200).send({
        success: true,
        message: "Success",
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      });
      return;
    } catch (error) {
      if (
        error instanceof TokenExpiredError ||
        error instanceof NotBeforeError
      ) {
        reply.code(400).send({
          success: false,
          message: "Refresh token expired",
        });
        return;
      }
      if (error instanceof JsonWebTokenError) {
        reply.code(400).send({
          success: false,
          message: "Refresh token invalid",
        });
        return;
      }
      reply.code(400).send({
        success: false,
        message: "Incorrect token format",
      });
      return;
    }
  });

  done();
}
