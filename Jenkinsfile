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
        
        stage('Deploy to EC2') {
            steps {
                script {
                    sh '''
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
                        
                        # Reload Nginx
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
                        echo "✅ Application is running on port 5200"
                    } else {
                        error "❌ Application failed health check on port 5200"
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Deployment successful!"
            echo "Application available at: http://13.233.122.241:5200"
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
                        sudo systemctl reload nginx
                        echo "✅ Rollback completed"
                    fi
                '''
            }
        }
    }
}