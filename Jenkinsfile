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
                        # Update package list
                        sudo apt update
                        
                        # Install Nginx if not installed
                        if ! command -v nginx &> /dev/null; then
                            echo "Installing Nginx..."
                            sudo apt install -y nginx
                        else
                            echo "Nginx already installed"
                        fi
                        
                        # Create deployment directory
                        sudo mkdir -p /var/www/laxmi-app
                        
                        # Remove old backup if exists
                        sudo rm -rf /var/www/laxmi-app/dist_bak
                        
                        # Backup current deployment
                        if [ -d "/var/www/laxmi-app/dist" ]; then
                            sudo mv /var/www/laxmi-app/dist /var/www/laxmi-app/dist_bak
                        fi
                        
                        # Copy new build
                        sudo cp -r dist /var/www/laxmi-app/
                        
                        # Set permissions
                        sudo chown -R www-data:www-data /var/www/laxmi-app/dist
                        sudo chmod -R 755 /var/www/laxmi-app/dist
                        
                        # Configure Nginx for port 5200
                        sudo bash -c 'cat > /etc/nginx/sites-available/laxmi-app << EOF
server {
    listen 5200;
    server_name _;
    root /var/www/laxmi-app/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF'
                        
                        # Enable the site
                        sudo ln -sf /etc/nginx/sites-available/laxmi-app /etc/nginx/sites-enabled/
                        
                        # Remove default site
                        sudo rm -f /etc/nginx/sites-enabled/default
                        
                        # Test Nginx configuration
                        sudo nginx -t
                        
                        # Restart Nginx
                        sudo systemctl restart nginx
                        sudo systemctl enable nginx
                        
                        # Verify Nginx is running
                        if sudo systemctl is-active --quiet nginx; then
                            echo "Nginx is running"
                        else
                            echo "Starting Nginx..."
                            sudo systemctl start nginx
                        fi
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    // Wait a moment for Nginx to start
                    sh 'sleep 5'
                    
                    def healthCheck = sh(
                        script: 'curl -f http://localhost:5200 > /dev/null 2>&1 && echo "SUCCESS" || echo "FAILED"',
                        returnStdout: true
                    ).trim()
                    
                    if (healthCheck == "SUCCESS") {
                        echo "✅ Application is running on port 5200"
                    } else {
                        error "❌ Application failed health check on port 5200"
                    }
                }
            }
        }
        
        stage('Keep Application Running') {
            steps {
                script {
                    echo "✅ Deployment completed successfully!"
                    echo "Application is now running continuously on http://13.233.122.241:5200"
                    echo "Nginx service is set to start automatically on boot"
                    echo ""
                    echo "To stop the application, you need to:"
                    echo "1. Stop the Nginx service: sudo systemctl stop nginx"
                    echo "2. Or disable it from starting on boot: sudo systemctl disable nginx"
                    echo ""
                    echo "The application will remain active until manually stopped."
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Deployment successful!"
            echo "Application available at: http://13.233.122.241:5200"
            echo "The application is now running continuously and will restart automatically after server reboot."
        }
        failure {
            echo "❌ Deployment failed!"
            // Rollback on failure
            script {
                sh '''
                    if [ -d "/var/www/laxmi-app/dist_bak" ]; then
                        echo "🔄 Rolling back..."
                        sudo rm -rf /var/www/laxmi-app/dist
                        sudo mv /var/www/laxmi-app/dist_bak /var/www/laxmi-app/dist
                        
                        # Restart Nginx after rollback
                        if command -v nginx &> /dev/null; then
                            sudo systemctl restart nginx
                        fi
                        echo "✅ Rollback completed"
                    fi
                '''
            }
        }
    }
}