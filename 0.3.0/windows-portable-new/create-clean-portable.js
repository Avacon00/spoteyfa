#!/usr/bin/env node

/**
 * SPOTEYFA v0.3.0 - Clean Portable Creator
 * Creates a clean version with only essential files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CleanPortableCreator {
    constructor() {
        this.version = '0.3.0';
        this.buildPath = './SPOTEYFA-Clean-v0.3.0';
        this.originalBuild = './SPOTEYFA-Windows-Portable-v0.3.0';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icons = { info: '📝', success: '✅', warn: '⚠️', error: '❌' };
        console.log(`[${timestamp}] ${icons[type]} ${message}`);
    }

    async createCleanVersion() {
        this.log('🧹 Creating clean portable version...', 'info');

        // Clean and create build directory
        if (fs.existsSync(this.buildPath)) {
            fs.rmSync(this.buildPath, { recursive: true, force: true });
        }
        fs.mkdirSync(this.buildPath, { recursive: true });

        // Copy essential files only
        const essentialFiles = [
            'main.js',
            'renderer.js',
            'i18n.js',
            'config-manager.js',
            'index.html',
            'style.css',
            'setup-wizard.html',
            'package.json',
            'README.md',
            'LICENSE.txt'
        ];

        if (fs.existsSync(this.originalBuild)) {
            // Copy essential files
            for (const file of essentialFiles) {
                const srcPath = path.join(this.originalBuild, file);
                const destPath = path.join(this.buildPath, file);
                
                if (fs.existsSync(srcPath)) {
                    fs.copyFileSync(srcPath, destPath);
                    this.log(`✅ Copied ${file}`, 'success');
                }
            }

            // Copy assets directory
            const assetsPath = path.join(this.originalBuild, 'assets');
            if (fs.existsSync(assetsPath)) {
                this.copyDirectory(assetsPath, path.join(this.buildPath, 'assets'));
                this.log('✅ Copied assets directory', 'success');
            }
        }

        // Add only essential BAT files
        await this.createEssentialBatFiles();
        await this.createSimpleReadme();

        this.log('✅ Clean portable version created!', 'success');
        return true;
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            
            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    async createEssentialBatFiles() {
        // 1. Simple Start (checks for Node.js)
        const simpleStart = `@echo off
title SPOTEYFA - Start
echo.
echo ========================================
echo           SPOTEYFA v0.3.0
echo    Apple-Style Spotify Player
echo ========================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo.
    echo Bitte installieren Sie Node.js:
    echo 1. Gehen Sie zu https://nodejs.org
    echo 2. Laden Sie die LTS Version herunter
    echo 3. Installieren Sie Node.js
    echo 4. Starten Sie diese Datei erneut
    echo.
    echo ODER verwenden Sie "EINFACH-INSTALLIEREN.bat"
    echo für automatische Installation.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js gefunden
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installiere SPOTEYFA...
    npm install --production
    echo.
)

echo Starte SPOTEYFA...
npm start

if %errorlevel% neq 0 (
    echo.
    echo Problem beim Start - verwende Debug:
    npm run debug
)

echo.
pause`;

        // 2. Debug version
        const debugStart = `@echo off
title SPOTEYFA - Debug
echo.
echo ========================================
echo        SPOTEYFA v0.3.0 - DEBUG
echo ========================================
echo.
echo Startet SPOTEYFA mit Debug-Informationen
echo.

npm run debug

echo.
echo Debug beendet.
pause`;

        // Write BAT files
        fs.writeFileSync(path.join(this.buildPath, 'SPOTEYFA-STARTEN.bat'), simpleStart);
        fs.writeFileSync(path.join(this.buildPath, 'SPOTEYFA-DEBUG.bat'), debugStart);

        // Copy the auto installer
        if (fs.existsSync('EINFACH-INSTALLIEREN.bat')) {
            fs.copyFileSync('EINFACH-INSTALLIEREN.bat', path.join(this.buildPath, 'EINFACH-INSTALLIEREN.bat'));
        }

        this.log('✅ Created essential BAT files', 'success');
    }

    async createSimpleReadme() {
        const readme = `# 🎵 SPOTEYFA v${this.version} - Windows Portable

## 🚀 Einfache Installation

### Für Anfänger (Automatisch):
\`\`\`
Doppelklick: EINFACH-INSTALLIEREN.bat
\`\`\`
**Macht alles automatisch!**

### Für erfahrene Benutzer:
\`\`\`
1. Node.js von https://nodejs.org installieren
2. Doppelklick: SPOTEYFA-STARTEN.bat
\`\`\`

## 📁 Dateien:

| Datei | Zweck |
|-------|-------|
| **EINFACH-INSTALLIEREN.bat** | 🟢 Automatische Installation |
| **SPOTEYFA-STARTEN.bat** | 🔵 Normaler Start |
| **SPOTEYFA-DEBUG.bat** | 🔍 Debug bei Problemen |

## 🎯 So funktioniert's:

1. **ZIP entpacken**
2. **EINFACH-INSTALLIEREN.bat** starten
3. **Warten** (2-3 Minuten)
4. **SPOTEYFA läuft!**

## ⚠️ Bei Problemen:

- **SPOTEYFA-DEBUG.bat** für Details
- **Computer neu starten** nach Node.js Installation
- **Antivirus temporär deaktivieren** bei Download-Problemen

## ✨ Features:

- 🎨 Apple Glassmorphism Design
- 🖱️ Drag & Drop
- 🖥️ Multi-Monitor Support  
- ⏰ Sleep Timer
- 🌍 Deutsch/English
- 🎮 Focus Mode
- 🔄 Auto-Update

---

**Apple-Style Spotify Player - v${this.version} Performance Revolution** 🎵`;

        fs.writeFileSync(path.join(this.buildPath, 'README.md'), readme);
        this.log('✅ Created simple README', 'success');
    }

    async createDistribution() {
        this.log('📦 Creating clean distribution...', 'info');

        const zipName = `SPOTEYFA-Clean-v${this.version}.zip`;
        
        try {
            const command = process.platform === 'win32' 
                ? `powershell Compress-Archive -Path "${this.buildPath}\\*" -DestinationPath "${zipName}" -Force`
                : `zip -r "${zipName}" "${this.buildPath}" -x "node_modules/*"`;
                
            execSync(command, { stdio: 'inherit' });
            
            this.log(`✅ Clean distribution created: ${zipName}`, 'success');
            
            const stats = fs.statSync(zipName);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            this.log(`📊 Package size: ${sizeMB}MB`, 'info');
            
            return zipName;
            
        } catch (error) {
            this.log(`❌ Distribution creation failed: ${error.message}`, 'error');
            return false;
        }
    }

    async create() {
        console.log('🧹 SPOTEYFA v' + this.version + ' - Clean Portable Creator');
        console.log('====================================================');
        console.log('Creating simplified version with only essential files');
        console.log('');

        try {
            const buildSuccess = await this.createCleanVersion();
            if (!buildSuccess) {
                return false;
            }

            const zipFile = await this.createDistribution();
            if (!zipFile) {
                return false;
            }

            console.log('');
            console.log('🎉 CLEAN PORTABLE VERSION READY!');
            console.log('================================');
            console.log(`Package: ${zipFile}`);
            console.log('');
            console.log('🎯 Files included:');
            console.log('  📄 Essential source files only');
            console.log('  🟢 EINFACH-INSTALLIEREN.bat (Auto-installer)');
            console.log('  🔵 SPOTEYFA-STARTEN.bat (Normal start)');
            console.log('  🔍 SPOTEYFA-DEBUG.bat (Debug mode)');
            console.log('  📚 Simple README.md');
            console.log('');
            console.log('✨ Clean, simple, and reliable!');
            
            return true;
            
        } catch (error) {
            this.log(`Clean creation failed: ${error.message}`, 'error');
            console.error(error);
            return false;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const creator = new CleanPortableCreator();
    creator.create().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = CleanPortableCreator;