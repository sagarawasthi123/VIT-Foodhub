pipeline {
    agent any

    environment {
        DOCKERHUB_REPO = 'workproject12/vit-foodhub'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Test/Validate') {
            steps {
                bat 'npm run lint'
                bat 'npm run typecheck'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t %DOCKERHUB_REPO%:%IMAGE_TAG% .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    bat '''
                        docker login -u "%DOCKERHUB_USER%" --password-stdin <<< "%DOCKERHUB_TOKEN%"
                        docker push %DOCKERHUB_REPO%:%IMAGE_TAG%
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                bat '''
                    set IMAGE_TAG=%IMAGE_TAG%
                    docker compose pull foodhub
                    docker compose up -d --no-build foodhub
                '''
            }
        }

        stage('Application Health Check') {
            steps {
                bat '''
                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok = $false; for ($i=0; $i -lt 12; $i++) { try { $r = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { $ok = $true; break } } catch { Start-Sleep -Seconds 5 } }; if (-not $ok) { throw 'Application health check failed' }"
                '''
            }
        }
    }

    post {
        success {
            echo "CI/CD successful. Deployed image: ${DOCKERHUB_REPO}:${IMAGE_TAG}"
        }
        failure {
            echo 'CI/CD failed. Review the stage logs before retrying.'
        }
    }
}