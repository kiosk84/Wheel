# Monorepo root Dockerfile to build backend at hooks/functions
FROM node:18-alpine
WORKDIR /app/hooks/functions
COPY hooks/functions/package.json hooks/functions/package-lock.json ./
RUN npm install --production
COPY hooks/functions .
EXPOSE 8080
CMD ["npm", "start"]
