import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  email: text().unique(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userSessionsTable = pgTable("user_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id),
  sessionToken: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const lobbiesTable = pgTable("lobbies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: text().notNull(),
  name: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const lobbyPlayersTable = pgTable("lobby_players", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  lobbyId: integer().references(() => lobbiesTable.id),
  name: text().notNull(),
  isHost: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
});
