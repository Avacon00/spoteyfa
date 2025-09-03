#!/usr/bin/env node

/**
 * SPOTEYFA v0.3.0 - Portable Version Creator
 * 
 * This script creates portable distributions for all platforms:
 * - Windows: Zip with data folder structure
 * - macOS: Zip with app bundle and data folder
 * - Linux: AppImage is already portable by nature
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PortableCreator {
    constructor() {
        this.buildDir = './dist';
        this.portableDir = './portable';
        this.version = '0.3.0';
    }

    async createPortableVersions() {
        console.log('📦 SPOTEYFA v0.3.0 - Creating Portable Versions\n');

        try {
            await this.prepareBuild();
            await this.createWindowsPortable();
            await this.createMacOSPortable();
            await this.createLinuxPortable();
            
            console.log('\n🎉 All portable versions created successfully!');
            console.log('📍 Location: ./portable/');
            this.listPortableFiles();
        } catch (error) {
            console.error('❌ Portable creation failed:', error.message);
            process.exit(1);
        }
    }

    async prepareBuild() {
        console.log('1️⃣ Preparing build environment...');

        // Ensure build directory exists
        if (!fs.existsSync(this.buildDir)) {
            console.log('   Building application first...');
            execSync('npm run build', { stdio: 'inherit' });
        }

        // Create portable directory
        if (fs.existsSync(this.portableDir)) {
            fs.rmSync(this.portableDir, { recursive: true });
        }
        fs.mkdirSync(this.portableDir, { recursive: true });

        console.log('✅ Build environment ready\n');
    }

    async createWindowsPortable() {
        console.log('2️⃣ Creating Windows Portable...');

        const winUnpackedPath = path.join(this.buildDir, 'win-unpacked');
        if (!fs.existsSync(winUnpackedPath)) {
            console.log('   ⚠️  Windows build not found, skipping...\n');
            return;
        }

        try {
            const portableWinDir = path.join(this.portableDir, 'windows');
            fs.mkdirSync(portableWinDir, { recursive: true });

            // Copy Windows application files
            this.copyDirectory(winUnpackedPath, portableWinDir);

            // Create data directory structure
            const dataDir = path.join(portableWinDir, 'data', 'config');
            fs.mkdirSync(dataDir, { recursive: true });

            // Create portable marker file
            fs.writeFileSync(
                path.join(portableWinDir, 'PORTABLE'), 
                'SPOTEYFA v0.3.0 Portable Version\nSettings are stored in ./data/config/'
            );

            // Copy portable readme
            fs.copyFileSync('./PORTABLE-README.md', path.join(portableWinDir, 'README-PORTABLE.md'));

            // Create ZIP archive
            console.log('   Creating Windows portable ZIP...');
            execSync(`cd "${this.portableDir}" && zip -r "SPOTEYFA-v${this.version}-Portable-Windows.zip" windows/`, { stdio: 'pipe' });
            
            // Clean up directory (keep only ZIP)
            fs.rmSync(portableWinDir, { recursive: true });

            console.log('✅ Windows portable created: SPOTEYFA-v0.3.0-Portable-Windows.zip\n');
        } catch (error) {
            console.log('❌ Windows portable creation failed:', error.message);
        }
    }

    async createMacOSPortable() {
        console.log('3️⃣ Creating macOS Portable...');

        const macAppPath = path.join(this.buildDir, 'mac', 'SPOTEYFA.app');
        if (!fs.existsSync(macAppPath)) {
            console.log('   ⚠️  macOS build not found, skipping...\n');
            return;
        }

        try {
            const portableMacDir = path.join(this.portableDir, 'macos');
            fs.mkdirSync(portableMacDir, { recursive: true });

            // Copy macOS app bundle
            this.copyDirectory(macAppPath, path.join(portableMacDir, 'SPOTEYFA.app'));

            // Create data directory structure
            const dataDir = path.join(portableMacDir, 'data', 'config');
            fs.mkdirSync(dataDir, { recursive: true });

            // Create portable marker file
            fs.writeFileSync(
                path.join(portableMacDir, 'PORTABLE'), 
                'SPOTEYFA v0.3.0 Portable Version\nSettings are stored in ./data/config/'
            );

            // Copy portable readme
            fs.copyFileSync('./PORTABLE-README.md', path.join(portableMacDir, 'README-PORTABLE.md'));

            // Create ZIP archive
            console.log('   Creating macOS portable ZIP...');
            execSync(`cd "${this.portableDir}" && zip -r "SPOTEYFA-v${this.version}-Portable-macOS.zip" macos/`, { stdio: 'pipe' });
            
            // Clean up directory (keep only ZIP)
            fs.rmSync(portableMacDir, { recursive: true });

            console.log('✅ macOS portable created: SPOTEYFA-v0.3.0-Portable-macOS.zip\n');
        } catch (error) {
            console.log('❌ macOS portable creation failed:', error.message);
        }
    }

    async createLinuxPortable() {
        console.log('4️⃣ Creating Linux Portable...');

        const appImagePath = path.join(this.buildDir, `SPOTEYFA-${this.version}.AppImage`);
        if (!fs.existsSync(appImagePath)) {
            console.log('   ⚠️  Linux AppImage not found, skipping...\n');
            return;
        }

        try {
            // AppImage is already portable, just copy it
            const portableAppImage = path.join(this.portableDir, `SPOTEYFA-v${this.version}-Linux-x64-Portable.AppImage`);
            fs.copyFileSync(appImagePath, portableAppImage);

            // Make it executable
            fs.chmodSync(portableAppImage, 0o755);

            // Create additional portable info
            fs.writeFileSync(
                path.join(this.portableDir, 'SPOTEYFA-Linux-Portable-Instructions.txt'),
                `SPOTEYFA v${this.version} - Linux Portable Instructions

1. Make executable: chmod +x SPOTEYFA-v${this.version}-Linux-x64-Portable.AppImage
2. Run: ./SPOTEYFA-v${this.version}-Linux-x64-Portable.AppImage

AppImage is portable by design - settings are stored within the AppImage data.
No installation required!

For support, see: README-PORTABLE.md
`
            );

            console.log('✅ Linux portable created: SPOTEYFA-v0.3.0-Linux-x64-Portable.AppImage\n');
        } catch (error) {
            console.log('❌ Linux portable creation failed:', error.message);
        }
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    listPortableFiles() {
        console.log('\n📋 Created Portable Files:');
        console.log('=' .repeat(50));

        if (fs.existsSync(this.portableDir)) {
            const files = fs.readdirSync(this.portableDir);
            files.forEach(file => {
                const filePath = path.join(this.portableDir, file);
                const stats = fs.statSync(filePath);
                const size = (stats.size / 1024 / 1024).toFixed(1);
                console.log(`📦 ${file} (${size} MB)`);
            });
        }

        console.log('\n🎵 Portable versions ready for distribution! ✨');
    }
}

// Only run if executed directly
if (require.main === module) {
    const creator = new PortableCreator();
    creator.createPortableVersions().catch(console.error);
}

module.exports = PortableCreator;