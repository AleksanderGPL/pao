import { createMiddleware } from "hono/factory";
import { InferSelectModel } from "drizzle-orm";
import { userSessionsTable, usersTable } from "@/db/schema.ts";
import { db } from "@/db/index.ts";
import { eq } from "drizzle-orm";

export const authRequired = createMiddleware<{
  Variables: {
    session: InferSelectModel<typeof userSessionsTable> & {
      user: InferSelectModel<typeof usersTable>;
    };
  };
}>(async (c, next) => {
  const sessionToken = c.req.header("Authorization");

  if (!sessionToken) {
    return c.json({
      message: "Session token missing.",
    }, 401);
  }

  const session = await db.query.userSessionsTable.findFirst({
    where: eq(userSessionsTable.sessionToken, sessionToken),
    with: {
      user: true,
    },
  });

  if (!session) {
    return c.json({
      message: "Incorrect session token.",
    }, 401);
  }

  c.set("session", session);

  await next();
});
