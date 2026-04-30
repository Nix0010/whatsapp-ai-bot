import { db } from "../db";
import { conversations, users } from "../db/schema";
import { eq, desc, and, lt } from "drizzle-orm";

// Máximo de mensajes del historial a enviarle a la IA
const MAX_HISTORY = 10;

// Retención máxima: 24 horas (en segundos)
const MAX_AGE_SECONDS = 24 * 60 * 60;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Registrar o actualizar un usuario
export async function upsertUser(phoneNumber: string, name?: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  });

  if (existing) {
    await db
      .update(users)
      .set({
        lastSeenAt: new Date(),
        messageCount: existing.messageCount + 1,
        ...(name && !existing.name ? { name } : {}),
      })
      .where(eq(users.phoneNumber, phoneNumber));
  } else {
    await db.insert(users).values({
      phoneNumber,
      name: name ?? null,
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      messageCount: 1,
    });
  }
}

// Guardar un mensaje en el historial
export async function saveMessage(
  phoneNumber: string,
  role: "user" | "assistant",
  content: string
) {
  await db.insert(conversations).values({
    phoneNumber,
    role,
    content,
    createdAt: new Date(),
  });
}

// Obtener historial reciente de un usuario
export async function getHistory(phoneNumber: string): Promise<ChatMessage[]> {
  const messages = await db
    .select()
    .from(conversations)
    .where(eq(conversations.phoneNumber, phoneNumber))
    .orderBy(desc(conversations.createdAt))
    .limit(MAX_HISTORY);

  return messages.reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

// Limpiar historial antiguo (llamar periódicamente)
export async function cleanOldMessages() {
  const cutoff = new Date(Date.now() - MAX_AGE_SECONDS * 1000);
  await db
    .delete(conversations)
    .where(lt(conversations.createdAt, cutoff));
}
