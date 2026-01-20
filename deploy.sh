#!/bin/bash

# DroneAgri Shop Deployment Script
# Usage: ./deploy.sh [user@host] [remote_path]

set -e

# Configuration - Update these values
SSH_HOST="${1:-user@your-server.com}"
REMOTE_PATH="${2:-/var/www/shop.droneagri.pl}"
APP_NAME="shop-droneagri"

echo "🚀 Starting deployment to $SSH_HOST:$REMOTE_PATH"

# Step 1: Build the application
echo "📦 Building production version..."
npm run build

# Step 2: Create deployment package
echo "📁 Creating deployment package..."
tar -czf deploy.tar.gz \
  .next \
  public \
  package.json \
  package-lock.json \
  next.config.ts \
  .env.production \
  --exclude='.next/cache'

# Step 3: Upload to server
echo "⬆️ Uploading to server..."
scp deploy.tar.gz "$SSH_HOST:$REMOTE_PATH/"

# Step 4: Deploy on server
echo "🔧 Deploying on server..."
ssh "$SSH_HOST" << EOF
  cd $REMOTE_PATH

  # Backup current deployment
  if [ -d ".next" ]; then
    echo "Backing up current deployment..."
    mv .next .next.backup 2>/dev/null || true
  fi

  # Extract new deployment
  echo "Extracting new deployment..."
  tar -xzf deploy.tar.gz
  rm deploy.tar.gz

  # Install production dependencies
  echo "Installing dependencies..."
  npm ci --production

  # Restart application with PM2
  echo "Restarting application..."
  pm2 restart $APP_NAME 2>/dev/null || pm2 start npm --name "$APP_NAME" -- start

  # Remove backup if successful
  rm -rf .next.backup 2>/dev/null || true

  echo "✅ Deployment completed!"
EOF

# Cleanup local files
rm deploy.tar.gz

echo "✅ Deployment finished successfully!"
echo "🌐 Site should be available at: https://shop.droneagri.pl"
