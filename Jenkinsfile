pipeline {
    agent any

    tools {
        nodejs "Node_18"
    }

    environment {
        CI = "true"
        PLAYWRIGHT_BROWSERS_PATH = "0"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/sairaj4271/Syslatech_Playwright.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                sh 'npx playwright test'
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh 'allure generate allure-results --clean -o allure-report || true'
            }
        }
    }

    post {
        always {
            junit 'reports/results.xml'
            archiveArtifacts artifacts: 'allure-results/**', allowEmptyArchive: true
        }
        success {
            echo "🎉 Test Execution Successful!"
        }
        failure {
            echo "❌ Test Execution Failed!"
        }
    }
}
