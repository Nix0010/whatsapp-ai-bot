import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = path.join(process.cwd(), "bot.db");
const sqlite = new Database(dbPath);

// Habilitar WAL mode para mejor performance
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Crear tablas si no existen
export function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL UNIQUE,
      name TEXT,
      first_seen_at INTEGER NOT NULL DEFAULT (unixepoch()),
      last_seen_at INTEGER NOT NULL DEFAULT (unixepoch()),
      message_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_phone 
      ON conversations(phone_number);
    CREATE INDEX IF NOT EXISTS idx_conversations_created 
      ON conversations(phone_number, created_at DESC);
  `);

  console.log("✅ Base de datos inicializada");
}
