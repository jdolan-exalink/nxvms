# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install FFmpeg and dumb-init for proper signal handling
# Also install curl for healthcheck
RUN apk add --no-cache ffmpeg dumb-init curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps && \
    npm install pg --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create storage directory with proper permissions
RUN mkdir -p /mnt/nxvms/storage/{chunks,hls,exports} && \
    chmod -R 755 /mnt/nxvms/storage

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app /mnt/nxvms/storage

USER nodejs

# Expose port
EXPOSE 3000

# Health check - with start period to allow initialization
HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=60s \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
