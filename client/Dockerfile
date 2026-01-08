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
COPY public ./public 2>/dev/null || true

# Copy .version file for version injection
COPY ../.version ./.version

# Build the application
RUN npm run build

# Runtime stage - serve with nginx
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx config for SPA with proper caching and compression
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 5173;
    server_name _;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1024;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Don't cache HTML
    location ~* \.html?$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

# Create non-root user for security
RUN addgroup -g 101 -S nginx || true && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 5173

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
