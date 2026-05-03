FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para sqlite3 y compilar
RUN apk add --no-cache python3 make g++ 

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Imagen de producción
FROM node:22-alpine AS runner

WORKDIR /app

# Instalar herramientas para sqlite en producción
RUN apk add --no-cache sqlite

# Copiar archivos compilados y dependencias de producción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Variables de entorno por defecto
ENV NODE_ENV=production

CMD ["npm", "start"]
