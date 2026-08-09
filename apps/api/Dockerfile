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

# Copy package config and install production dependencies + prisma CLI for entrypoint migrations
COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma@6.3.0 --no-save

# Copy compiled code and generated Prisma assets from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /usr/src/app/prisma ./prisma

# Create a non-root user for security
RUN addgroup -S ayurpass && adduser -S ayurpass -G ayurpass
RUN mkdir -p uploads && chown ayurpass:ayurpass uploads

# Expose NestJS port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start application via entrypoint script
COPY scripts/entrypoint.sh ./scripts/entrypoint.sh
RUN chmod +x ./scripts/entrypoint.sh

# Docker healthcheck — ALB and ECS also run their own, but this catches
# container-level issues immediately.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

USER ayurpass

ENTRYPOINT ["./scripts/entrypoint.sh"]
