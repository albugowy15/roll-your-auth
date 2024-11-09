import Fastify, { FastifyInstance } from "fastify";

const fastify: FastifyInstance = Fastify({
  logger: true
});

fastify.get("/", async () => {
  return { hello: "world" };
});

fastify.post("/login", async () => {
  return {
    success: true,
    message: "Success",
    data: {
      access_token: "some-access-token"
    }
  };
});

fastify.post("/register", async () => {
  return {
    message: "success"
  };
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
