import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  fedapayId: integer("fedapay_id").unique(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerFirstname: text("customer_firstname").notNull().default(""),
  customerLastname: text("customer_lastname").notNull().default(""),
  status: text("status").notNull().default("pending"),
  paymentUrl: text("payment_url"),
  /** 'sandbox' or 'live' */
  mode: text("mode").notNull().default("sandbox"),
  /** 'mobile' or 'card' */
  paymentType: text("payment_type").notNull().default("mobile"),
  /** FedaPay operator code: mtn, moov, sbin, mtn_ci, etc. */
  operator: text("operator"),
  country: text("country"),
  phoneNumber: text("phone_number"),
  /** Public key of the API credential used to initiate this payment */
  apiPublicKey: text("api_public_key"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Payment = typeof paymentsTable.$inferSelect;
export type InsertPayment = typeof paymentsTable.$inferInsert;
