import Fastify, { FastifyInstance } from "fastify";
import fastifyPostgres from "@fastify/postgres";
import { User, users } from "./data";
import { config } from "./config";
import {
  refreshTokenPayloadSchema,
  sign,
  validateJwtFromHeaders,
  verify,
} from "./jwt";
import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from "jsonwebtoken";

const JWT_ACCESS_TOKEN_EXPIRES_IN = "5s";
const JWT_REFRESH_TOKEN_EXPIRES_IN = "10s";

const fastify: FastifyInstance = Fastify({ logger: true });

fastify.register(fastifyPostgres, {
  connectionString: config.DATABASE_URL,
});

fastify.get("/", async () => {
  return { hello: "world" };
});

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
  const token = sign(tokenPayload, config.JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshTokenPayload = {
    sub: findUser.id,
    access_token: token,
  };
  const refreshToken = sign(refreshTokenPayload, config.JWT_SECRET, {
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
  const body = request.body as { access_token: string; refresh_token: string };
  try {
    const refreshTokenPayload = verify(
      body.refresh_token,
      config.JWT_SECRET,
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
    const newAccessToken = sign(newAccessTokenPayload, config.JWT_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
    const newRefreshTokenPayload = {
      sub: refreshTokenPayload.data?.sub,
      access_token: newAccessToken,
    };
    const newRefreshToken = sign(newRefreshTokenPayload, config.JWT_SECRET, {
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
    if (error instanceof TokenExpiredError || error instanceof NotBeforeError) {
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
    reply.code(500).send({
      success: false,
      message: "Unknown",
    });
    return;
  }
});

fastify.get("/profile", async (request, reply) => {
  const { error, payload } = validateJwtFromHeaders(request, config.JWT_SECRET);
  if (error) {
    reply.code(error.code).send({ message: error.message, success: false });
    return;
  }
  if (!payload) {
    reply.code(401).send({ message: "Empty token payload", success: false });
    return;
  }
  const findUser = users.find((user) => user.id === payload.sub);
  if (!findUser) {
    reply.code(404).send({
      success: false,
      message: "User not found",
    });
    return;
  }
  reply.code(200).send({
    success: true,
    message: "Success",
    data: {
      id: findUser.id,
      username: findUser.username,
    },
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 5000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
