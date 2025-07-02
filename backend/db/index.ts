import { drizzle } from "drizzle-orm/node-postgres";
import { DB_URL } from "@/utils/global.ts";
import * as schema from "./schema.ts";

export const db = drizzle(DB_URL, { schema });
