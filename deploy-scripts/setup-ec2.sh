#!/bin/bash

# Laxmi Stationary App - EC2 Setup Script
# This script sets up the environment on a fresh EC2 instance

set -e

echo "🚀 Starting EC2 Setup for Laxmi Stationary App..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# Install Node.js
echo -e "${BLUE}📦 Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
echo ""

# Install Nginx
echo -e "${BLUE}📦 Installing Nginx...${NC}"
sudo apt install -y nginx
echo -e "${GREEN}✅ Nginx installed: $(nginx -v 2>&1)${NC}"
echo ""

# Install Git
echo -e "${BLUE}📦 Installing Git...${NC}"
sudo apt install -y git
echo -e "${GREEN}✅ Git installed: $(git --version)${NC}"
echo ""

# Install build tools
echo -e "${BLUE}📦 Installing build tools...${NC}"
sudo apt install -y build-essential
echo -e "${GREEN}✅ Build tools installed${NC}"
echo ""

# Create web directory
echo -e "${BLUE}📁 Creating web directory...${NC}"
sudo mkdir -p /var/www
echo -e "${GREEN}✅ Web directory created${NC}"
echo ""

# Setup Nginx
echo -e "${BLUE}📋 Configuring Nginx for port 5200...${NC}"
sudo bash -c 'cat > /etc/nginx/sites-available/laxmi-app << EOF
server {
    listen 5200;
    server_name _;
    root /var/www/laxmi-app/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF'

# Enable site
sudo ln -sf /etc/nginx/sites-available/laxmi-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${BLUE}🔍 Testing Nginx configuration...${NC}"
sudo nginx -t

# Restart Nginx
echo -e "${BLUE}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx
echo -e "${GREEN}✅ Nginx configured and running on port 5200${NC}"
echo ""

echo -e "${GREEN}🎉 EC2 Setup Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Clone your repository: git clone YOUR_REPO_URL /var/www/laxmi-app"
echo "  2. Install dependencies: cd /var/www/laxmi-app && npm install"
echo "  3. Build application: npm run build"
echo "  4. Set permissions: sudo chown -R www-data:www-data /var/www/laxmi-app"
echo "  5. Reload Nginx: sudo systemctl reload nginx"
echo ""
echo "🌐 Your app will be available at: http://YOUR_EC2_IP:5200"
echo ""