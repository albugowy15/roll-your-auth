import { FastifyInstance } from "fastify";
import { Envs } from "../lib/config";
import { validateJwtFromHeaders } from "../lib/jwt";
import { users } from "../data";

export function profileRoutes(fastify: FastifyInstance) {
  fastify.get("/profile", async (request, reply) => {
    const secret = fastify.getEnvs<Envs>().JWT_SECRET;
    const { error, payload } = validateJwtFromHeaders(request, secret);
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
    return;
  });
}
