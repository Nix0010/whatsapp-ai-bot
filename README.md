<div align="center">

# 🤖 WhatsApp AI Bot

**Bot de WhatsApp con Inteligencia Artificial para atención al cliente**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

*Conecta cualquier negocio a WhatsApp con respuestas automáticas impulsadas por LLaMA 3.3*

</div>

---

## ¿Qué hace?

Un bot de WhatsApp completamente funcional que responde mensajes de clientes usando IA (Groq + LLaMA 3.3). Se configura en minutos para cualquier tipo de negocio: barberías, restaurantes, consultorios médicos, tiendas online, etc.

- 🧠 **Respuestas inteligentes** con contexto del negocio via Groq API (LLaMA 3.3 70B)
- 💬 **Memoria de conversación** — recuerda el historial de cada usuario (últimas 10 respuestas, 24h)
- ⚡ **Comandos rápidos** — `hola`, `ayuda`, `humano`, `reset`
- 🔄 **Reconexión automática** si se cae la conexión
- 🗄️ **Base de datos SQLite** para historial y registro de usuarios
- 📦 **Cero infraestructura** — corre en cualquier máquina con Node.js

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript |
| WhatsApp | Baileys (open source, sin costo) |
| IA | Groq API — LLaMA 3.3 70B Versatile |
| Base de datos | SQLite + Drizzle ORM |
| Configuración | dotenv |

---

## Instalación y Uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/Nix0010/whatsapp-ai-bot.git
cd whatsapp-ai-bot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el `.env` con los datos de tu negocio:

```env
# API Key de Groq (gratis en console.groq.com)
GROQ_API_KEY=tu_api_key_aqui

# Datos de tu negocio
BUSINESS_NAME=Barbería El Corte Perfecto
BUSINESS_TYPE=barbería
BUSINESS_HOURS=Lunes a Sábado 9am-7pm
BUSINESS_SERVICES=Corte de cabello, barba, afeitado clásico, cejas
BUSINESS_PHONE=+57 300 123 4567
BUSINESS_ADDRESS=Calle 45 #12-30, Bogotá
```

### 4. Iniciar el bot

```bash
npm run dev
```

Escanea el QR con WhatsApp → **Dispositivos vinculados → Vincular dispositivo**

¡Listo! El bot empezará a responder mensajes automáticamente.

---

## Comandos disponibles

| Comando | Respuesta |
|---|---|
| `hola` / `inicio` | Saludo de bienvenida |
| `ayuda` | Instrucciones de uso |
| `humano` | Notifica que quiere hablar con una persona |
| `reset` | Reinicia la conversación |

---

## Estructura del Proyecto

```
whatsapp-ai-bot/
├── src/
│   ├── index.ts              # Punto de entrada
│   ├── bot/
│   │   └── whatsapp.ts       # Conexión WhatsApp (Baileys)
│   ├── ai/
│   │   └── groq.ts           # Integración Groq AI
│   ├── handlers/
│   │   ├── messageHandler.ts # Lógica de mensajes
│   │   └── memory.ts         # Historial de conversaciones
│   └── db/
│       ├── index.ts          # Conexión SQLite
│       └── schema.ts         # Esquema Drizzle ORM
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Casos de Uso

- 🏪 **Tiendas** — consulta de productos, precios y disponibilidad
- 💈 **Barberías / Salones** — información de servicios y reservas
- 🏥 **Consultorios** — horarios de atención y citas
- 🍕 **Restaurantes** — menú, horarios y pedidos
- 🏢 **Empresas** — soporte de primer nivel antes de escalar a un humano

---

## Roadmap

- [ ] Panel web de administración
- [ ] Soporte para imágenes y documentos
- [ ] Sistema de citas integrado
- [ ] Deployment con Docker
- [ ] Multi-idioma

---

<div align="center">
  <sub>Desarrollado por <a href="https://github.com/Nix0010">Nix0010</a> · Node.js + TypeScript + Groq AI</sub>
</div>
