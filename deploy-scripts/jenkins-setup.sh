#!/bin/bash

# Laxmi Stationary App - Jenkins Setup Script
# This script sets up Jenkins on EC2 for CI/CD

set -e

echo "🤖 Starting Jenkins Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Install Java (Jenkins requirement)
echo -e "${BLUE}📦 Installing Java...${NC}"
sudo apt update
sudo apt install -y default-jdk
echo -e "${GREEN}✅ Java installed: $(java -version 2>&1 | head -1)${NC}"
echo ""

# Add Jenkins repository
echo -e "${BLUE}📦 Adding Jenkins repository...${NC}"
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
echo -e "${GREEN}✅ Jenkins repository added${NC}"
echo ""

# Install Jenkins
echo -e "${BLUE}📦 Installing Jenkins...${NC}"
sudo apt install -y jenkins
echo -e "${GREEN}✅ Jenkins installed${NC}"
echo ""

# Start and enable Jenkins
echo -e "${BLUE}🔄 Starting Jenkins...${NC}"
sudo systemctl start jenkins
sudo systemctl enable jenkins
echo -e "${GREEN}✅ Jenkins started and enabled${NC}"
echo ""

# Wait for Jenkins to start
echo -e "${BLUE}⏳ Waiting for Jenkins to start (30 seconds)...${NC}"
sleep 30

# Check Jenkins status
if sudo systemctl is-active --quiet jenkins; then
    echo -e "${GREEN}✅ Jenkins is running${NC}"
else
    echo -e "${RED}❌ Jenkins failed to start${NC}"
    sudo systemctl status jenkins
    exit 1
fi
echo ""

# Get initial admin password
PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || echo "Check manually")

echo -e "${GREEN}🎉 Jenkins Setup Complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Open your browser and go to:"
echo "   http://YOUR_EC2_IP:8080"
echo ""
echo "2. Get the initial admin password:"
echo "   ${PASSWORD}"
echo ""
echo "3. Install suggested plugins"
echo ""
echo "4. Create an admin user"
echo ""
echo "5. Configure Jenkins:"
echo "   - Install NodeJS plugin"
echo "   - Install Publish Over SSH plugin"
echo "   - Configure Node.js 20 in Global Tool Configuration"
echo "   - Setup SSH keys for deployment"
echo ""
echo "6. Create a pipeline job with the Jenkinsfile"
echo ""
echo "🔐 Don't forget to update your security group:"
echo "   - Add port 8080 for Jenkins access"
echo ""

