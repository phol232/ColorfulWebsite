FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5000

# Aquí está el cambio importante: especificar explícitamente el host y puerto
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5000"]