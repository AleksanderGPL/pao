const REQUIRED_ENVS = [
  "DB_URL",
  "FRONTEND_URLS",
  "REDIS_URL",
];

for (const env of REQUIRED_ENVS) {
  if (!Deno.env.get(env)) {
    throw new Error(`${env} is not set`);
  }
}

export const DB_URL = Deno.env.get("DB_URL")!;
export const FRONTEND_URLS = Deno.env.get("FRONTEND_URLS")!.split(",");
export const REDIS_URL = Deno.env.get("REDIS_URL")!;
