# Etapa 1: Construcción de la aplicación React
FROM node:18-alpine AS builder
WORKDIR /app

# Copiamos archivos de workspaces y dependencias
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

RUN npm install

# Copiamos código fuente
COPY shared/ ./shared/
COPY frontend/ ./frontend/

RUN npm run build --workspace=frontend

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiamos el build de React
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Creamos una configuración personalizada de Nginx para React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]