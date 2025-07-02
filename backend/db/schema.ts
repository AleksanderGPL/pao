import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  email: text().unique(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userSessionsTable = pgTable("user_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id).notNull(),
  sessionToken: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userSessionsRelations = relations(
  userSessionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userSessionsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

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
