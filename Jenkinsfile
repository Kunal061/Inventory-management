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

