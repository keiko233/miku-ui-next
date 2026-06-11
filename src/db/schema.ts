import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { DeviceStatus, SELinuxStatus, TaskStatus, UserRole } from "@/schema";

// NOTE: table + column names are quoted to match the existing live D1 schema
// (PascalCase tables, camelCase columns). The shape mirrors database.sql, not
// the original migrations/*.sql — the live `User` table carries admin-plugin
// columns (role/banned/banReason/banExpires) that were never captured in a
// migration file.

export const devices = sqliteTable("Devices", {
  id: text("id").primaryKey().notNull(),
  codename: text("codename").notNull(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  androidVersion: integer("androidVersion").notNull(),
  status: text("status").$type<DeviceStatus>().notNull(),
  selinuxStatus: text("selinuxStatus").$type<SELinuxStatus>().notNull(),
  kernelsuVersion: integer("kernelsuVersion").notNull(),
  sourcforgeUrl: text("sourcforgeUrl").notNull(),
  changelog: text("changelog"),
  note: text("note"),
  // The DDL declares these as DATETIME DEFAULT CURRENT_TIMESTAMP, but the app
  // always writes Date.now() (ms epoch). SQLite type affinity stores those as
  // INTEGER fine; declare them as integer here so the inferred TS type is
  // number, matching the existing Zod schema and runtime values.
  publishAt: integer("publishAt").notNull().default(sql`(unixepoch() * 1000)`),
  createdAt: integer("createdAt").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updatedAt").notNull().default(sql`(unixepoch() * 1000)`),
});

export const tasks = sqliteTable("Tasks", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").$type<TaskStatus>().notNull(),
  createdAt: integer("createdAt").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updatedAt").notNull().default(sql`(unixepoch() * 1000)`),
});

export const context = sqliteTable("Context", {
  id: text("id").primaryKey().notNull(),
  index: integer("index").notNull(),
  content: text("content").notNull(),
  createdAt: integer("createdAt").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updatedAt").notNull().default(sql`(unixepoch() * 1000)`),
});

// ---- better-auth tables (PascalCase, mirrors live database.sql) ----

export const user = sqliteTable("User", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
  // DB-side default is the literal "user" (live DDL); the app overrides via
  // better-auth's admin plugin (defaultRole: UserRole.USER → "USER"). Kept
  // exact-match so drizzle-kit doesn't propose an ALTER.
  role: text("role").$type<UserRole>().default("user" as UserRole),
  banned: integer("banned", { mode: "boolean" }),
  banReason: text("banReason"),
  banExpires: integer("banExpires"),
});

export const session = sqliteTable("Session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  token: text("token").notNull(),
  impersonatedBy: text("impersonatedBy"),
  expiresAt: text("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

export const account = sqliteTable("Account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: text("accessTokenExpiresAt"),
  refreshTokenExpiresAt: text("refreshTokenExpiresAt"),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

export const verification = sqliteTable("Verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: text("expiresAt").notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});
