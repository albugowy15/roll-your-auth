export interface Config {
  DATABASE_URL: string;
  JWT_SECRET: string;
}

export const config: Config = {
  DATABASE_URL: "postgres://root:example@localhost:5432/rollauth_db",
  JWT_SECRET: "secrettosignandverifyjwttoken"
};
