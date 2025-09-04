#!/usr/bin/env node

/**
 * SPOTEYFA v0.3.0 - Ultimate Portable Creator
 * Creates the most user-friendly portable version with auto-installers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UltimatePortableCreator {
    constructor() {
        this.version = '0.3.0';
        this.buildPath = './SPOTEYFA-Ultimate-Portable-v0.3.0';
        this.originalBuild = './SPOTEYFA-Windows-Portable-v0.3.0';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icons = { info: '📝', success: '✅', warn: '⚠️', error: '❌' };
        console.log(`[${timestamp}] ${icons[type]} ${message}`);
    }

    async createUltimateVersion() {
        this.log('🚀 Creating Ultimate Portable Version...', 'info');

        // Clean and create build directory
        if (fs.existsSync(this.buildPath)) {
            fs.rmSync(this.buildPath, { recursive: true, force: true });
        }
        fs.mkdirSync(this.buildPath, { recursive: true });

        // Copy original build
        if (fs.existsSync(this.originalBuild)) {
            this.copyDirectory(this.originalBuild, this.buildPath);
            this.log('✅ Copied original portable files', 'success');
        } else {
            this.log('❌ Original build not found', 'error');
            return false;
        }

        // Copy new installer files
        const newFiles = [
            'SPOTEYFA-Auto-Installer.bat',
            'SPOTEYFA-ONE-CLICK.bat', 
            'README-INSTALLATION.md'
        ];

        for (const file of newFiles) {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join(this.buildPath, file));
                this.log(`✅ Added ${file}`, 'success');
            }
        }

        // Update the main README
        await this.updateMainReadme();

        // Create a startup guide
        await this.createStartupGuide();

        this.log('✅ Ultimate Portable Version created!', 'success');
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

    async updateMainReadme() {
        const readmePath = path.join(this.buildPath, 'README.md');
        let content = fs.readFileSync(readmePath, 'utf8');

        // Add installation instructions at the top
        const installationSection = `
## 🚀 **SUPER EINFACHE INSTALLATION - WÄHLEN SIE IHRE METHODE:**

### **🟢 FÜR ABSOLUTE ANFÄNGER (Empfohlen):**
\`\`\`
Doppelklick auf: SPOTEYFA-ONE-CLICK.bat
\`\`\`
**Das war's!** Alles wird vollautomatisch installiert und gestartet.

### **🟡 FÜR VORSICHTIGE BENUTZER:**
\`\`\`
Doppelklick auf: SPOTEYFA-Auto-Installer.bat
\`\`\`
Fragt nach Bestätigung, dann automatische Installation.

### **🔵 FÜR ERFAHRENE BENUTZER:**
\`\`\`
Doppelklick auf: Start-SPOTEYFA.bat
\`\`\` 
(Benötigt vorinstalliertes Node.js)

📚 **Detaillierte Anleitung:** Siehe \`README-INSTALLATION.md\`

---
`;

        // Insert after the first heading
        const lines = content.split('\n');
        const insertIndex = lines.findIndex(line => line.startsWith('## 🚀')) || 3;
        lines.splice(insertIndex, 0, installationSection);
        
        fs.writeFileSync(readmePath, lines.join('\n'));
        this.log('✅ Updated main README', 'success');
    }

    async createStartupGuide() {
        const startupGuide = `@echo off
title SPOTEYFA v0.3.0 - Schnellstart-Anleitung
color 0F
mode con: cols=90 lines=35

cls
echo.
echo ===============================================================================
echo                    SPOTEYFA v0.3.0 - SCHNELLSTART-ANLEITUNG                     
echo                          Apple-Style Spotify Player                             
echo ===============================================================================
echo.
echo   Wählen Sie Ihre bevorzugte Installationsmethode:
echo.
echo   🟢 FÜR ANFÄNGER (Vollautomatisch):
echo      Doppelklick auf: SPOTEYFA-ONE-CLICK.bat
echo      ➤ Alles wird automatisch installiert und gestartet
echo      ➤ Keine Eingaben erforderlich
echo      ➤ Perfekt für Benutzer ohne Programmiererfahrung
echo.
echo   🟡 MIT BESTÄTIGUNG (Halb-Automatisch):
echo      Doppelklick auf: SPOTEYFA-Auto-Installer.bat
echo      ➤ Fragt nach Admin-Rechten und Bestätigung
echo      ➤ Dann automatische Installation
echo      ➤ Für Benutzer die Kontrolle wollen
echo.
echo   🔵 TRADITIONELL (Manuell):
echo      1. Installieren Sie Node.js von https://nodejs.org
echo      2. Doppelklick auf: Start-SPOTEYFA.bat
echo      ➤ Für erfahrene Benutzer
echo      ➤ Wenn Sie Node.js bereits haben
echo.
echo ===============================================================================
echo.
echo   📚 DETAILLIERTE ANLEITUNG:
echo      Öffnen Sie: README-INSTALLATION.md
echo.
echo   🆘 BEI PROBLEMEN:
echo      - Verwenden Sie Debug-SPOTEYFA.bat für Fehlerdetails
echo      - Verwenden Sie Force-Show-SPOTEYFA.bat bei UI-Problemen
echo      - Lesen Sie README-INSTALLATION.md für Lösungen
echo.
echo ===============================================================================
echo.
echo   Welche Methode möchten Sie verwenden?
echo.
choice /c 123X /m "1=Ein-Klick, 2=Auto-Installer, 3=Manuell, X=Beenden"

if errorlevel 4 exit /b 0
if errorlevel 3 (
    echo.
    echo Öffne Start-SPOTEYFA.bat...
    start "" "Start-SPOTEYFA.bat"
    exit /b 0
)
if errorlevel 2 (
    echo.
    echo Öffne SPOTEYFA-Auto-Installer.bat...
    start "" "SPOTEYFA-Auto-Installer.bat"
    exit /b 0
)
if errorlevel 1 (
    echo.
    echo Öffne SPOTEYFA-ONE-CLICK.bat...
    start "" "SPOTEYFA-ONE-CLICK.bat"
    exit /b 0
)

exit /b 0`;

        fs.writeFileSync(path.join(this.buildPath, 'SCHNELLSTART.bat'), startupGuide);
        this.log('✅ Created startup guide', 'success');
    }

    async createDistribution() {
        this.log('📦 Creating ultimate distribution...', 'info');

        const zipName = `SPOTEYFA-Ultimate-Portable-v${this.version}.zip`;
        
        try {
            // Create zip archive
            const command = process.platform === 'win32' 
                ? `powershell Compress-Archive -Path "${this.buildPath}\\*" -DestinationPath "${zipName}" -Force`
                : `zip -r "${zipName}" "${this.buildPath}" -x "node_modules/*"`;
                
            execSync(command, { stdio: 'inherit' });
            
            this.log(`✅ Ultimate distribution created: ${zipName}`, 'success');
            
            // Get file size
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
        console.log('🎵 SPOTEYFA v' + this.version + ' - Ultimate Portable Creator');
        console.log('==============================================');
        console.log('Creating the most user-friendly portable version ever!');
        console.log('');

        try {
            const buildSuccess = await this.createUltimateVersion();
            if (!buildSuccess) {
                return false;
            }

            const zipFile = await this.createDistribution();
            if (!zipFile) {
                return false;
            }

            console.log('');
            console.log('🎉 ULTIMATE PORTABLE VERSION READY!');
            console.log('===================================');
            console.log(`Package: ${zipFile}`);
            console.log('');
            console.log('🚀 Installation Methods:');
            console.log('  🟢 SPOTEYFA-ONE-CLICK.bat      - Vollautomatisch (Anfänger)');
            console.log('  🟡 SPOTEYFA-Auto-Installer.bat - Mit Bestätigung');
            console.log('  🔵 Start-SPOTEYFA.bat          - Traditionell');
            console.log('  📚 README-INSTALLATION.md      - Detaillierte Anleitung');
            console.log('');
            console.log('✨ Perfect für Benutzer ohne Programmierkenntnisse!');
            
            return true;
            
        } catch (error) {
            this.log(`Ultimate creation failed: ${error.message}`, 'error');
            console.error(error);
            return false;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const creator = new UltimatePortableCreator();
    creator.create().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = UltimatePortableCreator;