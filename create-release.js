// Manual Release Creation Script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Creating Manual Release Package...\n');

// Create release directory
const releaseDir = 'release-v0.2.2';
const betaDir = 'Beta_0.2.1';

if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
}
fs.mkdirSync(releaseDir);

console.log('📁 Copying project files...');

// Copy essential files
const filesToCopy = [
    'main.js',
    'renderer.js', 
    'preload.js',
    'config.js',
    'setup-wizard.js',
    'index.html',
    'style.css',
    'package.json',
    '.env.example',
    'BETA_CHANGELOG.md'
];

filesToCopy.forEach(file => {
    const src = path.join(betaDir, file);
    const dest = path.join(releaseDir, file);
    
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${file}`);
    } else {
        console.log(`⚠️ Missing ${file}`);
    }
});

// Create installation script
const installScript = `@echo off
echo.
echo ====================================
echo  Apple Spotify Player - Setup
echo ====================================
echo.
echo Installing dependencies...
npm install
if errorlevel 1 (
    echo.
    echo ❌ Installation failed!
    echo Please make sure Node.js is installed.
    pause
    exit /b 1
)

echo.
echo ✅ Installation completed!
echo.
echo Starting Apple Spotify Player...
npm start

pause
`;

fs.writeFileSync(path.join(releaseDir, 'INSTALL_AND_RUN.bat'), installScript);

// Create README for release
const releaseReadme = `# 🎵 Apple Spotify Player v0.2.2

## 🚀 Quick Start

### Option 1: One-Click Setup (Recommended)
1. Double-click **INSTALL_AND_RUN.bat**
2. Wait for installation to complete
3. App starts automatically!

### Option 2: Manual Setup
1. Install Node.js from https://nodejs.org
2. Open Command Prompt in this folder
3. Run: \`npm install\`
4. Run: \`npm start\`

## ✨ Features
- 🍎 Apple-style Glassmorphism Design
- 🎵 Full Spotify Integration with OAuth
- 🌙 Dark/Light Mode Toggle
- 🔒 Secure Credential Management
- ⚡ Auto-hide & Always-on-top

## 🔧 Requirements
- Windows 10/11 or macOS or Linux
- Node.js 18+ (will be checked by installer)
- Internet connection
- Spotify account (free or premium)

## 🆘 Troubleshooting

### App won't start?
1. Make sure Node.js is installed
2. Run INSTALL_AND_RUN.bat as Administrator
3. Check your antivirus isn't blocking it

### Spotify connection issues?
1. Create Spotify Developer account at https://developer.spotify.com
2. Create a new app in the dashboard
3. Use redirect URI: http://127.0.0.1:8888/callback
4. Follow the setup wizard in the app

## 📞 Support
- GitHub Issues: https://github.com/Avacon00/spoteyfa/issues
- GitHub Discussions: https://github.com/Avacon00/spoteyfa/discussions

Enjoy your Apple-style Spotify Player! 🎵✨
`;

fs.writeFileSync(path.join(releaseDir, 'README.md'), releaseReadme);

// Create start script for non-Windows
const startScript = `#!/bin/bash
echo "🎵 Apple Spotify Player - Setup"
echo "================================"
echo
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Installation failed!"
    echo "Please make sure Node.js is installed."
    exit 1
fi

echo
echo "✅ Installation completed!"
echo
echo "Starting Apple Spotify Player..."
npm start
`;

fs.writeFileSync(path.join(releaseDir, 'install-and-run.sh'), startScript);

console.log('📄 Created installation scripts');
console.log('📚 Created release documentation');

console.log('\n✅ Release package created successfully!');
console.log(`📁 Location: ./${releaseDir}/`);
console.log(`📊 Size: ${getFolderSize(releaseDir)} MB`);

function getFolderSize(folderPath) {
    let size = 0;
    const items = fs.readdirSync(folderPath);
    
    items.forEach(item => {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isFile()) {
            size += stats.size;
        }
    });
    
    return (size / (1024 * 1024)).toFixed(2);
}

console.log('\n📦 Ready to create ZIP archive...');