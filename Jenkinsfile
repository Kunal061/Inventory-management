pipeline {
    agent {label 'pop'}
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Kunal061/Inventory-management.git'
            }
        }
        
        stage('Setup Node.js and Install Dependencies') {
            steps {
                script {
                    sh '''
                        # Check if Node.js is installed
                        if ! command -v node &> /dev/null; then
                            echo "Node.js not found, installing..."
                            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                            sudo apt-get install -y nodejs
                        else
                            echo "Node.js already installed: $(node --version)"
                        fi
                        
                        # Check if npm is installed
                        if ! command -v npm &> /dev/null; then
                            echo "npm not found, installing..."
                            sudo apt-get install -y npm
                        else
                            echo "npm already installed: $(npm --version)"
                        fi
                        
                        # Clean install dependencies
                        npm ci
                    '''
                }
            }
        }
        
        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
            post {
                success {
                    echo '✅ Build successful!'
                }
                failure {
                    echo '❌ Build failed!'
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                script {
                    sh '''
                        # Create deployment directory if it doesn\'t exist
                        sudo mkdir -p /var/www/laxmi-app
                        
                        # Backup existing deployment
                        if [ -d "/var/www/laxmi-app/dist" ]; then
                            sudo rm -rf /var/www/laxmi-app/dist_bak
                            sudo mv /var/www/laxmi-app/dist /var/www/laxmi-app/dist_bak
                        fi
                        
                        # Copy new build to web directory
                        sudo cp -r dist /var/www/laxmi-app/
                        
                        # Set proper ownership and permissions
                        sudo chown -R www-data:www-data /var/www/laxmi-app/dist
                        sudo chmod -R 755 /var/www/laxmi-app/dist
                        
                        # Update Nginx configuration to use port 5200
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
        try_files \\$uri \\$uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)\\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF'
                        
                        # Enable site (create symlink if it doesn\'t exist)
                        sudo ln -sf /etc/nginx/sites-available/laxmi-app /etc/nginx/sites-enabled/
                        
                        # Remove default site if it exists
                        sudo rm -f /etc/nginx/sites-enabled/default
                        
                        # Test Nginx configuration
                        sudo nginx -t
                        
                        # Reload Nginx to apply changes
                        sudo systemctl reload nginx
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    def healthCheck = sh(
                        script: 'curl -f http://localhost:5200 > /dev/null 2>&1 && echo "SUCCESS" || echo "FAILED"',
                        returnStdout: true
                    ).trim()
                    
                    if (healthCheck == "SUCCESS") {
                        echo "✅ Health check passed - Application is running on port 5200!"
                    } else {
                        error "❌ Health check failed - Application is not responding on port 5200"
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                def BUILD_URL = env.BUILD_URL ?: 'Unknown'
                def JOB_NAME = env.JOB_NAME ?: 'Unknown'
                
                echo """
                🎉 Deployment Pipeline Completed!
                
                Job Name: ${JOB_NAME}
                Build URL: ${BUILD_URL}
                
                🔧 Application Details:
                - Deployed to: /var/www/laxmi-app/dist
                - Served by: Nginx
                - Access URL: http://YOUR_EC2_PUBLIC_IP:5200
                
                📋 Next Steps:
                1. Visit http://YOUR_EC2_PUBLIC_IP:5200 to see your application
                2. Check Nginx logs if you encounter issues: sudo tail -f /var/log/nginx/error.log
                """
            }
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
            
            // Attempt rollback
            script {
                sh '''
                    if [ -d "/var/www/laxmi-app/dist_bak" ]; then
                        echo "🔄 Rolling back to previous version..."
                        sudo rm -rf /var/www/laxmi-app/dist
                        sudo mv /var/www/laxmi-app/dist_bak /var/www/laxmi-app/dist
                        sudo systemctl reload nginx
                        echo "✅ Rollback completed"
                    else
                        echo "⚠️ No backup found for rollback"
                    fi
                '''
            }
        }
    }
}