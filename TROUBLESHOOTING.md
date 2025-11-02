# Troubleshooting Application Access

If you're unable to access the application at `http://13.233.122.241:5200`, follow these steps:

## 1. Check Security Groups in AWS

Ensure your EC2 instance has a security group rule that allows inbound traffic on port 5200:
- Type: Custom TCP
- Port: 5200
- Source: Your IP address or 0.0.0.0/0 (less secure)

## 2. Run the Diagnostic Script

Upload and run the diagnostic script on your server:

```bash
# Upload the script to your server
scp diagnose_app.sh ubuntu@13.233.122.241:/home/ubuntu/

# SSH to your server
ssh ubuntu@13.233.122.241

# Make it executable and run it
chmod +x diagnose_app.sh
./diagnose_app.sh
```

## 3. Manual Checks

If you prefer to run the checks manually:

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if port 5200 is listening
sudo netstat -tlnp | grep :5200

# Check firewall status
sudo ufw status

# Test local access
curl http://localhost:5200

# Check Nginx configuration
sudo nginx -T | grep -A 10 "listen 5200"
```

## 4. Common Issues and Solutions

### Nginx Not Running
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Firewall Blocking Port
```bash
sudo ufw allow 5200
```

### Incorrect Nginx Configuration
Check the configuration file:
```bash
cat /etc/nginx/sites-available/laxmi-app
```

It should contain:
```nginx
server {
    listen 5200;
    server_name _;
    root /var/www/laxmi-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Application Files Missing
Re-deploy the application:
```bash
sudo mkdir -p /var/www/laxmi-app
sudo cp -r dist /var/www/laxmi-app/
sudo chown -R www-data:www-data /var/www/laxmi-app/dist
sudo systemctl restart nginx
```

## 5. Restart Services

If making changes, restart the services:
```bash
sudo systemctl restart nginx
```

## 6. Check Logs

View Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

View system logs:
```bash
sudo journalctl -u nginx
```