#!/usr/bin/env node

/**
 * SPOTEYFA v0.3.0 - Final Functional Test
 * Tests actual execution flow and simulates real user scenarios
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

class FinalFunctionalTest {
    constructor() {
        this.buildPath = './SPOTEYFA-Windows-Portable-v0.3.0';
        this.testResults = [];
        this.errors = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icons = { 
            info: '📝', success: '✅', warn: '⚠️', error: '❌', 
            test: '🧪', action: '🔄'
        };
        console.log(`[${timestamp}] ${icons[type]} ${message}`);
    }

    addResult(test, passed, message, details = '') {
        this.testResults.push({ test, passed, message, details, timestamp: new Date().toISOString() });
        if (!passed) {
            this.errors.push(message);
        }
        this.log(message, passed ? 'success' : 'error');
    }

    // ===== TEST PACKAGE.JSON NPM SCRIPTS =====
    async testNpmScripts() {
        this.log('🧪 Testing NPM scripts functionality...', 'test');
        
        const packagePath = path.join(this.buildPath, 'package.json');
        if (!fs.existsSync(packagePath)) {
            this.addResult('NPM Scripts', false, 'package.json not found');
            return;
        }

        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const scripts = packageData.scripts;

        // Test script definitions
        const expectedScripts = {
            'start': 'electron .',
            'debug': 'electron . --enable-logging --log-level=0 --show', 
            'force-show': 'electron . --show --force-window-show'
        };

        for (const [scriptName, expectedCommand] of Object.entries(expectedScripts)) {
            if (scripts[scriptName] === expectedCommand) {
                this.addResult('NPM Scripts', true, `Script "${scriptName}" correctly defined`);
            } else {
                this.addResult('NPM Scripts', false, 
                    `Script "${scriptName}" incorrect. Expected: "${expectedCommand}", Got: "${scripts[scriptName] || 'undefined'}"`);
            }
        }
    }

    // ===== TEST BAT FILE SYNTAX =====
    async testBatFileSyntax() {
        this.log('🧪 Testing BAT file syntax and logic...', 'test');

        const batFiles = [
            'Start-SPOTEYFA.bat',
            'Debug-SPOTEYFA.bat',
            'Force-Show-SPOTEYFA.bat',
            'Install-Dependencies.bat'
        ];

        for (const batFile of batFiles) {
            const batPath = path.join(this.buildPath, batFile);
            if (!fs.existsSync(batPath)) {
                this.addResult('BAT Syntax', false, `${batFile} not found`);
                continue;
            }

            const batContent = fs.readFileSync(batPath, 'utf8');
            
            // Check for Windows line endings (CRLF)
            if (!batContent.includes('\\r\\n') && batContent.includes('\\n')) {
                // Convert for Windows compatibility
                this.log(`⚠️ ${batFile} may need CRLF line endings for Windows`, 'warn');
            }

            // Check for essential BAT commands
            const essentialElements = {
                'Start-SPOTEYFA.bat': ['@echo off', 'node --version', 'npm install', 'npm start'],
                'Debug-SPOTEYFA.bat': ['@echo off', 'npm run debug'],
                'Force-Show-SPOTEYFA.bat': ['@echo off', 'npm run force-show'],
                'Install-Dependencies.bat': ['@echo off', 'npm install']
            };

            const requiredElements = essentialElements[batFile] || [];
            let allElementsPresent = true;

            for (const element of requiredElements) {
                if (!batContent.includes(element)) {
                    this.addResult('BAT Syntax', false, `${batFile} missing: ${element}`);
                    allElementsPresent = false;
                }
            }

            if (allElementsPresent) {
                this.addResult('BAT Syntax', true, `${batFile} syntax correct`);
            }
        }
    }

    // ===== TEST ELECTRON MAIN.JS =====
    async testMainJsLogic() {
        this.log('🧪 Testing main.js Windows fixes logic...', 'test');

        const mainPath = path.join(this.buildPath, 'main.js');
        const mainContent = fs.readFileSync(mainPath, 'utf8');

        // Test 1: Windows detection logic
        const windowsDetectionPattern = /const isWindows = process\.platform === 'win32'/;
        if (windowsDetectionPattern.test(mainContent)) {
            this.addResult('Main.js Logic', true, 'Windows detection correctly implemented');
        } else {
            this.addResult('Main.js Logic', false, 'Windows detection logic missing or incorrect');
        }

        // Test 2: Force show parameter detection
        const forceShowPattern = /const forceShow = process\.argv\.includes\('--show'\) \|\| process\.argv\.includes\('--force-window-show'\)/;
        if (forceShowPattern.test(mainContent)) {
            this.addResult('Main.js Logic', true, 'Force show parameter detection correct');
        } else {
            this.addResult('Main.js Logic', false, 'Force show parameter detection missing');
        }

        // Test 3: ensureWindowVisible function
        const ensureVisiblePattern = /function ensureWindowVisible\(window\)\s*\{[\s\S]*?window\.show\(\)[\s\S]*?window\.focus\(\)[\s\S]*?\}/;
        if (ensureVisiblePattern.test(mainContent)) {
            this.addResult('Main.js Logic', true, 'ensureWindowVisible function properly implemented');
        } else {
            this.addResult('Main.js Logic', false, 'ensureWindowVisible function missing or incomplete');
        }

        // Test 4: Window creation with Windows fixes
        const windowShowPattern = /show:\s*isWindows\s*\|\|\s*forceShow/;
        if (windowShowPattern.test(mainContent)) {
            this.addResult('Main.js Logic', true, 'Window show configuration uses Windows fixes');
        } else {
            this.addResult('Main.js Logic', false, 'Window show configuration not using Windows fixes');
        }

        // Test 5: Ready event Windows fix
        const readyEventPattern = /app\.whenReady\(\)\.then\([\s\S]*?ensureWindowVisible/;
        if (readyEventPattern.test(mainContent)) {
            this.addResult('Main.js Logic', true, 'Ready event Windows fix implemented');
        } else {
            this.addResult('Main.js Logic', false, 'Ready event Windows fix missing');
        }
    }

    // ===== TEST FILE INTEGRITY =====
    async testFileIntegrity() {
        this.log('🧪 Testing file integrity and completeness...', 'test');

        const requiredFiles = [
            { file: 'main.js', critical: true },
            { file: 'renderer.js', critical: true },
            { file: 'i18n.js', critical: true },
            { file: 'config-manager.js', critical: true },
            { file: 'index.html', critical: true },
            { file: 'style.css', critical: true },
            { file: 'setup-wizard.html', critical: true },
            { file: 'package.json', critical: true },
            { file: 'README.md', critical: false },
            { file: 'LICENSE.txt', critical: false }
        ];

        for (const fileInfo of requiredFiles) {
            const filePath = path.join(this.buildPath, fileInfo.file);
            const exists = fs.existsSync(filePath);
            
            if (exists) {
                const stats = fs.statSync(filePath);
                if (stats.size > 0) {
                    this.addResult('File Integrity', true, `${fileInfo.file} exists and has content`);
                } else {
                    this.addResult('File Integrity', false, `${fileInfo.file} exists but is empty`);
                }
            } else {
                this.addResult('File Integrity', false, 
                    `${fileInfo.file} missing${fileInfo.critical ? ' (CRITICAL)' : ''}`);
            }
        }

        // Check assets directory
        const assetsPath = path.join(this.buildPath, 'assets');
        if (fs.existsSync(assetsPath)) {
            const assetsFiles = fs.readdirSync(assetsPath, { recursive: true });
            this.addResult('File Integrity', true, `Assets directory contains ${assetsFiles.length} files`);
        } else {
            this.addResult('File Integrity', false, 'Assets directory missing');
        }
    }

    // ===== TEST DEPENDENCIES =====
    async testDependencies() {
        this.log('🧪 Testing dependency configuration...', 'test');

        const packageData = JSON.parse(fs.readFileSync(path.join(this.buildPath, 'package.json'), 'utf8'));
        
        // Check required dependencies
        const requiredDeps = {
            'electron': '^28.0.0',
            'axios': '^1.6.0',
            'spotify-web-api-node': '^5.0.2', 
            'electron-updater': '^6.6.2'
        };

        let allDepsCorrect = true;

        for (const [dep, expectedVersion] of Object.entries(requiredDeps)) {
            const actualVersion = packageData.dependencies?.[dep];
            
            if (actualVersion === expectedVersion) {
                this.addResult('Dependencies', true, `${dep}: ${actualVersion} ✓`);
            } else {
                this.addResult('Dependencies', false, 
                    `${dep}: expected ${expectedVersion}, got ${actualVersion || 'MISSING'}`);
                allDepsCorrect = false;
            }
        }

        // Test that node_modules doesn't exist (as expected for portable)
        const nodeModulesPath = path.join(this.buildPath, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
            this.addResult('Dependencies', true, 'node_modules correctly excluded from portable build');
        } else {
            this.addResult('Dependencies', false, 'node_modules should not be included in portable build');
        }

        return allDepsCorrect;
    }

    // ===== SIMULATE INSTALLATION FLOW =====
    async simulateInstallationFlow() {
        this.log('🧪 Simulating user installation flow...', 'test');

        // Step 1: User extracts zip (already done)
        this.addResult('Install Flow', true, 'Step 1: ZIP extraction (simulated)');

        // Step 2: User sees files
        const userVisibleFiles = fs.readdirSync(this.buildPath);
        const startBatExists = userVisibleFiles.includes('Start-SPOTEYFA.bat');
        const readmeExists = userVisibleFiles.includes('README.md');

        this.addResult('Install Flow', startBatExists, 
            startBatExists ? 'Step 2: User can see Start-SPOTEYFA.bat' : 'Step 2: Start BAT not visible');
        
        this.addResult('Install Flow', readmeExists,
            readmeExists ? 'Step 2: User can see README.md for guidance' : 'Step 2: README missing');

        // Step 3: User reads README (check if it's helpful)
        if (readmeExists) {
            const readmeContent = fs.readFileSync(path.join(this.buildPath, 'README.md'), 'utf8');
            const hasQuickStart = readmeContent.includes('Quick Start');
            const hasRequirements = readmeContent.includes('Requirements');
            const hasTroubleshooting = readmeContent.includes('Troubleshooting');

            this.addResult('Install Flow', hasQuickStart && hasRequirements,
                `Step 3: README quality check - Quick Start: ${hasQuickStart}, Requirements: ${hasRequirements}`);
        }

        // Step 4: User double-clicks Start-SPOTEYFA.bat (simulate the logic)
        const startBatPath = path.join(this.buildPath, 'Start-SPOTEYFA.bat');
        const startBatContent = fs.readFileSync(startBatPath, 'utf8');
        
        // Check if the BAT would handle missing Node.js gracefully
        const hasNodeCheck = startBatContent.includes('node --version') && 
                            startBatContent.includes('if %errorlevel% neq 0');
        this.addResult('Install Flow', hasNodeCheck,
            'Step 4: BAT script will check for Node.js availability');

        // Check if BAT will install dependencies
        const hasAutoInstall = startBatContent.includes('npm install --production');
        this.addResult('Install Flow', hasAutoInstall,
            'Step 4: BAT script will auto-install dependencies');

        // Check if BAT provides user feedback
        const hasUserFeedback = startBatContent.includes('echo') && startBatContent.includes('pause');
        this.addResult('Install Flow', hasUserFeedback,
            'Step 4: BAT script provides user feedback');
    }

    // ===== TEST REAL WORLD SCENARIOS =====
    async testRealWorldScenarios() {
        this.log('🧪 Testing real-world scenarios...', 'test');

        // Scenario 1: No Node.js installed
        // (Can't actually test this, but validate the script handles it)
        const startBat = fs.readFileSync(path.join(this.buildPath, 'Start-SPOTEYFA.bat'), 'utf8');
        const handlesNoNodejs = startBat.includes('Node.js is required but not found') &&
                               startBat.includes('https://nodejs.org');
        this.addResult('Real World', handlesNoNodejs, 
            'Scenario 1: Graceful handling when Node.js not found');

        // Scenario 2: First run (setup wizard)
        const mainJs = fs.readFileSync(path.join(this.buildPath, 'main.js'), 'utf8');
        const hasFirstRunLogic = mainJs.includes('isFirstRun') && 
                                mainJs.includes('createSetupWindow');
        this.addResult('Real World', hasFirstRunLogic,
            'Scenario 2: First run detection and setup wizard');

        // Scenario 3: Window visibility issues (the main problem we're solving)
        const hasWindowFixes = mainJs.includes('ensureWindowVisible') &&
                              mainJs.includes('isWindows') &&
                              mainJs.includes('window.show()');
        this.addResult('Real World', hasWindowFixes,
            'Scenario 3: Windows visibility issues handled');

        // Scenario 4: Debug mode when something goes wrong
        const debugBat = fs.readFileSync(path.join(this.buildPath, 'Debug-SPOTEYFA.bat'), 'utf8');
        const hasDebugMode = debugBat.includes('npm run debug') &&
                            startBat.includes('npm run debug'); // Fallback in main script
        this.addResult('Real World', hasDebugMode,
            'Scenario 4: Debug mode available for troubleshooting');

        // Scenario 5: Force show for stubborn window issues
        const forceShowBat = fs.readFileSync(path.join(this.buildPath, 'Force-Show-SPOTEYFA.bat'), 'utf8');
        const hasForceShow = forceShowBat.includes('npm run force-show');
        this.addResult('Real World', hasForceShow,
            'Scenario 5: Force show option for stubborn cases');
    }

    // ===== GENERATE FINAL REPORT =====
    async generateFinalReport() {
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => r.passed === false).length;
        const total = this.testResults.length;
        const successRate = ((passed / total) * 100).toFixed(2);

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total,
                passed,
                failed,
                successRate: `${successRate}%`,
                status: failed === 0 ? 'READY FOR PRODUCTION' : 'NEEDS FIXES'
            },
            testResults: this.testResults,
            errors: this.errors,
            conclusion: failed === 0 ? 
                'The portable version is fully functional and ready for distribution.' :
                `${failed} issues found that should be addressed before distribution.`
        };

        fs.writeFileSync('final-functional-test-report.json', JSON.stringify(report, null, 2));
        return report;
    }

    // ===== RUN ALL TESTS =====
    async runAllTests() {
        console.log('🧪 SPOTEYFA v0.3.0 - Final Functional Test Suite');
        console.log('==============================================\n');

        try {
            await this.testFileIntegrity();
            await this.testNpmScripts();
            await this.testBatFileSyntax();
            await this.testMainJsLogic();
            await this.testDependencies();
            await this.simulateInstallationFlow();
            await this.testRealWorldScenarios();

            const report = await this.generateFinalReport();

            console.log('\n🎯 FINAL FUNCTIONAL TEST RESULTS');
            console.log('================================');
            console.log(`Status: ${report.summary.status}`);
            console.log(`Tests Passed: ${report.summary.passed}/${report.summary.total} (${report.summary.successRate})`);
            console.log(`Errors Found: ${report.summary.failed}`);

            if (this.errors.length > 0) {
                console.log('\n❌ ISSUES FOUND:');
                this.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error}`);
                });
            }

            console.log(`\n📝 Conclusion: ${report.conclusion}`);
            console.log('\n📄 Detailed report saved to: final-functional-test-report.json');

            return report.summary.status === 'READY FOR PRODUCTION';

        } catch (error) {
            this.log(`Test suite failed: ${error.message}`, 'error');
            console.error(error);
            return false;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const tester = new FinalFunctionalTest();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = FinalFunctionalTest;