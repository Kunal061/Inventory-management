#!/bin/bash

# Laxmi Stationary App - Deployment Script
# This script deploys the application to EC2

set -e

echo "🚀 Starting deployment..."
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from project root.${NC}"
    exit 1
fi

# Check if build exists
if [ -d "dist" ]; then
    echo -e "${BLUE}📦 Found existing build${NC}"
else
    echo -e "${RED}❌ Error: dist directory not found. Run 'npm run build' first.${NC}"
    exit 1
fi

APP_DIR="/var/www/laxmi-app"
BACKUP_DIR="${APP_DIR}/dist_bak"

# Create backup of current deployment
echo -e "${BLUE}💾 Creating backup of current deployment...${NC}"
sudo rm -rf "$BACKUP_DIR"
if [ -d "${APP_DIR}/dist" ]; then
    sudo mv "${APP_DIR}/dist" "$BACKUP_DIR"
    echo -e "${GREEN}✅ Backup created${NC}"
else
    echo -e "${BLUE}ℹ️  No previous deployment found (first time deployment)${NC}"
fi
echo ""

# Copy new build
echo -e "${BLUE}📤 Copying new build...${NC}"
sudo cp -r dist "$APP_DIR/"
echo -e "${GREEN}✅ Build copied${NC}"
echo ""

# Set permissions
echo -e "${BLUE}🔐 Setting permissions...${NC}"
sudo chown -R www-data:www-data "${APP_DIR}/dist"
sudo chmod -R 755 "${APP_DIR}/dist"
echo -e "${GREEN}✅ Permissions set${NC}"
echo ""

# Reload Nginx
echo -e "${BLUE}🔄 Reloading Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"
echo ""

# Health check
echo -e "${BLUE}🏥 Performing health check...${NC}"
if curl -f http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}⚠️  Health check failed, rolling back...${NC}"
    if [ -d "$BACKUP_DIR" ]; then
        sudo rm -rf "${APP_DIR}/dist"
        sudo mv "$BACKUP_DIR" "${APP_DIR}/dist"
        sudo systemctl reload nginx
        echo -e "${GREEN}✅ Rollback complete${NC}"
    fi
    exit 1
fi
echo ""

echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo "🌐 Your app is now live at: http://YOUR_EC2_IP"
echo ""

