pipeline {
    agent {label 'pop'}
    
    tools {
        nodejs 'node-20'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
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
                        # Create deployment directory if it doesn't exist
                        sudo mkdir -p /var/www/laxmi-app
                        
                        # Backup existing deployment
                        if [ -d "/var/www/laxmi-app/dist" ]; then
                            sudo rm -rf /var/www/laxmi-app/dist_bak
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
                        script: 'curl -f http://localhost > /dev/null 2>&1 && echo "SUCCESS" || echo "FAILED"',
                        returnStdout: true
                    ).trim()
                    
                    if (healthCheck == "SUCCESS") {
                        echo "✅ Health check passed - Application is running!"
                    } else {
                        error "❌ Health check failed - Application is not responding"
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
                - Access URL: http://YOUR_EC2_PUBLIC_IP
                
                📋 Next Steps:
                1. Visit http://YOUR_EC2_PUBLIC_IP to see your application
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