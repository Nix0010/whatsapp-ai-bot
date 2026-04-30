import Groq from "groq-sdk";
import type { ChatMessage } from "../handlers/memory";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

// Prompt del sistema — personalizable por negocio
function buildSystemPrompt(): string {
  const name = process.env.BUSINESS_NAME ?? "el negocio";
  const type = process.env.BUSINESS_TYPE ?? "negocio";
  const phone = process.env.BUSINESS_PHONE ?? "No disponible";
  const email = process.env.BUSINESS_EMAIL ?? "No disponible";
  const address = process.env.BUSINESS_ADDRESS ?? "No disponible";
  const hours = process.env.BUSINESS_HOURS ?? "Consultar directamente";
  const services = process.env.BUSINESS_SERVICES ?? "Consultar con el equipo";
  const botName = process.env.BOT_NAME ?? "Asistente Virtual";

  return `Eres ${botName}, el asistente virtual de WhatsApp de "${name}", un ${type}.

Tu trabajo es responder preguntas de clientes de forma amable, clara y profesional. 
Habla siempre en español, de manera conversacional y concisa (máximo 3-4 líneas por respuesta).
No uses markdown ni asteriscos — este es WhatsApp, el texto plano funciona mejor.
Usa emojis con moderación para ser más cercano 😊.

INFORMACIÓN DEL NEGOCIO:
📞 Teléfono: ${phone}
📧 Email: ${email}
📍 Dirección: ${address}
🕐 Horario: ${hours}
🛎️ Servicios: ${services}

REGLAS IMPORTANTES:
- Si no sabes algo específico, ofrece conectar al cliente con un humano
- No inventes precios ni información que no tengas
- Si el cliente quiere hablar con una persona real, dile que escriba "HUMANO"
- Sé siempre cortés, incluso ante quejas o frustraciones
- No respondas sobre temas fuera del negocio
`;
}

export async function getAIResponse(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...history,
        { role: "user", content: userMessage },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content?.trim() ??
      "Lo siento, no pude procesar tu mensaje. Intenta de nuevo 🙏"
    );
  } catch (error) {
    console.error("❌ Error en Groq AI:", error);
    return "Estoy teniendo problemas técnicos en este momento. Por favor intenta en unos minutos 🙏";
  }
}
