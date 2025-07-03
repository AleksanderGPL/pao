import { Redis } from "ioredis";
import { REDIS_URL } from "./global.ts";

export const redis = new Redis(REDIS_URL);
