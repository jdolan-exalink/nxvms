#!/bin/sh
# Startup script for NXvms Server
# Runs database initialization and then starts the application

set -e

echo "🚀 Starting NXvms Server..."
echo "📍 Node version: $(node --version)"
echo "📍 NPM version: $(npm --version)"

# Check if we should run seeding
# This only runs once - on first startup, or if FORCE_SEED is set
if [ ! -f /app/.seed-completed ] || [ "$FORCE_SEED" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed || echo "⚠️  Seeding failed or already seeded"
  touch /app/.seed-completed
else
  echo "⏭️  Database already seeded, skipping..."
fi

echo "✅ Database initialization complete"
echo "🎯 Starting NestJS application..."

# Start the application
exec node dist/main.js
