# 🚀 Deployment Guide - Laxmi Stationary App

Complete guide to deploy the application on AWS EC2 with optional Jenkins CI/CD.

## 📋 Prerequisites

- AWS Account with EC2 access
- Basic knowledge of Linux commands
- Domain name (optional but recommended)
- SSH access to EC2 instance

## 🏗️ Architecture Overview

```
Internet → Nginx (Port 5200) → Vite Build (Static Files) → Browser
```

## 📦 Option 1: Manual Deployment (Quick Start)

### Step 1: Launch EC2 Instance

1. **Go to AWS EC2 Console**
2. **Launch Instance** with these settings:
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance Type**: t2.micro (free tier) or t3.small
   - **Key Pair**: Create/download a new key pair
   - **Security Group**: 
     - Custom TCP (Port 5200) from `0.0.0.0/0`
     - HTTPS (Port 443) from `0.0.0.0/0` (if using SSL)
     - SSH (Port 22) from your IP
   - **Storage**: 20 GB minimum

3. **Launch Instance** and wait for it to be running

### Step 2: Connect to EC2 Instance

```bash
# Replace with your key path and EC2 IP
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP_ADDRESS
```

### Step 3: Install Node.js and Nginx

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Verify installations
node --version
npm --version
nginx -v
```

### Step 4: Clone and Build Application

```bash
# Navigate to web directory
cd /var/www

# Clone your repository (replace with your Git URL)
sudo git clone https://github.com/YOUR_USERNAME/laxmi-app.git
cd laxmi-app

# Install dependencies
sudo npm install

# Build for production
sudo npm run build

# The build will create a 'dist' folder with optimized files
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/laxmi-app
```

Add this configuration:

```nginx
server {
    listen 5200;
    server_name YOUR_DOMAIN_OR_IP;
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

    # Handle React Router (for any future routes)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/laxmi-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### Step 6: Set Permissions

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/laxmi-app

# Set proper permissions
sudo chmod -R 755 /var/www/laxmi-app
```

### Step 7: Test Your Application

Open your browser and visit:
```
http://YOUR_EC2_IP_ADDRESS:5200
```

You should see the Laxmi Stationary app!

---

## 🤖 Option 2: Jenkins CI/CD Deployment (Advanced)

### Why Jenkins?
- **Automated Deployment**: Push to GitHub → Auto deploy
- **Build History**: Track all deployments
- **Rollback**: Easy to revert changes
- **Testing**: Run tests before deployment

### Step 1: Install Jenkins on EC2

```bash
# Update system
sudo apt update

# Install Java (Jenkins requirement)
sudo apt install -y default-jdk

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins
```

### Step 2: Setup Jenkins

1. **Get Initial Admin Password**
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

2. **Access Jenkins in Browser**
   ```
   http://YOUR_EC2_IP_ADDRESS:8080
   ```

3. **Install Suggested Plugins**
   - NodeJS Plugin
   - Publish Over SSH Plugin
   - Git Plugin

4. **Create Admin User**
   - Username: admin
   - Password: secure_password
   - Full name: Jenkins Admin
   - Email: your_email@example.com

### Step 3: Configure Jenkins Tools

1. **Manage Jenkins** → **Global Tool Configuration**
2. **Add NodeJS**:
   - Name: `node-20`
   - Version: `NodeJS 20.x`

### Step 4: Create Jenkins Pipeline

1. **New Item** → **Pipeline**
2. **Name**: `laxmi-app-deploy`
3. **Pipeline**:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/YOUR_USERNAME/laxmi-app.git`
   - Script Path: `Jenkinsfile`

### Step 5: Run Pipeline

1. **Build Now**
2. **Watch Console Output**
3. **Verify Deployment**

Your app will be available at:
```
http://YOUR_EC2_IP_ADDRESS:5200
```

---

## 🔧 Maintenance Commands

### Update Application
```bash
cd /var/www/laxmi-app
sudo git pull
sudo npm install
sudo npm run build
sudo systemctl reload nginx
```

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

---

## 🔒 Security Considerations

### Firewall (UFW)
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP
sudo ufw allow 5200

# Check status
sudo ufw status
```

### SSL/HTTPS (Optional)
Consider using Let's Encrypt for free SSL certificates:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🆘 Troubleshooting

### App Not Loading
1. Check Nginx status: `sudo systemctl status nginx`
2. Test config: `sudo nginx -t`
3. Check logs: `sudo tail -f /var/log/nginx/error.log`

### Permission Issues
1. Verify ownership: `ls -la /var/www/laxmi-app`
2. Fix permissions: `sudo chown -R www-data:www-data /var/www/laxmi-app`

### Jenkins Not Starting
1. Check status: `sudo systemctl status jenkins`
2. View logs: `sudo journalctl -u jenkins`

---

## 📈 Monitoring

### Basic Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

### Log Monitoring
```bash
# Monitor Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Monitor Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🗑️ Uninstall

If you need to remove the application:

```bash
# Stop Nginx
sudo systemctl stop nginx

# Remove application files
sudo rm -rf /var/www/laxmi-app

# Remove Nginx config
sudo rm /etc/nginx/sites-available/laxmi-app
sudo rm /etc/nginx/sites-enabled/laxmi-app

# Restart Nginx
sudo systemctl restart nginx
```

---

**🎉 Deployment Complete! Your Laxmi Stationary app is now running on port 5200!**