pipeline {
    agent { label 'pop' }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Kunal061/Inventory-management.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Setup Server and Deploy') {
            steps {
                script {
                    sh '''
                        echo "=== Starting Server Setup ==="
                        
                        # Update package list
                        echo "Updating package list..."
                        sudo apt update
                        
                        # Install Nginx if not installed
                        if ! command -v nginx &> /dev/null; then
                            echo "Installing Nginx..."
                            sudo apt install -y nginx
                        else
                            echo "Nginx already installed: $(nginx -v 2>&1)"
                        fi
                        
                        # Create deployment directory
                        echo "Creating deployment directory..."
                        sudo mkdir -p /var/www/laxmi-app
                        sudo chown -R www-data:www-data /var/www/laxmi-app
                        
                        # Remove old backup if exists
                        echo "Cleaning up old backup..."
                        sudo rm -rf /var/www/laxmi-app/dist_bak
                        
                        # Backup current deployment
                        if [ -d "/var/www/laxmi-app/dist" ]; then
                            echo "Backing up current deployment..."
                            sudo mv /var/www/laxmi-app/dist /var/www/laxmi-app/dist_bak
                        fi
                        
                        # Copy new build
                        echo "Deploying new build..."
                        sudo cp -r dist /var/www/laxmi-app/
                        
                        # Set permissions
                        echo "Setting permissions..."
                        sudo chown -R www-data:www-data /var/www/laxmi-app/dist
                        sudo chmod -R 755 /var/www/laxmi-app/dist
                        
                        # Configure Nginx for port 5200
                        echo "Configuring Nginx for port 5200..."
                        sudo bash -c 'cat > /etc/nginx/sites-available/laxmi-app << EOF
server {
    listen 5200;
    server_name _;
    root /var/www/laxmi-app/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF'
                        
                        # Enable the site
                        echo "Enabling site..."
                        sudo ln -sf /etc/nginx/sites-available/laxmi-app /etc/nginx/sites-enabled/
                        
                        # Remove default site
                        echo "Removing default site..."
                        sudo rm -f /etc/nginx/sites-enabled/default
                        
                        # Test Nginx configuration
                        echo "Testing Nginx configuration..."
                        if sudo nginx -t; then
                            echo "Nginx configuration test passed"
                        else
                            echo "Nginx configuration test failed"
                            exit 1
                        fi
                        
                        # Restart Nginx
                        echo "Restarting Nginx..."
                        sudo systemctl restart nginx
                        
                        # Enable Nginx to start on boot
                        echo "Enabling Nginx to start on boot..."
                        sudo systemctl enable nginx
                        
                        # Verify Nginx is running
                        if sudo systemctl is-active --quiet nginx; then
                            echo "Nginx is running"
                        else
                            echo "Starting Nginx..."
                            sudo systemctl start nginx
                        fi
                        
                        echo "=== Server Setup Complete ==="
                    '''
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    sh '''
                        echo "=== Verifying Deployment ==="
                        
                        # Wait a moment for Nginx to start
                        echo "Waiting for Nginx to start..."
                        sleep 5
                        
                        # Check if Nginx is running
                        if sudo systemctl is-active --quiet nginx; then
                            echo "✅ Nginx service is running"
                        else
                            echo "❌ Nginx service is not running"
                            sudo systemctl status nginx
                            exit 1
                        fi
                        
                        # Check if port 5200 is listening
                        echo "Checking if port 5200 is listening..."
                        if sudo netstat -tlnp | grep :5200; then
                            echo "✅ Port 5200 is listening"
                        else
                            echo "❌ Port 5200 is not listening"
                            echo "Current listening ports:"
                            sudo netstat -tlnp | grep :5200 || true
                        fi
                        
                        # Check Nginx configuration
                        echo "Checking Nginx configuration..."
                        sudo nginx -T | grep -A 10 "listen 5200" || echo "No server listening on 5200 found"
                        
                        # Check deployed files
                        echo "Checking deployed files..."
                        if [ -d "/var/www/laxmi-app/dist" ]; then
                            echo "✅ Deployment directory exists"
                            echo "Files in deployment directory:"
                            ls -la /var/www/laxmi-app/dist
                        else
                            echo "❌ Deployment directory does not exist"
                        fi
                        
                        # Local health check
                        echo "Performing local health check..."
                        if curl -f http://localhost:5200 > /dev/null 2>&1; then
                            echo "✅ Local health check passed"
                            echo "Response headers:"
                            curl -I http://localhost:5200 | head -5
                        else
                            echo "❌ Local health check failed"
                            echo "Attempting to get error details:"
                            curl -v http://localhost:5200 2>&1 | head -10 || true
                        fi
                        
                        echo "=== Verification Complete ==="
                    '''
                }
            }
        }
        
        stage('Create Diagnostic Script') {
            steps {
                script {
                    sh '''
                        # Create a simple diagnostic script on the server
                        sudo bash -c 'cat > /home/ubuntu/diagnose_app.sh << "EOF"
#!/bin/bash

echo "=== Application Diagnostic Script ==="
echo "Server IP: $(hostname -I)"
echo "Date: $(date)"
echo ""

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l
echo ""

echo "=== Listening Ports ==="
sudo netstat -tlnp | grep :5200 || echo "Port 5200 not found in listening ports"
echo ""

echo "=== Firewall Status ==="
if command -v ufw &> /dev/null; then
    echo "UFW Status:"
    sudo ufw status
else
    echo "UFW not installed"
fi
echo ""

echo "=== Security Groups Check ==="
echo "This needs to be verified in AWS Console"
echo ""

echo "=== Nginx Configuration ==="
sudo nginx -T 2>/dev/null | grep -A 20 "listen 5200" || echo "No server block found for port 5200"
echo ""

echo "=== Application Files ==="
if [ -d "/var/www/laxmi-app/dist" ]; then
    echo "Application directory exists:"
    ls -la /var/www/laxmi-app/dist
else
    echo "Application directory does not exist"
fi
echo ""

echo "=== Local Access Test ==="
if curl -f http://localhost:5200 > /dev/null 2>&1; then
    echo "Local access: SUCCESS"
    echo "Response code: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5200)"
else
    echo "Local access: FAILED"
    echo "Error: $(curl -f http://localhost:5200 2>&1)"
fi
echo ""

echo "=== End Diagnostic Script ==="
EOF'
                        
                        sudo chmod +x /home/ubuntu/diagnose_app.sh
                        echo "Diagnostic script created at /home/ubuntu/diagnose_app.sh"
                        echo "To run it manually, SSH to your server and execute: /home/ubuntu/diagnose_app.sh"
                    '''
                }
            }
        }
        
        stage('Final Status') {
            steps {
                script {
                    echo "✅ Deployment pipeline completed successfully!"
                    echo "Application should be accessible at: http://13.233.122.241:5200"
                    echo ""
                    echo "If you cannot access the application, please run the diagnostic script:"
                    echo "SSH to your server and run: /home/ubuntu/diagnose_app.sh"
                    echo ""
                    echo "Common issues and solutions:"
                    echo "1. Security Group: Ensure inbound rule for port 5200 from your IP"
                    echo "2. Firewall: Check if UFW is blocking the port"
                    echo "3. Nginx Config: Verify the server block is correct"
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Deployment successful!"
            echo "Application should be running at: http://13.233.122.241:5200"
            echo "If inaccessible, run: /home/ubuntu/diagnose_app.sh on the server"
        }
        failure {
            echo "❌ Deployment failed!"
            echo "Check the logs above for details."
            echo "Run diagnostic script: /home/ubuntu/diagnose_app.sh"
        }
    }
}