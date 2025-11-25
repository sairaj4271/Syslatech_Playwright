pipeline {
    agent any

    environment {
        // Use pre-installed NodeJS
        PATH = "C:/Program Files/nodejs/;${env.PATH}"

        // Enable CI mode inside Playwright
        CI = "true"

        // Playwright browser binaries
        PLAYWRIGHT_BROWSERS_PATH = "0"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 40, unit: 'MINUTES')
    }

    stages {

        stage('🔄 Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/sairaj4271/Syslatech_Playwright.git'
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('🌐 Install Playwright Browsers') {
            steps {
                bat 'npx playwright install --with-deps'
            }
        }

        stage('🧪 Run Tests (Parallel Execution)') {
            steps {
                bat 'npx playwright test --workers=2 --retries=1'
            }
        }

        stage('📊 Generate Allure Report') {
            steps {
                script {
                    bat 'allure generate allure-results --clean -o allure-report || true'
                }
            }
        }

        stage('📁 Archive Reports') {
            steps {
                junit 'reports/results.xml'
                archiveArtifacts artifacts: 'allure-results/**', fingerprint: true
                archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true
            }
        }

        stage('📤 Publish Allure Report to Jenkins') {
            steps {
                allure includeProperties: false,
                       jdk: '',
                       results: [[path: 'allure-results']]
            }
        }
    }

    post {

        success {
            echo "🎉 TESTS PASSED — GREAT JOB!"
            slackSend channel: '#automation',
                      message: "✅ *SUCCESS*: Playwright tests passed on Jenkins.",
                      color: "good"
        }

        failure {
            echo "❌ TESTS FAILED — CHECK REPORTS"
            slackSend channel: '#automation',
                      message: "❌ *FAILURE*: Playwright tests failed. See Jenkins reports.",
                      color: "danger"
        }

        always {
            echo "🧹 Cleaning Workspace..."
            cleanWs()
        }
    }
}
