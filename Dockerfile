# =============================================================================
# Multi-stage Dockerfile for Node.js Application
# =============================================================================
# Stages:
#   1. base     - Common dependencies and setup
#   2. deps     - Install production dependencies
#   3. builder  - Build the application
#   4. runner   - Production runtime (minimal)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base image with common setup
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install security updates and common tools
RUN apk update && apk upgrade && \
    apk add --no-cache \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# -----------------------------------------------------------------------------
# Stage 2: Install dependencies
# -----------------------------------------------------------------------------
FROM base AS deps

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npm run prisma:generate

# -----------------------------------------------------------------------------
# Stage 3: Build the application
# -----------------------------------------------------------------------------
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies for smaller image
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 4: Production runner
# -----------------------------------------------------------------------------
FROM base AS runner

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "dist/main/server.js"]
