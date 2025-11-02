# ⚡ Quick Deploy Guide

Shortest path to get Laxmi Stationary app running on EC2.

## 🚀 Fast Track (15 minutes)

### 1. Launch EC2 Instance

AWS Console → Launch Ubuntu 22.04 → t2.micro → Configure security group:
- SSH (22) from your IP
- HTTP (80) from anywhere
- Custom TCP (8080) from anywhere (for Jenkins)

### 2. Connect & Setup

```bash
# Connect
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Run setup script
curl -o setup-ec2.sh https://raw.githubusercontent.com/YOUR_REPO/laxmi-app/main/deploy-scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### 3. Deploy App

```bash
# Clone your repo
cd /var/www
sudo git clone YOUR_GIT_REPO_URL laxmi-app
cd laxmi-app

# Install & build
sudo npm install
sudo npm run build

# Deploy
sudo bash deploy-scripts/deploy.sh

# Access your app
curl http://localhost
```

### 4. Setup Jenkins (Optional)

```bash
# Run Jenkins setup
cd /var/www/laxmi-app
sudo bash deploy-scripts/jenkins-setup.sh

# Get admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Visit: `http://YOUR_EC2_IP:8080`

---

## 📝 Manual Deployment

### On EC2:

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y nodejs nginx git

# 2. Clone repo
cd /var/www
sudo git clone YOUR_REPO laxmi-app

# 3. Build app
cd laxmi-app
sudo npm install
sudo npm run build

# 4. Configure Nginx
sudo cp deploy-scripts/nginx.conf /etc/nginx/sites-available/laxmi-app
sudo ln -s /etc/nginx/sites-available/laxmi-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 5. Set permissions
sudo chown -R www-data:www-data /var/www/laxmi-app
```

---

## 🔄 Update App

### Manual Update:
```bash
cd /var/www/laxmi-app
sudo git pull
sudo npm install
sudo npm run build
sudo bash deploy-scripts/deploy.sh
```

### With Jenkins:
Just push to GitHub! 🚀

---

## 🌐 Access Your App

- **App**: `http://YOUR_EC2_IP`
- **Jenkins**: `http://YOUR_EC2_IP:8080`

---

## 📞 Need Help?

See full guide in `DEPLOY.md` for:
- Detailed troubleshooting
- SSL/HTTPS setup
- Monitoring setup
- Advanced configurations

---

**That's it! Your app should be live now! 🎉**

