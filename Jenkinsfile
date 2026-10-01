pipeline {
    agent any

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
                bat 'docker build -t vit-foodhub:jenkins-%BUILD_NUMBER% .'
            }
        }
    }
}
