# Build Stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package configuration
COPY package*.json ./

# Install all dependencies (including devDependencies for Nest CLI and Prisma)
RUN npm ci

# Copy database schema and generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and build NestJS application
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package config
COPY package*.json ./

# Copy compiled code and node_modules from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose NestJS port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start application via entrypoint script
COPY scripts/entrypoint.sh ./scripts/entrypoint.sh
RUN chmod +x ./scripts/entrypoint.sh

ENTRYPOINT ["./scripts/entrypoint.sh"]
