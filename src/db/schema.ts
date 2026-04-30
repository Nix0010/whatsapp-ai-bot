import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Tabla de conversaciones — guarda el historial de cada usuario
export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phoneNumber: text("phone_number").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Tabla de usuarios — info básica de cada contacto
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name"),
  firstSeenAt: integer("first_seen_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  messageCount: integer("message_count").default(0).notNull(),
});
