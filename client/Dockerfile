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

# Build the application
RUN npm run build

# Runtime stage - serve with nginx
FROM nginx:alpine

# Copy nginx config
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx config for SPA
RUN echo 'server { \
    listen 5173; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
