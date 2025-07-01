const REQUIRED_ENVS = [
  "DB_URL",
];

for (const env of REQUIRED_ENVS) {
  if (!Deno.env.get(env)) {
    throw new Error(`${env} is not set`);
  }
}

export const DB_URL = Deno.env.get("DB_URL")!;
