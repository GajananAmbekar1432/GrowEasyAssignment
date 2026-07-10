# Frontend Dockerfile
FROM node:18-slim
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --omit=dev
COPY frontend/ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
