pipeline {
    agent any

    environment {
        // NodeJS path
        PATH = "C:/Program Files/nodejs/;${env.PATH}"
        CI = "true"
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

        stage('🧪 Run Playwright Tests') {
            steps {
                bat 'npx playwright test --workers=2 --retries=2'
            }
        }

        stage('📊 Generate Allure Report') {
            steps {
                bat '''
                    if exist allure-report rmdir /s /q allure-report
                    allure generate allure-results --clean -o allure-report || exit 0
                '''
            }
        }

        stage('📁 Archive Reports') {
            steps {
                junit 'reports/results.xml'
                archiveArtifacts artifacts: 'allure-results/**', fingerprint: true
                archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true
                archiveArtifacts artifacts: 'allure-report/**', fingerprint: true
            }
        }

        stage('📤 Publish Allure Report') {
            steps {
                allure includeProperties: false,
                       jdk: '',
                       results: [[path: 'allure-results']]
            }
        }
    }

    post {

        // 🔁 This runs for BOTH success + failure
        always {
            echo "📦 Collecting Test Summary From JUnit XML..."

            script {
                def junitFile = "reports/results.xml"

                if (fileExists(junitFile)) {
                    def xml = new XmlSlurper().parse(junitFile)

                    def total  = xml.testsuite.@tests.toInteger()
                    def failed = xml.testsuite.@failures.toInteger()
                    def passed = total - failed

                    def failList = ""
                    xml.testsuite.testcase.each { tc ->
                        if (tc.failure.size() > 0) {
                            failList += "❌ ${tc.@name} — ${tc.failure.@message}\n"
                        }
                    }

                    env.TEST_TOTAL  = total.toString()
                    env.TEST_PASSED = passed.toString()
                    env.TEST_FAILED = failed.toString()
                    env.FAILED_LIST = failList
                } else {
                    echo "⚠️ JUnit report not found at ${junitFile}"
                    env.TEST_TOTAL  = "0"
                    env.TEST_PASSED = "0"
                    env.TEST_FAILED = "0"
                    env.FAILED_LIST = "No data"
                }
            }

            echo "🧹 Cleaning workspace..."
            cleanWs()
        }

        success {
            echo "🎉 TESTS PASSED — GREAT JOB!"

            mail to: 'sairaj@syslatech.com',
                subject: "Playwright CI - SUCCESS ✔ (${env.TEST_PASSED}/${env.TEST_TOTAL})",
                body: """
Hello Sai,

🎉 Your Playwright pipeline PASSED.

Test Summary:
------------------------------------
Total Tests: ${env.TEST_TOTAL}
Passed     : ${env.TEST_PASSED}
Failed     : ${env.TEST_FAILED}

Great job!
Check Jenkins Allure report if needed.

Regards,
Jenkins
"""
        }

        failure {
            echo "❌ TESTS FAILED — CHECK REPORTS"

            mail to: 'sairaj@syslatech.com',
                subject: "Playwright CI - FAILED ❌ (${env.TEST_FAILED} failed)",
                body: """
Hello Sai,

❌ Your Playwright pipeline FAILED.

Test Summary:
------------------------------------
Total Tests: ${env.TEST_TOTAL}
Passed     : ${env.TEST_PASSED}
Failed     : ${env.TEST_FAILED}

Failed Testcases:
------------------------------------
${env.FAILED_LIST}

Please check Allure & Playwright HTML reports for detailed errors.

Regards,
Jenkins
"""
        }
    }
}
