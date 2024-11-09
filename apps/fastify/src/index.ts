import Fastify, { FastifyInstance } from "fastify";

const fastify: FastifyInstance = Fastify({
  logger: true
});

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
