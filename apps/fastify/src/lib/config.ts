const configSchema = {
  type: "object",
  required: ["JWT_SECRET"],
  properties: {
    JWT_SECRET: {
      type: "string",
    },
  },
};

export const configOptions = {
  confKey: "config",
  schema: configSchema,
  dotenv: true,
};

declare module "fastify" {
  interface FastifyInstance {
    config: {
      JWT_SECRET: string;
    };
  }
}

export type Envs = {
  JWT_SECRET: string;
};
