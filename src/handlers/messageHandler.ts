import { getAIResponse } from "../ai/groq";
import {
  getHistory,
  saveMessage,
  upsertUser,
  cleanOldMessages,
} from "./memory";

// Comandos especiales
const COMMANDS: Record<string, string> = {
  hola: "👋 ¡Hola! Soy el asistente virtual. ¿En qué puedo ayudarte hoy?",
  inicio: "👋 ¡Hola! Soy el asistente virtual. ¿En qué puedo ayudarte hoy?",
  ayuda:
    "ℹ️ Puedo ayudarte con información sobre nuestros servicios, horarios, precios y más. Solo escríbeme tu pregunta.",
  humano:
    "👨‍💼 Entendido. En breve un integrante de nuestro equipo se pondrá en contacto contigo. ¡Gracias por tu paciencia!",
  reset:
    "🔄 Conversación reiniciada. ¿En qué puedo ayudarte?",
};

let messageCount = 0;

export async function handleMessage(
  phoneNumber: string,
  pushName: string | undefined,
  text: string
): Promise<string> {
  const normalizedText = text.trim().toLowerCase();

  // Registrar usuario
  await upsertUser(phoneNumber, pushName);

  // Limpiar mensajes viejos cada 50 mensajes
  messageCount++;
  if (messageCount % 50 === 0) {
    await cleanOldMessages();
  }

  // Verificar comandos especiales
  if (COMMANDS[normalizedText]) {
    const response = COMMANDS[normalizedText]!;
    // Guardar en historial (excepto reset)
    if (normalizedText !== "reset") {
      await saveMessage(phoneNumber, "user", text);
      await saveMessage(phoneNumber, "assistant", response);
    }
    return response;
  }

  // Ignorar mensajes muy cortos o vacíos
  if (text.length < 2) {
    return "¿Puedes escribirme un poco más? 😊";
  }

  // Obtener historial y generar respuesta con IA
  const history = await getHistory(phoneNumber);
  const aiResponse = await getAIResponse(text, history);

  // Guardar en historial
  await saveMessage(phoneNumber, "user", text);
  await saveMessage(phoneNumber, "assistant", aiResponse);

  return aiResponse;
}
