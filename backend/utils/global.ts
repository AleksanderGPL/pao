const REQUIRED_ENVS = [
  "DB_URL",
  "FRONTEND_URLS",
  "REDIS_URL",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
];

for (const env of REQUIRED_ENVS) {
  if (!Deno.env.get(env)) {
    throw new Error(`${env} is not set`);
  }
}

export const DB_URL = Deno.env.get("DB_URL")!;
export const FRONTEND_URLS = Deno.env.get("FRONTEND_URLS")!.split(",");
export const REDIS_URL = Deno.env.get("REDIS_URL")!;
export const S3_ACCESS_KEY = Deno.env.get("S3_ACCESS_KEY")!;
export const S3_SECRET_KEY = Deno.env.get("S3_SECRET_KEY")!;
export const S3_ENDPOINT = Deno.env.get("S3_ENDPOINT")!;
export const S3_REGION = Deno.env.get("S3_REGION")!;
export const S3_BUCKET = Deno.env.get("S3_BUCKET")!;
