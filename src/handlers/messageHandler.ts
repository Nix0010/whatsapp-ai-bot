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
