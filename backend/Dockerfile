# =============================================================================
# SUMA Backend — Dockerfile Multi-Stage para Cloud Run
# Optimizado para imágenes pequeñas y seguridad (usuario no-root).
# =============================================================================

# --- Etapa 1: Instalación de dependencias ---
FROM node:22-alpine AS dependencias
WORKDIR /app

# Habilitar pnpm via corepack (integrado en Node.js 22).
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar solo archivos de dependencias para aprovechar cache de Docker.
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# --- Etapa 2: Imagen final de producción ---
FROM node:22-alpine AS produccion
WORKDIR /app

# Crear usuario no-root por seguridad.
RUN addgroup -g 1001 -S nodejs && \
    adduser -S suma -u 1001 -G nodejs

# Copiar dependencias desde la etapa anterior.
COPY --from=dependencias --chown=suma:nodejs /app/node_modules ./node_modules

# Copiar código fuente.
COPY --chown=suma:nodejs package.json ./
COPY --chown=suma:nodejs src/ ./src/

# Cambiar a usuario no-root.
USER suma

# Puerto dinámico (Cloud Run inyecta $PORT).
EXPOSE 3001

# Health check para Cloud Run.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/health || exit 1

# Iniciar el servidor.
CMD ["node", "src/server.js"]
