import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidGroup,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import path from "path";
import { handleMessage } from "../handlers/messageHandler";

const AUTH_FOLDER = path.join(process.cwd(), "auth_info_baileys");

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: "silent" }); // Silenciar logs internos de Baileys

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
  });

  // ─── Manejo de credenciales ───────────────────────────────────────────────
  sock.ev.on("creds.update", saveCreds);

  // ─── Manejo de conexión ───────────────────────────────────────────────────
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.clear();
      console.log("\n🤖 WhatsApp AI Bot\n");
      console.log("📱 Escanea este QR con WhatsApp:\n");
      qrcode.generate(qr, { small: true });
      console.log("\n⏳ Esperando escaneo...\n");
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("🔄 Reconectando...");
        startBot();
      } else {
        console.log("🚪 Sesión cerrada. Borra la carpeta auth_info_baileys y reinicia.");
      }
    }

    if (connection === "open") {
      const botName = process.env.BOT_NAME ?? "Bot";
      const bizName = process.env.BUSINESS_NAME ?? "el negocio";
      console.clear();
      console.log(`\n✅ ${botName} conectado para ${bizName}`);
      console.log("📨 Escuchando mensajes...\n");
    }
  });

  // ─── Manejo de mensajes ───────────────────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      // Ignorar mensajes propios, grupos y broadcasts
      if (msg.key.fromMe) continue;
      if (!msg.key.remoteJid) continue;
      if (isJidGroup(msg.key.remoteJid)) continue;
      if (isJidBroadcast(msg.key.remoteJid)) continue;

      // Extraer texto del mensaje (texto normal o extendido)
      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;

      if (!text) continue;

      const jid = msg.key.remoteJid;
      const phoneNumber = jid.replace("@s.whatsapp.net", "");
      const pushName = msg.pushName ?? undefined;

      console.log(`📩 [${phoneNumber}] ${pushName ?? "Sin nombre"}: ${text}`);

      try {
        // Indicador de "escribiendo..."
        await sock.sendPresenceUpdate("composing", jid);

        // Procesar mensaje y obtener respuesta
        const response = await handleMessage(phoneNumber, pushName, text);

        // Enviar respuesta
        await sock.sendMessage(jid, { text: response });
        await sock.sendPresenceUpdate("paused", jid);

        console.log(`🤖 Respuesta enviada a [${phoneNumber}]`);
      } catch (error) {
        console.error(`❌ Error procesando mensaje de ${phoneNumber}:`, error);
      }
    }
  });

  return sock;
}
