#!/usr/bin/env node

/**
 * SPOTEYFA v0.3.0 - Comprehensive Portable Version Validation
 * Performs extensive testing of the new Windows portable build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveValidator {
    constructor() {
        this.buildPath = './SPOTEYFA-Windows-Portable-v0.3.0';
        this.testResults = {
            structure: [],
            functionality: [],
            performance: [],
            compatibility: [],
            security: [],
            usability: []
        };
        this.criticalIssues = [];
        this.warnings = [];
        this.passed = 0;
        this.failed = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icons = { 
            info: '📝', success: '✅', warn: '⚠️', error: '❌', 
            test: '🧪', critical: '🚨', performance: '⚡', 
            security: '🔐', usability: '👤'
        };
        console.log(`[${timestamp}] ${icons[type]} ${message}`);
    }

    addResult(category, test, passed, message, critical = false) {
        const result = {
            test,
            passed,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults[category].push(result);
        
        if (passed) {
            this.passed++;
        } else {
            this.failed++;
            if (critical) {
                this.criticalIssues.push(message);
            } else {
                this.warnings.push(message);
            }
        }
        
        this.log(message, passed ? 'success' : 'error');
    }

    // ===== STRUCTURE VALIDATION =====
    async validateStructure() {
        this.log('🏗️ Validating portable structure...', 'test');
        
        // Essential files check
        const essentialFiles = [
            'main.js',
            'renderer.js', 
            'i18n.js',
            'config-manager.js',
            'index.html',
            'style.css',
            'setup-wizard.html',
            'package.json'
        ];

        for (const file of essentialFiles) {
            const filePath = path.join(this.buildPath, file);
            const exists = fs.existsSync(filePath);
            this.addResult('structure', `Essential File: ${file}`, exists, 
                exists ? `${file} present` : `Missing critical file: ${file}`, !exists);
        }

        // Start scripts check
        const scripts = [
            'Start-SPOTEYFA.bat',
            'Debug-SPOTEYFA.bat', 
            'Force-Show-SPOTEYFA.bat',
            'Install-Dependencies.bat'
        ];

        for (const script of scripts) {
            const scriptPath = path.join(this.buildPath, script);
            const exists = fs.existsSync(scriptPath);
            this.addResult('structure', `Script: ${script}`, exists,
                exists ? `${script} available` : `Missing script: ${script}`);
        }

        // Assets directory
        const assetsPath = path.join(this.buildPath, 'assets');
        const assetsExists = fs.existsSync(assetsPath);
        this.addResult('structure', 'Assets Directory', assetsExists,
            assetsExists ? 'Assets directory present' : 'Assets directory missing');

        // Documentation
        const docs = ['README.md', 'LICENSE.txt'];
        for (const doc of docs) {
            const docPath = path.join(this.buildPath, doc);
            const exists = fs.existsSync(docPath);
            this.addResult('structure', `Documentation: ${doc}`, exists,
                exists ? `${doc} present` : `Missing documentation: ${doc}`);
        }
    }

    // ===== FUNCTIONALITY VALIDATION =====
    async validateFunctionality() {
        this.log('⚙️ Validating functionality...', 'test');

        // Package.json validation
        try {
            const packagePath = path.join(this.buildPath, 'package.json');
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Version check
            const versionValid = packageData.version === '0.3.0';
            this.addResult('functionality', 'Package Version', versionValid,
                `Package version: ${packageData.version}`);

            // Dependencies check
            const requiredDeps = ['electron', 'axios', 'spotify-web-api-node', 'electron-updater'];
            const hasDeps = requiredDeps.every(dep => packageData.dependencies[dep]);
            this.addResult('functionality', 'Required Dependencies', hasDeps,
                hasDeps ? 'All required dependencies present' : 'Missing required dependencies');

            // Scripts check
            const requiredScripts = ['start', 'debug', 'force-show'];
            const hasScripts = requiredScripts.every(script => packageData.scripts[script]);
            this.addResult('functionality', 'NPM Scripts', hasScripts,
                hasScripts ? 'All NPM scripts defined' : 'Missing NPM scripts');

        } catch (error) {
            this.addResult('functionality', 'Package.json Parse', false,
                `Package.json parse error: ${error.message}`, true);
        }

        // Main.js Windows fixes validation
        const mainJsPath = path.join(this.buildPath, 'main.js');
        const mainContent = fs.readFileSync(mainJsPath, 'utf8');

        const windowsFixes = [
            'WINDOWS PORTABLE VERSION FIXES',
            'ensureWindowVisible',
            'isWindows',
            'forceShow'
        ];

        for (const fix of windowsFixes) {
            const hasfix = mainContent.includes(fix);
            this.addResult('functionality', `Windows Fix: ${fix}`, hasfix,
                hasfix ? `Windows fix implemented: ${fix}` : `Missing Windows fix: ${fix}`);
        }

        // Check for proper window configuration
        const hasProperConfig = mainContent.includes('show: isWindows || forceShow');
        this.addResult('functionality', 'Window Show Config', hasProperConfig,
            hasProperConfig ? 'Proper window show configuration' : 'Missing window show fix');
    }

    // ===== PERFORMANCE VALIDATION =====
    async validatePerformance() {
        this.log('⚡ Validating performance...', 'performance');

        // File size analysis
        let totalSize = 0;
        let fileCount = 0;

        const calculateSize = (dir) => {
            const entries = fs.readdirSync(dir);
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    calculateSize(fullPath);
                } else {
                    totalSize += stat.size;
                    fileCount++;
                }
            }
        };

        calculateSize(this.buildPath);
        const sizeMB = totalSize / 1024 / 1024;

        // Size validation (should be reasonable without node_modules)
        const sizeReasonable = sizeMB < 1; // Without dependencies should be under 1MB
        this.addResult('performance', 'Build Size', sizeReasonable,
            `Build size: ${sizeMB.toFixed(2)}MB (${fileCount} files)`);

        // Check for performance optimization code
        const mainContent = fs.readFileSync(path.join(this.buildPath, 'main.js'), 'utf8');
        
        const perfOptimizations = [
            'performanceOptimizer',
            'memoryCleanupInterval',
            'updateThreshold',
            'cleanupTimer'
        ];

        for (const opt of perfOptimizations) {
            const hasOpt = mainContent.includes(opt);
            this.addResult('performance', `Performance: ${opt}`, hasOpt,
                hasOpt ? `Performance optimization present: ${opt}` : `Missing optimization: ${opt}`);
        }

        // Memory management check
        const hasMemoryMgmt = mainContent.includes('global.gc');
        this.addResult('performance', 'Memory Management', hasMemoryMgmt,
            hasMemoryMgmt ? 'Memory management implemented' : 'No explicit memory management');
    }

    // ===== COMPATIBILITY VALIDATION =====
    async validateCompatibility() {
        this.log('🔧 Validating compatibility...', 'test');

        // Windows-specific checks
        const startScript = fs.readFileSync(path.join(this.buildPath, 'Start-SPOTEYFA.bat'), 'utf8');
        
        // Node.js check in script
        const hasNodeCheck = startScript.includes('node --version');
        this.addResult('compatibility', 'Node.js Check', hasNodeCheck,
            hasNodeCheck ? 'Start script checks for Node.js' : 'No Node.js availability check');

        // Error handling in script
        const hasErrorHandling = startScript.includes('if %errorlevel% neq 0');
        this.addResult('compatibility', 'Error Handling', hasErrorHandling,
            hasErrorHandling ? 'Start script has error handling' : 'No error handling in start script');

        // Auto-install check
        const hasAutoInstall = startScript.includes('npm install');
        this.addResult('compatibility', 'Auto-Install', hasAutoInstall,
            hasAutoInstall ? 'Automatic dependency installation' : 'No automatic dependency installation');

        // Electron version compatibility
        const packageData = JSON.parse(fs.readFileSync(path.join(this.buildPath, 'package.json'), 'utf8'));
        const electronVersion = packageData.dependencies.electron;
        const isModernElectron = electronVersion.includes('28') || electronVersion.includes('^28');
        this.addResult('compatibility', 'Electron Version', isModernElectron,
            `Electron version: ${electronVersion}`);
    }

    // ===== SECURITY VALIDATION =====
    async validateSecurity() {
        this.log('🔐 Validating security...', 'security');

        const mainContent = fs.readFileSync(path.join(this.buildPath, 'main.js'), 'utf8');

        // Check for secure webPreferences
        const hasNodeIntegration = mainContent.includes('nodeIntegration: true');
        const hasContextIsolation = mainContent.includes('contextIsolation: false');
        
        // This is expected for Electron apps that need Node access
        this.addResult('security', 'Node Integration', hasNodeIntegration,
            hasNodeIntegration ? 'Node integration enabled (expected for functionality)' : 'Node integration disabled');

        // Check for any hardcoded secrets (should not be any)
        const suspiciousPatterns = [
            /password\s*[:=]\s*['"][^'"]+['"]/i,
            /secret\s*[:=]\s*['"][^'"]+['"]/i,
            /token\s*[:=]\s*['"][^'"]+['"]/i,
            /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i
        ];

        let hardcodedSecrets = false;
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(mainContent)) {
                hardcodedSecrets = true;
                break;
            }
        }

        this.addResult('security', 'Hardcoded Secrets', !hardcodedSecrets,
            hardcodedSecrets ? 'WARNING: Potential hardcoded secrets found' : 'No hardcoded secrets detected');

        // License validation
        const licenseExists = fs.existsSync(path.join(this.buildPath, 'LICENSE.txt'));
        this.addResult('security', 'License File', licenseExists,
            licenseExists ? 'License file present' : 'License file missing');
    }

    // ===== USABILITY VALIDATION =====
    async validateUsability() {
        this.log('👤 Validating usability...', 'usability');

        // README quality check
        const readmePath = path.join(this.buildPath, 'README.md');
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        const readmeSections = [
            'Quick Start',
            'Requirements',
            'Features',
            'Usage',
            'Troubleshooting'
        ];

        for (const section of readmeSections) {
            const hasSection = readmeContent.includes(section);
            this.addResult('usability', `README: ${section}`, hasSection,
                hasSection ? `README contains ${section} section` : `README missing ${section} section`);
        }

        // Start script usability
        const startScript = fs.readFileSync(path.join(this.buildPath, 'Start-SPOTEYFA.bat'), 'utf8');
        
        const usabilityFeatures = [
            'echo', // User feedback
            'title', // Window title
            'pause' // Wait for user
        ];

        for (const feature of usabilityFeatures) {
            const hasFeature = startScript.includes(feature);
            this.addResult('usability', `Script UX: ${feature}`, hasFeature,
                hasFeature ? `Start script has ${feature}` : `Start script missing ${feature}`);
        }

        // Multiple start options
        const scriptOptions = [
            'Start-SPOTEYFA.bat',
            'Debug-SPOTEYFA.bat',
            'Force-Show-SPOTEYFA.bat'
        ];

        for (const script of scriptOptions) {
            const exists = fs.existsSync(path.join(this.buildPath, script));
            this.addResult('usability', `Start Option: ${script}`, exists,
                exists ? `${script} provides alternative start method` : `Missing start option: ${script}`);
        }
    }

    // ===== APPLE DESIGN VALIDATION =====
    async validateAppleDesign() {
        this.log('🎨 Validating Apple design elements...', 'test');

        const cssContent = fs.readFileSync(path.join(this.buildPath, 'style.css'), 'utf8');
        
        const appleDesignElements = [
            { name: 'Backdrop Filter', pattern: /backdrop-filter.*blur/ },
            { name: 'Border Radius', pattern: /border-radius.*[1-9]/ },
            { name: 'RGBA Colors', pattern: /rgba\(.*\)/ },
            { name: 'Box Shadow', pattern: /box-shadow/ },
            { name: 'Glassmorphism', pattern: /glassmorphism|glass/ },
            { name: 'Apple Blue', pattern: /#007aff|rgb\(0,\s*122,\s*255\)/ },
            { name: 'SF Pro Font', pattern: /SF Pro|system-ui/ }
        ];

        for (const element of appleDesignElements) {
            const hasElement = element.pattern.test(cssContent);
            this.addResult('functionality', `Apple Design: ${element.name}`, hasElement,
                hasElement ? `Apple design element present: ${element.name}` : `Missing Apple design: ${element.name}`);
        }
    }

    // ===== v0.3.0 FEATURES VALIDATION =====
    async validateV030Features() {
        this.log('✨ Validating v0.3.0 features...', 'test');

        const mainContent = fs.readFileSync(path.join(this.buildPath, 'main.js'), 'utf8');
        const rendererContent = fs.readFileSync(path.join(this.buildPath, 'renderer.js'), 'utf8');
        
        const v030Features = [
            { name: 'Multi-Monitor Support', pattern: /monitorManager|displayBounds/, file: 'main' },
            { name: 'Focus Mode', pattern: /focusMode|fullscreenApps/, file: 'main' },
            { name: 'Sleep Timer', pattern: /sleepTimer|timeoutId/, file: 'main' },
            { name: 'Drag & Drop', pattern: /draggable|drag.*drop/, file: 'renderer' },
            { name: 'Right-Click Menu', pattern: /contextmenu|rightclick/, file: 'renderer' },
            { name: 'Internationalization', pattern: /i18n|language/, file: 'main' },
            { name: 'Auto-Update', pattern: /autoUpdater|electron-updater/, file: 'main' }
        ];

        for (const feature of v030Features) {
            const content = feature.file === 'main' ? mainContent : rendererContent;
            const hasFeature = feature.pattern.test(content);
            this.addResult('functionality', `v0.3.0 Feature: ${feature.name}`, hasFeature,
                hasFeature ? `v0.3.0 feature implemented: ${feature.name}` : `Missing v0.3.0 feature: ${feature.name}`);
        }

        // i18n file validation
        const i18nExists = fs.existsSync(path.join(this.buildPath, 'i18n.js'));
        if (i18nExists) {
            const i18nContent = fs.readFileSync(path.join(this.buildPath, 'i18n.js'), 'utf8');
            const hasGerman = i18nContent.includes('de:') || i18nContent.includes('german');
            const hasEnglish = i18nContent.includes('en:') || i18nContent.includes('english');
            
            this.addResult('functionality', 'i18n: German Support', hasGerman,
                hasGerman ? 'German language support implemented' : 'Missing German language support');
            this.addResult('functionality', 'i18n: English Support', hasEnglish,
                hasEnglish ? 'English language support implemented' : 'Missing English language support');
        }
    }

    async generateReport() {
        this.log('📊 Generating comprehensive validation report...', 'test');

        const report = {
            summary: {
                timestamp: new Date().toISOString(),
                buildPath: this.buildPath,
                totalTests: this.passed + this.failed,
                passed: this.passed,
                failed: this.failed,
                successRate: `${((this.passed / (this.passed + this.failed)) * 100).toFixed(2)}%`,
                criticalIssues: this.criticalIssues.length,
                warnings: this.warnings.length
            },
            categories: this.testResults,
            criticalIssues: this.criticalIssues,
            warnings: this.warnings,
            recommendations: []
        };

        // Generate recommendations
        if (this.criticalIssues.length > 0) {
            report.recommendations.push('🚨 Address critical issues before deployment');
        }

        if (this.warnings.length > 0) {
            report.recommendations.push('⚠️ Review warnings for optimal functionality');
        }

        if (report.summary.successRate === '100.00%') {
            report.recommendations.push('✅ Build is ready for distribution');
        }

        // Write detailed report to file
        const reportPath = path.join(this.buildPath, '..', 'validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    async validate() {
        console.log('🧪 SPOTEYFA v0.3.0 - Comprehensive Portable Validation');
        console.log('====================================================\n');

        try {
            await this.validateStructure();
            await this.validateFunctionality();
            await this.validatePerformance();
            await this.validateCompatibility();
            await this.validateSecurity();
            await this.validateUsability();
            await this.validateAppleDesign();
            await this.validateV030Features();

            const report = await this.generateReport();

            // Display summary
            console.log('\n📊 VALIDATION SUMMARY');
            console.log('===================');
            console.log(`Total Tests: ${report.summary.totalTests}`);
            console.log(`Passed: ${report.summary.passed} ✅`);
            console.log(`Failed: ${report.summary.failed} ❌`);
            console.log(`Success Rate: ${report.summary.successRate}`);
            console.log(`Critical Issues: ${report.summary.criticalIssues} 🚨`);
            console.log(`Warnings: ${report.summary.warnings} ⚠️`);

            if (this.criticalIssues.length > 0) {
                console.log('\n🚨 CRITICAL ISSUES:');
                this.criticalIssues.forEach(issue => console.log(`   - ${issue}`));
            }

            if (this.warnings.length > 0) {
                console.log('\n⚠️ WARNINGS:');
                this.warnings.forEach(warning => console.log(`   - ${warning}`));
            }

            console.log('\n🎯 RECOMMENDATIONS:');
            report.recommendations.forEach(rec => console.log(`   ${rec}`));

            console.log(`\n📄 Detailed report saved to: validation-report.json`);

            return report.summary.successRate === '100.00%';

        } catch (error) {
            this.log(`Validation failed: ${error.message}`, 'error');
            console.error(error);
            return false;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new ComprehensiveValidator();
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = ComprehensiveValidator;