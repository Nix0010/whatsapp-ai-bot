import "dotenv/config";
import { initDb } from "./db";
import { startBot } from "./bot/whatsapp";

async function main() {
  console.log("\n🤖 Iniciando WhatsApp AI Bot...\n");

  // Validar variables de entorno requeridas
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ ERROR: GROQ_API_KEY no está definida en el .env");
    process.exit(1);
  }

  // Inicializar base de datos
  initDb();

  // Iniciar bot de WhatsApp
  await startBot();
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
