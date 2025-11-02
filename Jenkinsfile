pipeline {
    agent { label 'pop' }
    
    environment {
        APP_DIR = '/var/www/laxmi-app'
        NODE_VERSION = '20.x'
        EC2_USER = 'ubuntu'           // Update with your EC2 username
        EC2_HOST = '13.233.122.241' // Update with your EC2 instance IP or hostname
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
                echo "🚀 Deploying to EC2 at ${EC2_HOST}..."
                // Upload files and run remote commands via SSH
                sh """
                    scp -r dist/* ${EC2_USER}@${EC2_HOST}:${APP_DIR}/dist_tmp
                    ssh ${EC2_USER}@${EC2_HOST} << EOF
                        sudo mv ${APP_DIR}/dist ${APP_DIR}/dist_bak || true
                        sudo mv ${APP_DIR}/dist_tmp ${APP_DIR}/dist
                        sudo chown -R www-data:www-data ${APP_DIR}/dist
                        sudo chmod -R 755 ${APP_DIR}/dist
                        sudo systemctl reload nginx
                        echo '✅ Deployment complete!'
                    EOF
                """
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
            emailext subject: "✅ Deployment Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                     body: "The deployment was successful!\n\nJob: ${env.JOB_NAME}\nBuild: ${env.BUILD_NUMBER}\nView: ${env.BUILD_URL}",
                     to: "your-email@example.com"
        }
        failure {
            echo '❌ Deployment failed!'
            emailext subject: "❌ Deployment Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                     body: "The deployment failed!\n\nJob: ${env.JOB_NAME}\nBuild: ${env.BUILD_NUMBER}\nView: ${env.BUILD_URL}",
                     to: "your-email@example.com"
        }
        always {
            cleanWs()
        }
    }
}
