# ---------------------------------
# ETAPA 1: Compilación (Builder)
# ---------------------------------
FROM oven/bun:latest AS builder

WORKDIR /usr/src/app

# Copiamos archivos de dependencias
COPY package.json bun.lockb* ./

# Instalamos dependencias
RUN bun install

# Copiamos el código fuente
COPY . .

# Compilamos la aplicación (genera la carpeta dist)
RUN bun run build

# ---------------------------------
# ETAPA 2: Producción (Final)
# ---------------------------------
FROM oven/bun:latest AS production

WORKDIR /usr/src/app

# Copiamos dependencias para instalar solo las de producción
COPY package.json bun.lockb* ./

# Instalamos solo dependencias de producción para una imagen ligera
RUN bun install --production

# Copiamos el build desde la etapa anterior
COPY --from=builder /usr/src/app/dist ./dist

# Exponemos el puerto 3000 (o el que uses en analytics)
EXPOSE 3000

# Comando de inicio
CMD ["bun", "dist/main.js"]
