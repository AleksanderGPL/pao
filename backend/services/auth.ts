import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/db/index.ts";
import { userSessionsTable, usersTable } from "@/db/schema.ts";
import { generateSessionToken } from "@/utils/generate.ts";

const app = new Hono();

app.post(
  "/register",
  zValidator("json", z.object({ name: z.string().min(1).max(256) })),
  async (c) => {
    const { name } = c.req.valid("json");

    const [user] = await db.insert(usersTable).values({ name }).returning();

    const sessionToken = await generateSessionToken();

    await db.insert(userSessionsTable).values({
      sessionToken,
      userId: user.id,
    }).returning();

    return c.json(sessionToken);
  },
);

export default app;
