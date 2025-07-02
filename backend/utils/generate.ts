import crypto from "node:crypto";
import { db } from "@/db/index.ts";
import { lobbiesTable, userSessionsTable } from "@/db/schema.ts";
import { eq } from "drizzle-orm";

export async function generateSessionToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const existingToken = await db.query.userSessionsTable.findFirst({
    where: eq(userSessionsTable.sessionToken, token),
  });

  if (existingToken) {
    return generateSessionToken();
  }

  return token;
}

export async function generateLobbyCode() {
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();

  const existingCode = await db.query.lobbiesTable.findFirst({
    where: eq(lobbiesTable.code, code),
  });

  if (existingCode) {
    return generateLobbyCode();
  }

  return code;
}
