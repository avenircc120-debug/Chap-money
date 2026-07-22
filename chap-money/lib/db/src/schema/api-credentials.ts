import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const apiCredentialsTable = pgTable("api_credentials", {
  id:         uuid("id").primaryKey().defaultRandom(),
  siteName:   text("site_name").notNull(),
  webhookUrl: text("webhook_url").notNull(),
  publicKey:  text("public_key").notNull().unique(),
  secretKey:  text("secret_key").notNull().unique(),
  webhookKey: text("webhook_key").unique(),
  isActive:   boolean("is_active").notNull().default(true),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
              .$onUpdate(() => new Date()),
});

export type ApiCredential     = typeof apiCredentialsTable.$inferSelect;
export type InsertApiCredential = typeof apiCredentialsTable.$inferInsert;
