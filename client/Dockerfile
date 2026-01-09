# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json tsconfig.main.json tsconfig.node.json ./
COPY vite.config.ts ./
COPY tailwind.config.js postcss.config.js ./
COPY index.html ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY src ./src
COPY main ./main
COPY preload ./preload

# Build the application
RUN npm run build

# Runtime stage - serve with nginx
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built application from builder
COPY --from=builder /app/dist/renderer /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create cache directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/run/nginx && \
    addgroup -g 101 -S nginx || true && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/run

EXPOSE 5173

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
