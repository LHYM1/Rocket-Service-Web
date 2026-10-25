# Etapa 1: Construcción de la aplicación React
FROM node:18-alpine AS builder
WORKDIR /app

# Copiamos los archivos de configuración de workspaces de la raíz y de los paquetes
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Instalamos todas las dependencias del monorepo desde la raíz (enlazando @rocket/shared)
RUN npm install

# Copiamos el código fuente de frontend y de shared
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Construimos el frontend (especificando el workspace del frontend)
RUN npm run build --workspace=frontend

# Etapa 2: Servir con Nginx
FROM nginx:alpine
COPY --from=builder /app/frontend/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]