# Base image สำหรับทั้ง frontend และ backend
FROM node:18-alpine AS base

# Stage 1: Build frontend
FROM base AS frontend-builder
WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/web ./apps/web

# Build frontend
WORKDIR /app/apps/web
RUN npm run build

# Stage 2: Build backend
FROM base AS backend-builder
WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy Prisma schema and generate client
COPY apps/api/prisma ./apps/api/prisma
WORKDIR /app/apps/api

RUN npm install multer
RUN npx prisma generate

# Copy backend source code
COPY apps/api ./apps/api

# Stage 3: Production image
FROM base AS production
WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy built frontend
COPY --from=frontend-builder /app/apps/web/.next /app/apps/web/.next
COPY --from=frontend-builder /app/apps/web/public /app/apps/web/public
COPY --from=frontend-builder /app/apps/web/package.json /app/apps/web/package.json
COPY --from=frontend-builder /app/apps/web/next.config.mjs /app/apps/web/next.config.mjs
COPY --from=frontend-builder /app/node_modules /app/node_modules

# Copy backend
COPY --from=backend-builder /app/apps/api /app/apps/api
COPY --from=backend-builder /app/node_modules /app/node_modules

# Create PM2 configuration
COPY ecosystem.config.js ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT_FRONTEND=3000
ENV PORT_BACKEND=5000
ENV DATABASE_URL=postgresql://myuser:mypassword@myhostserver.sytes.net:5432/mydb?schema=public

# Expose ports
EXPOSE 3000 5000

# Start both frontend and backend using PM2
CMD ["pm2-runtime", "ecosystem.config.js"]

