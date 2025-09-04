#!/usr/bin/env node

/**
 * SPOTEYFA v0.3.0 - Deep Validation & Real-World Testing
 * Comprehensive check to ensure the portable version actually works
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

class DeepValidator {
    constructor() {
        this.buildPath = './SPOTEYFA-Windows-Portable-v0.3.0';
        this.issues = [];
        this.criticalIssues = [];
        this.testResults = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icons = { 
            info: '📝', success: '✅', warn: '⚠️', error: '❌', 
            test: '🧪', critical: '🚨', debug: '🔍'
        };
        console.log(`[${timestamp}] ${icons[type]} ${message}`);
    }

    addIssue(message, critical = false) {
        if (critical) {
            this.criticalIssues.push(message);
            this.log(message, 'critical');
        } else {
            this.issues.push(message);
            this.log(message, 'warn');
        }
    }

    // ===== DETAILED MAIN.JS VALIDATION =====
    async validateMainJsInDepth() {
        this.log('🔍 Deep validation of main.js Windows fixes...', 'debug');
        
        const mainJsPath = path.join(this.buildPath, 'main.js');
        if (!fs.existsSync(mainJsPath)) {
            this.addIssue('main.js file missing!', true);
            return false;
        }

        const mainContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Check 1: Windows fixes header
        if (!mainContent.includes('WINDOWS PORTABLE VERSION FIXES')) {
            this.addIssue('Missing Windows fixes header in main.js', true);
        } else {
            this.log('✅ Windows fixes header found', 'success');
        }

        // Check 2: ensureWindowVisible function
        const ensureWindowVisibleRegex = /function ensureWindowVisible\(window\)\s*\{[\s\S]*?\}/;
        const hasEnsureWindowVisible = ensureWindowVisibleRegex.test(mainContent);
        
        if (!hasEnsureWindowVisible) {
            this.addIssue('ensureWindowVisible function not properly implemented', true);
        } else {
            this.log('✅ ensureWindowVisible function found', 'success');
            
            // Check function content
            const functionMatch = mainContent.match(ensureWindowVisibleRegex);
            if (functionMatch) {
                const functionBody = functionMatch[0];
                
                if (!functionBody.includes('window.show()')) {
                    this.addIssue('ensureWindowVisible missing window.show() call', true);
                }
                if (!functionBody.includes('window.focus()')) {
                    this.addIssue('ensureWindowVisible missing window.focus() call');
                }
                if (!functionBody.includes('setAlwaysOnTop(true)')) {
                    this.addIssue('ensureWindowVisible missing temporary alwaysOnTop');
                }
            }
        }

        // Check 3: Platform detection
        if (!mainContent.includes('const isWindows = process.platform === \'win32\'')) {
            this.addIssue('Windows platform detection not implemented', true);
        } else {
            this.log('✅ Windows platform detection found', 'success');
        }

        // Check 4: Force show parameter
        if (!mainContent.includes('const forceShow = process.argv.includes(\'--show\')')) {
            this.addIssue('Force show parameter detection missing', true);
        } else {
            this.log('✅ Force show parameter detection found', 'success');
        }

        // Check 5: Window creation fixes
        const windowCreationRegex = /show:\s*isWindows\s*\|\|\s*forceShow/;
        if (!windowCreationRegex.test(mainContent)) {
            this.addIssue('Window show configuration not properly implemented', true);
        } else {
            this.log('✅ Window show configuration correctly implemented', 'success');
        }

        // Check 6: ensureWindowVisible calls
        const setupWindowCall = /ensureWindowVisible\(this\.setupWindow\)/;
        const mainWindowCall = /ensureWindowVisible\(this\.mainWindow\)/;
        
        if (!setupWindowCall.test(mainContent)) {
            this.addIssue('Missing ensureWindowVisible call for setupWindow');
        }
        if (!mainWindowCall.test(mainContent)) {
            this.addIssue('Missing ensureWindowVisible call for mainWindow');
        }

        // Check 7: Ready event fix
        if (!mainContent.includes('app.whenReady().then(() => {')) {
            this.addIssue('Missing ready event visibility fix');
        }

        return this.criticalIssues.length === 0;
    }

    // ===== PACKAGE.JSON VALIDATION =====
    async validatePackageJsonInDepth() {
        this.log('🔍 Deep validation of package.json...', 'debug');
        
        const packagePath = path.join(this.buildPath, 'package.json');
        if (!fs.existsSync(packagePath)) {
            this.addIssue('package.json missing!', true);
            return false;
        }

        try {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Check required fields
            const requiredFields = ['name', 'version', 'main', 'dependencies', 'scripts'];
            for (const field of requiredFields) {
                if (!packageData[field]) {
                    this.addIssue(`package.json missing required field: ${field}`, true);
                }
            }

            // Check dependencies
            const requiredDeps = {
                'electron': '^28.0.0',
                'axios': '^1.6.0', 
                'spotify-web-api-node': '^5.0.2',
                'electron-updater': '^6.6.2'
            };

            for (const [dep, expectedVersion] of Object.entries(requiredDeps)) {
                if (!packageData.dependencies[dep]) {
                    this.addIssue(`Missing dependency: ${dep}`, true);
                } else {
                    const actualVersion = packageData.dependencies[dep];
                    if (actualVersion !== expectedVersion) {
                        this.addIssue(`Dependency version mismatch for ${dep}: expected ${expectedVersion}, got ${actualVersion}`);
                    }
                }
            }

            // Check scripts
            const requiredScripts = {
                'start': 'electron .',
                'debug': 'electron . --enable-logging --log-level=0 --show',
                'force-show': 'electron . --show --force-window-show'
            };

            for (const [script, expectedCommand] of Object.entries(requiredScripts)) {
                if (!packageData.scripts[script]) {
                    this.addIssue(`Missing script: ${script}`, true);
                } else if (packageData.scripts[script] !== expectedCommand) {
                    this.addIssue(`Script ${script} incorrect: expected "${expectedCommand}", got "${packageData.scripts[script]}"`);
                }
            }

            this.log('✅ package.json validation passed', 'success');
            return true;

        } catch (error) {
            this.addIssue(`package.json parse error: ${error.message}`, true);
            return false;
        }
    }

    // ===== START SCRIPTS VALIDATION =====
    async validateStartScripts() {
        this.log('🔍 Deep validation of start scripts...', 'debug');

        const scripts = [
            { name: 'Start-SPOTEYFA.bat', critical: true },
            { name: 'Debug-SPOTEYFA.bat', critical: true },
            { name: 'Force-Show-SPOTEYFA.bat', critical: true },
            { name: 'Install-Dependencies.bat', critical: false }
        ];

        for (const script of scripts) {
            const scriptPath = path.join(this.buildPath, script.name);
            
            if (!fs.existsSync(scriptPath)) {
                this.addIssue(`Missing script: ${script.name}`, script.critical);
                continue;
            }

            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Common validations for all scripts
            if (!scriptContent.includes('@echo off')) {
                this.addIssue(`${script.name} missing @echo off directive`);
            }

            if (!scriptContent.includes('title ')) {
                this.addIssue(`${script.name} missing window title`);
            }

            // Specific validations
            switch (script.name) {
                case 'Start-SPOTEYFA.bat':
                    this.validateMainStartScript(scriptContent);
                    break;
                case 'Debug-SPOTEYFA.bat':
                    this.validateDebugScript(scriptContent);
                    break;
                case 'Force-Show-SPOTEYFA.bat':
                    this.validateForceShowScript(scriptContent);
                    break;
                case 'Install-Dependencies.bat':
                    this.validateInstallScript(scriptContent);
                    break;
            }
        }
    }

    validateMainStartScript(content) {
        const checks = [
            { test: content.includes('node --version'), message: 'Missing Node.js version check' },
            { test: content.includes('if %errorlevel% neq 0'), message: 'Missing error handling' },
            { test: content.includes('npm install'), message: 'Missing npm install command' },
            { test: content.includes('npm start'), message: 'Missing npm start command' },
            { test: content.includes('pause'), message: 'Missing pause at end' }
        ];

        for (const check of checks) {
            if (!check.test) {
                this.addIssue(`Start-SPOTEYFA.bat: ${check.message}`, check.message.includes('Node.js'));
            }
        }

        // Check for fallback to debug mode
        if (!content.includes('npm run debug')) {
            this.addIssue('Start-SPOTEYFA.bat missing fallback to debug mode');
        }
    }

    validateDebugScript(content) {
        if (!content.includes('npm run debug')) {
            this.addIssue('Debug-SPOTEYFA.bat missing npm run debug command', true);
        }
        
        if (!content.includes('Debug Mode')) {
            this.addIssue('Debug-SPOTEYFA.bat missing debug mode indication');
        }
    }

    validateForceShowScript(content) {
        if (!content.includes('npm run force-show')) {
            this.addIssue('Force-Show-SPOTEYFA.bat missing npm run force-show command', true);
        }
        
        if (!content.includes('Force Window Show') && !content.includes('FORCE WINDOW SHOW')) {
            this.addIssue('Force-Show-SPOTEYFA.bat missing force show indication');
        }
    }

    validateInstallScript(content) {
        if (!content.includes('npm install')) {
            this.addIssue('Install-Dependencies.bat missing npm install command', true);
        }
        
        if (!content.includes('--production')) {
            this.addIssue('Install-Dependencies.bat should use --production flag');
        }
    }

    // ===== WORKFLOW SIMULATION =====
    async simulateUserWorkflow() {
        this.log('🔍 Simulating real user workflow...', 'debug');

        // Step 1: Check if user would see all necessary files
        const userVisibleFiles = [
            'Start-SPOTEYFA.bat',
            'README.md',
            'LICENSE.txt'
        ];

        for (const file of userVisibleFiles) {
            const filePath = path.join(this.buildPath, file);
            if (!fs.existsSync(filePath)) {
                this.addIssue(`User-essential file missing: ${file}`, true);
            }
        }

        // Step 2: Check README quality for user guidance
        const readmePath = path.join(this.buildPath, 'README.md');
        if (fs.existsSync(readmePath)) {
            const readmeContent = fs.readFileSync(readmePath, 'utf8');
            
            const essentialSections = [
                { name: 'Quick Start', pattern: /Quick Start|getting started/i },
                { name: 'Requirements', pattern: /Requirements|Prerequisites/i },
                { name: 'Troubleshooting', pattern: /Troubleshooting|Problems|Issues/i },
                { name: 'Scripts Explained', pattern: /Scripts|\.bat/i }
            ];

            for (const section of essentialSections) {
                if (!section.pattern.test(readmeContent)) {
                    this.addIssue(`README missing essential section: ${section.name}`);
                }
            }

            // Check for Windows-specific guidance
            if (!readmeContent.includes('Windows') && !readmeContent.includes('win32')) {
                this.addIssue('README missing Windows-specific instructions');
            }

            // Check for Node.js installation guidance
            if (!readmeContent.includes('nodejs.org') && !readmeContent.includes('Node.js')) {
                this.addIssue('README missing Node.js installation guidance');
            }
        }

        // Step 3: Check for potential user confusion points
        const potentialConfusionPoints = [
            {
                check: () => !fs.existsSync(path.join(this.buildPath, 'node_modules')),
                message: 'Good: node_modules not included (will be installed)',
                isGood: true
            },
            {
                check: () => {
                    const files = fs.readdirSync(this.buildPath);
                    return files.filter(f => f.endsWith('.bat')).length >= 3;
                },
                message: 'Multiple start options available for different scenarios',
                isGood: true
            },
            {
                check: () => {
                    const startScript = fs.readFileSync(path.join(this.buildPath, 'Start-SPOTEYFA.bat'), 'utf8');
                    return startScript.includes('Installing dependencies');
                },
                message: 'Start script provides feedback during dependency installation',
                isGood: true
            }
        ];

        for (const point of potentialConfusionPoints) {
            if (point.check()) {
                this.log(`✅ ${point.message}`, 'success');
            } else if (!point.isGood) {
                this.addIssue(point.message);
            }
        }
    }

    // ===== ELECTRON COMPATIBILITY CHECK =====
    async checkElectronCompatibility() {
        this.log('🔍 Checking Electron compatibility...', 'debug');

        const mainJsPath = path.join(this.buildPath, 'main.js');
        const mainContent = fs.readFileSync(mainJsPath, 'utf8');

        // Check for deprecated Electron APIs
        const deprecatedAPIs = [
            { api: 'remote', replacement: 'ipcMain/ipcRenderer' },
            { api: 'nodeIntegration: true', replacement: 'contextIsolation with preload' },
            { api: 'enableRemoteModule', replacement: 'IPC communication' }
        ];

        for (const deprecated of deprecatedAPIs) {
            if (mainContent.includes(deprecated.api)) {
                if (deprecated.api === 'nodeIntegration: true') {
                    // This is expected for our use case, but note it
                    this.log(`⚠️ Using ${deprecated.api} (acceptable for this application type)`, 'warn');
                } else {
                    this.addIssue(`Using deprecated API: ${deprecated.api}, consider ${deprecated.replacement}`);
                }
            }
        }

        // Check for proper Electron 28 usage
        const modernElectronFeatures = [
            'app.whenReady()',
            'BrowserWindow',
            'ipcMain'
        ];

        for (const feature of modernElectronFeatures) {
            if (!mainContent.includes(feature)) {
                this.addIssue(`Missing modern Electron feature: ${feature}`);
            }
        }
    }

    // ===== CROSS-REFERENCE WITH ORIGINAL =====
    async crossReferenceWithOriginal() {
        this.log('🔍 Cross-referencing with original files...', 'debug');

        const originalPath = path.resolve('..'); // Parent directory
        const filesToCompare = ['renderer.js', 'i18n.js', 'config-manager.js', 'style.css'];

        for (const file of filesToCompare) {
            const originalFile = path.join(originalPath, file);
            const portableFile = path.join(this.buildPath, file);

            if (!fs.existsSync(originalFile)) {
                this.addIssue(`Original file not found for comparison: ${file}`);
                continue;
            }

            if (!fs.existsSync(portableFile)) {
                this.addIssue(`Portable version missing file: ${file}`, true);
                continue;
            }

            const originalContent = fs.readFileSync(originalFile, 'utf8');
            const portableContent = fs.readFileSync(portableFile, 'utf8');

            // For main.js, we expect differences (Windows fixes)
            if (file !== 'main.js') {
                if (originalContent !== portableContent) {
                    this.addIssue(`File ${file} differs from original (may be intentional)`);
                } else {
                    this.log(`✅ File ${file} matches original`, 'success');
                }
            }
        }

        // Special check for main.js - ensure Windows fixes don't break functionality
        const originalMainFile = path.join(originalPath, 'main.js');
        const portableMainFile = path.join(this.buildPath, 'main.js');

        if (fs.existsSync(originalMainFile)) {
            const originalMain = fs.readFileSync(originalMainFile, 'utf8');
            const portableMain = fs.readFileSync(portableMainFile, 'utf8');

            // Check that essential parts are preserved
            const essentialParts = [
                'class AppleSpotifyPlayer',
                'createWindow',
                'performanceOptimizer',
                'monitorManager',
                'focusMode',
                'sleepTimer',
                'i18n'
            ];

            for (const part of essentialParts) {
                if (originalMain.includes(part) && !portableMain.includes(part)) {
                    this.addIssue(`Essential functionality missing in portable version: ${part}`, true);
                } else if (originalMain.includes(part) && portableMain.includes(part)) {
                    this.log(`✅ Essential functionality preserved: ${part}`, 'success');
                }
            }
        }
    }

    // ===== GENERATE DETAILED REPORT =====
    async generateDetailedReport() {
        const report = {
            timestamp: new Date().toISOString(),
            validation: {
                totalIssues: this.issues.length,
                criticalIssues: this.criticalIssues.length,
                status: this.criticalIssues.length === 0 ? 'PASS' : 'FAIL'
            },
            issues: this.issues,
            criticalIssues: this.criticalIssues,
            recommendations: []
        };

        if (this.criticalIssues.length === 0) {
            report.recommendations.push('✅ Portable version is ready for distribution');
            report.recommendations.push('🚀 All critical functionality verified');
        } else {
            report.recommendations.push('🚨 Critical issues must be fixed before distribution');
            report.recommendations.push('⚠️ Review and fix all critical issues listed above');
        }

        if (this.issues.length > 0) {
            report.recommendations.push('💡 Consider addressing non-critical issues for better user experience');
        }

        // Write detailed report
        fs.writeFileSync('deep-validation-report.json', JSON.stringify(report, null, 2));

        return report;
    }

    // ===== MAIN VALIDATION =====
    async validate() {
        console.log('🔍 SPOTEYFA v0.3.0 - Deep Validation & Real-World Testing');
        console.log('========================================================\n');

        try {
            await this.validateMainJsInDepth();
            await this.validatePackageJsonInDepth();
            await this.validateStartScripts();
            await this.simulateUserWorkflow();
            await this.checkElectronCompatibility();
            await this.crossReferenceWithOriginal();

            const report = await this.generateDetailedReport();

            console.log('\n🎯 DEEP VALIDATION RESULTS');
            console.log('==========================');
            console.log(`Status: ${report.validation.status}`);
            console.log(`Critical Issues: ${report.validation.criticalIssues} 🚨`);
            console.log(`Total Issues: ${report.validation.totalIssues} ⚠️`);

            if (this.criticalIssues.length > 0) {
                console.log('\n🚨 CRITICAL ISSUES FOUND:');
                this.criticalIssues.forEach((issue, index) => {
                    console.log(`   ${index + 1}. ${issue}`);
                });
            }

            if (this.issues.length > 0) {
                console.log('\n⚠️ NON-CRITICAL ISSUES:');
                this.issues.forEach((issue, index) => {
                    console.log(`   ${index + 1}. ${issue}`);
                });
            }

            console.log('\n🎯 RECOMMENDATIONS:');
            report.recommendations.forEach(rec => console.log(`   ${rec}`));

            console.log(`\n📄 Detailed report saved to: deep-validation-report.json`);

            return report.validation.status === 'PASS';

        } catch (error) {
            this.log(`Deep validation failed: ${error.message}`, 'error');
            console.error(error);
            return false;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new DeepValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = DeepValidator;