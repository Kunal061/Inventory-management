# 🚀 Deployment Guide - Laxmi Stationary App

Complete guide to deploy the application on AWS EC2 with optional Jenkins CI/CD.

## 📋 Prerequisites

- AWS Account with EC2 access
- Basic knowledge of Linux commands
- Domain name (optional but recommended)
- SSH access to EC2 instance

## 🏗️ Architecture Overview

```
Internet → Nginx (Port 80/443) → Vite Build (Static Files) → Browser
```

## 📦 Option 1: Manual Deployment (Quick Start)

### Step 1: Launch EC2 Instance

1. **Go to AWS EC2 Console**
2. **Launch Instance** with these settings:
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance Type**: t2.micro (free tier) or t3.small
   - **Key Pair**: Create/download a new key pair
   - **Security Group**: 
     - HTTP (Port 80) from `0.0.0.0/0`
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
    listen 80;
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
http://YOUR_EC2_IP_ADDRESS
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

1. **Access Jenkins**:
   ```
   http://YOUR_EC2_IP:8080
   ```

2. **Get Initial Password**:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

3. **Install Suggested Plugins**

4. **Create Admin User**

### Step 3: Install Jenkins Plugins

Go to **Manage Jenkins** → **Manage Plugins** → **Available** tab and install:

- ✅ **Git plugin** (usually pre-installed)
- ✅ **NodeJS plugin** (for Node.js builds)
- ✅ **Publish Over SSH** (for deployment)

### Step 4: Configure Node.js in Jenkins

1. **Manage Jenkins** → **Global Tool Configuration**
2. **NodeJS installations**:
   - Name: `Node.js 20`
   - Version: `20.x.x` (auto-install)
3. **Save**

### Step 5: Create SSH Key for Jenkins

```bash
# Generate SSH key as jenkins user
sudo -u jenkins ssh-keygen -t rsa -b 4096 -C "jenkins@laxmi-app"

# Add public key to authorized_keys
sudo cat /var/lib/jenkins/.ssh/id_rsa.pub | sudo tee -a ~/.ssh/authorized_keys

# Set proper permissions
sudo chmod 700 ~/.ssh
sudo chmod 600 ~/.ssh/authorized_keys
```

### Step 6: Configure Publish Over SSH Plugin

1. **Manage Jenkins** → **Configure System**
2. **Publish over SSH** section:
   - **SSH Server**:
     - Name: `EC2 Localhost`
     - Hostname: `localhost`
     - Username: `ubuntu`
     - Remote directory: `/var/www`
   - **Use SSH Key**: Select the key path `/var/lib/jenkins/.ssh/id_rsa`
3. **Test Connection** → Should show "Success"
4. **Save**

### Step 7: Create Jenkins Pipeline Job

1. **New Item** → **Pipeline** → Name: `laxmi-app-deploy`
2. Configure the pipeline:

#### Pipeline Configuration (Jenkinsfile)

Create a file named `Jenkinsfile` in your project root:

```groovy
pipeline {
    agent any
    
    environment {
        APP_DIR = '/var/www/laxmi-app'
        NODE_VERSION = '20.x'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out code from Git...'
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                echo '📦 Installing dependencies and building...'
                sh '''
                    npm install
                    npm run build
                '''
            }
        }
        
        stage('Archive Build') {
            steps {
                echo '📁 Archiving build artifacts...'
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Deploying to EC2...'
                sshPublisher(
                    publishers: [
                        sshPublisherDesc(
                            configName: 'EC2 Localhost',
                            transfers: [
                                sshTransfer(
                                    sourceFiles: 'dist/**',
                                    removePrefix: 'dist',
                                    remoteDirectory: 'laxmi-app',
                                    execCommand: """
                                        cd ${APP_DIR}
                                        sudo rm -rf dist_bak
                                        sudo mv dist dist_bak || true
                                        sudo mv /var/www/laxmi-app/dist dist
                                        sudo chown -R www-data:www-data dist
                                        sudo chmod -R 755 dist
                                        sudo systemctl reload nginx
                                        echo '✅ Deployment complete!'
                                    """
                                )
                            ]
                        )
                    ]
                )
            }
        }
        
        stage('Verify') {
            steps {
                echo '✅ Verifying deployment...'
                sh 'curl -f http://localhost || exit 1'
            }
        }
    }
    
    post {
        success {
            echo '🎉 Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
        always {
            cleanWs()
        }
    }
}
```

