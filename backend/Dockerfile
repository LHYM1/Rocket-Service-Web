FROM node:18-alpine

WORKDIR /app

# 1. Copiamos la carpeta shared al directorio contenedor padre (/shared)
COPY shared/ /shared/

# 2. Copiamos el package.json del backend
COPY backend/package*.json ./

# 3. Instalamos las dependencias
RUN npm install

# 4. Copiamos el resto del código del backend
COPY backend/ .

EXPOSE 4000

CMD ["npm", "start"]