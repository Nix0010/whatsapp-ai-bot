import { getAIResponse } from "../ai/groq";
import {
  getHistory,
  saveMessage,
  upsertUser,
  cleanOldMessages,
} from "./memory";

// Comandos especiales
const COMMANDS: Record<string, string> = {
  hola: "¡Hola! 👋 Bienvenido a NetFlow 🚀\n\nCreamos páginas web modernas, software a medida, automatizaciones inteligentes e integración con IA para ayudar a negocios a vender más, ahorrar tiempo y mejorar su atención al cliente.\n\nCuéntame, ¿qué estás buscando para tu negocio?",
  inicio: "¡Hola! 👋 Bienvenido a NetFlow 🚀\n\nCreamos páginas web modernas, software a medida, automatizaciones inteligentes e integración con IA para ayudar a negocios a vender más, ahorrar tiempo y mejorar su atención al cliente.\n\nCuéntame, ¿qué estás buscando para tu negocio?",
  precio: "¡Claro! 💻 Nuestros precios dependen del tipo de proyecto, funciones y nivel de personalización.\n\nPara darte una cotización más exacta, cuéntame:\n1. ¿Qué tipo de negocio tienes?\n2. ¿Necesitas página web, chatbot, automatización o software?\n3. ¿Qué objetivo quieres lograr?",
  precios: "¡Claro! 💻 Nuestros precios dependen del tipo de proyecto, funciones y nivel de personalización.\n\nPara darte una cotización más exacta, cuéntame:\n1. ¿Qué tipo de negocio tienes?\n2. ¿Necesitas página web, chatbot, automatización o software?\n3. ¿Qué objetivo quieres lograr?",
  humano: "👨‍💼 Entendido. En breve un especialista de NetFlow se pondrá en contacto contigo. ¡Gracias por tu paciencia!",
  reset: "🔄 Conversación reiniciada. ¿En qué puedo ayudarte?",
};

let messageCount = 0;

/**
 * Función auxiliar para verificar si el texto es un comando rápido
 */
function getCommandResponse(text: string): string | null {
  const commandText = text.trim().toLowerCase();
  return COMMANDS[commandText] || null;
}

export async function handleMessage(
  phoneNumber: string,
  pushName: string | undefined,
  text: string
): Promise<string> {
  const normalizedText = text.trim();

  try {
    // 1. Registro inicial y limpieza en paralelo (No bloqueante si falla uno)
    messageCount++;
    await Promise.allSettled([
      upsertUser(phoneNumber, pushName),
      messageCount % 50 === 0 ? cleanOldMessages() : Promise.resolve(),
    ]);

    // 2. Comandos rápidos (Prioridad alta)
    const commandResponse = getCommandResponse(normalizedText);
    if (commandResponse) {
      if (normalizedText.toLowerCase() !== "reset") {
        // Guardado no bloqueante
        Promise.allSettled([
          saveMessage(phoneNumber, "user", text),
          saveMessage(phoneNumber, "assistant", commandResponse)
        ]).catch(console.error);
      }
      return commandResponse;
    }

    // 3. Validación de texto vacío/corto
    if (normalizedText.length < 2) {
      return "¿Puedes escribirme un poco más? 😊";
    }

    // 4. Invocación de IA con historial
    const history = await getHistory(phoneNumber);
    const aiResponse = await getAIResponse(text, history);

    // 5. Guardado en memoria en background (mejora latencia)
    Promise.allSettled([
      saveMessage(phoneNumber, "user", text),
      saveMessage(phoneNumber, "assistant", aiResponse)
    ]).catch((err) => console.error(`Error guardando historial para ${phoneNumber}:`, err));

    return aiResponse;

  } catch (error) {
    console.error(`[Error en handleMessage] para ${phoneNumber}:`, error);
    return "Ups 😅, tuve un pequeño problema procesando tu mensaje. ¿Podrías repetirlo?";
  }
}
