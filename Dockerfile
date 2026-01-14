# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Clean any stale build artifacts and build fresh
RUN rm -rf .output .nitro .tanstack .vinxi && pnpm build

# Production stage
FROM node:22-alpine AS runner

# Install runtime dependencies for better-sqlite3 and health checks
RUN apk add --no-cache libstdc++ curl

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 dough

# Copy built application from builder
COPY --from=builder /app/.output ./.output

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R dough:nodejs /app/data

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DOUGH_DB_PATH=/app/data/dough.db

# Switch to non-root user
USER dough

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]
