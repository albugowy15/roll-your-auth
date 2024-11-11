import Fastify, { FastifyInstance } from "fastify";
import { configOptions } from "./lib/config";
import fastifyEnv from "@fastify/env";
import { authRoutes } from "./routes/auth";
import { profileRoutes } from "./routes/profile";

const fastify: FastifyInstance = Fastify({ logger: true });

fastify.register(fastifyEnv, configOptions);
fastify.register(authRoutes);
fastify.register(profileRoutes);

fastify.get("/", async () => {
  return { hello: "world" };
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