3. In Jenkins job configuration:
   - **Build Triggers**: 
     - ✅ **GitHub hook trigger for GITScm polling**
   - **Pipeline**: 
     - Definition: **Pipeline script from SCM**
     - SCM: **Git**
     - Repository URL: Your GitHub repo
     - Credentials: Add your GitHub credentials
     - Branch: `*/main` or `*/master`
     - Script Path: `Jenkinsfile`

### Step 8: Setup GitHub Webhook

1. Go to your GitHub repository
2. **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - Payload URL: `http://YOUR_EC2_IP:8080/github-webhook/`
   - Content type: `application/json`
   - Events: **Just the push event**
4. **Add webhook**

### Step 9: Update Jenkins Security Group

Add to EC2 Security Group:
- **Custom TCP** (Port 8080) from your IP or `0.0.0.0/0`

### Step 10: First Deployment

1. In Jenkins, click **"Build Now"**
2. Watch the pipeline execute
3. Check your app at `http://YOUR_EC2_IP`

---

## 🔒 Option 3: SSL/HTTPS Setup (Recommended)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (certbot sets this up automatically)
sudo certbot renew --dry-run
```

Update your domain's A record to point to EC2 IP address.

---

## 🔄 Updating the Application

### Manual Update

```bash
cd /var/www/laxmi-app
sudo git pull
sudo npm install
sudo npm run build
sudo systemctl reload nginx
```

### Automated Update (Jenkins)

Just push to GitHub! Jenkins will automatically:
1. Pull latest code
2. Install dependencies
3. Build the app
4. Deploy to EC2
5. Reload Nginx

---

## 🛠️ Troubleshooting

### App Not Loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx configuration
sudo nginx -t
```

### Build Fails

```bash
# Clear npm cache
sudo npm cache clean --force

# Remove node_modules and reinstall
sudo rm -rf node_modules package-lock.json
sudo npm install
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/laxmi-app
sudo chmod -R 755 /var/www/laxmi-app
```

### Jenkins Not Starting

```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Restart Jenkins
sudo systemctl restart jenkins
```

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if Jenkins is running
sudo systemctl status jenkins

# Check disk space
df -h

# Check memory usage
free -h
```

### Regular Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Clean old builds (if using Jenkins)
# Go to Jenkins → Manage Jenkins → Tools and Actions → Clean Old Builds
```

---

## 📈 Optional Enhancements

### 1. Setup CloudWatch Monitoring

Monitor CPU, memory, and network usage in AWS Console.

### 2. Setup Auto-Scaling

Configure EC2 Auto Scaling for high availability.

### 3. Use CloudFront CDN

Distribute static assets globally for faster loading.

### 4. Database Backup

If adding a database later, setup automated backups.

---

## 🎯 Quick Deployment Checklist

### EC2 Setup
- [ ] Launch EC2 instance
- [ ] Configure security group
- [ ] Install Node.js and Nginx
- [ ] Clone repository
- [ ] Build application
- [ ] Configure Nginx
- [ ] Test deployment

### Jenkins Setup (Optional)
- [ ] Install Jenkins
- [ ] Install required plugins
- [ ] Configure SSH keys
- [ ] Create pipeline job
- [ ] Setup GitHub webhook
- [ ] Test automated deployment

### SSL Setup (Optional)
- [ ] Point domain to EC2 IP
- [ ] Install Certbot
- [ ] Get SSL certificate
- [ ] Configure Nginx for HTTPS

---

## 📞 Support

- **Nginx Docs**: https://nginx.org/en/docs/
- **Jenkins Docs**: https://www.jenkins.io/doc/
- **AWS EC2 Docs**: https://docs.aws.amazon.com/ec2/

---

**🎉 Congratulations! Your Laxmi Stationary app is now deployed and accessible worldwide!**

