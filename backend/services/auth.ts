import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/db/index.ts";
import { userSessionsTable, usersTable } from "@/db/schema.ts";
import { generateSessionToken } from "@/utils/generate.ts";
import { authRequired } from "@/middleware/auth.ts";

const app = new Hono();

app.get("/", authRequired, (c) => {
  const session = c.get("session");

  return c.json({
    name: session.user.name,
  });
});

app.post(
  "/register",
  zValidator("json", z.object({ name: z.string().min(2).max(20) })),
  async (c) => {
    const { name } = c.req.valid("json");

    try {
      // Check if username is already taken
      const existingUser = await db.query.usersTable.findFirst({
        where: (users, { eq }) => eq(users.name, name),
      });

      if (existingUser) {
        return c.json({ error: "Username already taken" }, 409);
      }

      const [user] = await db.insert(usersTable).values({ name }).returning();

      const sessionToken = await generateSessionToken();

      await db.insert(userSessionsTable).values({
        sessionToken,
        userId: user.id,
      }).returning();

      return c.json({ sessionToken });
    } catch (e) {
      console.error(e);
      return c.json({ error: "A server error occurred" }, 500);
    }
  },
);

export default app;
