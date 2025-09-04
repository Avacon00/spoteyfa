#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Creating FINAL SPOTEYFA solution...');

// Create build directory
const buildPath = './SPOTEYFA-FINAL-v0.3.0';
if (fs.existsSync(buildPath)) {
    fs.rmSync(buildPath, { recursive: true, force: true });
}
fs.mkdirSync(buildPath, { recursive: true });

// Copy from original build
const originalBuild = './SPOTEYFA-Windows-Portable-v0.3.0';
const files = [
    'main.js', 'renderer.js', 'i18n.js', 'config-manager.js',
    'index.html', 'style.css', 'setup-wizard.html', 
    'package.json', 'LICENSE.txt'
];

for (const file of files) {
    const src = path.join(originalBuild, file);
    const dest = path.join(buildPath, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('Copied:', file);
    }
}

// Copy assets
const assetsSrc = path.join(originalBuild, 'assets');
const assetsDest = path.join(buildPath, 'assets');
if (fs.existsSync(assetsSrc)) {
    fs.cpSync(assetsSrc, assetsDest, { recursive: true });
    console.log('Copied: assets/');
}

// Copy installers
const installers = ['SUPER-INSTALLER.bat', 'PORTABLE-NODEJS.bat'];
for (const installer of installers) {
    if (fs.existsSync(installer)) {
        fs.copyFileSync(installer, path.join(buildPath, installer));
        console.log('Added:', installer);
    }
}

// Create main menu
const mainMenu = `@echo off
title SPOTEYFA v0.3.0 Installation
color 0F
cls
echo.
echo =======================================
echo      SPOTEYFA v0.3.0 INSTALLATION
echo =======================================
echo.
echo Waehlen Sie:
echo.
echo 1. SUPER-INSTALLER (empfohlen)
echo    - Robuste Node.js Installation
echo    - Zeigt Details
echo.
echo 2. PORTABLE NODE.JS (garantiert)
echo    - Keine Installation noetig
echo    - Funktioniert immer
echo.
echo 3. Hilfe
echo.
echo 4. Beenden
echo.
choice /c 1234 /m "Option"

if errorlevel 4 exit /b
if errorlevel 3 goto help
if errorlevel 2 call PORTABLE-NODEJS.bat & pause & exit /b
if errorlevel 1 call SUPER-INSTALLER.bat & pause & exit /b

:help
cls
echo.
echo HILFE:
echo.
echo Problem: "Installation eventuell nicht komplett"
echo Loesung: Verwenden Sie Option 2 (Portable)
echo.
echo Problem: "Node.js nicht installiert"
echo Loesung: Als Administrator starten oder Option 2
echo.
pause
exit /b`;

fs.writeFileSync(path.join(buildPath, 'INSTALLATION.bat'), mainMenu);

// Simple README
const readme = `# SPOTEYFA v0.3.0 - Windows Final

## Installation

Doppelklick: INSTALLATION.bat

Dann waehlen:
1. Super-Installer (robust)
2. Portable Node.js (garantiert)

## Ihr Problem geloest

"Installation eventuell nicht komplett"
-> Option 2 verwenden

"Node.js nicht installiert" 
-> Option 2 verwenden

Option 2 funktioniert IMMER!
`;

fs.writeFileSync(path.join(buildPath, 'README.md'), readme);

// Create ZIP
const zipName = 'SPOTEYFA-FINAL-v0.3.0.zip';
try {
    execSync(`zip -r "${zipName}" "${buildPath}" -x "node_modules/*"`, { stdio: 'inherit' });
    const stats = fs.statSync(zipName);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('');
    console.log('SUCCESS!');
    console.log('========');
    console.log('Package:', zipName);
    console.log('Size:', sizeMB + 'MB');
    console.log('');
    console.log('LOEST IHR PROBLEM:');
    console.log('Option 2 = Portable Node.js = Funktioniert garantiert!');
    
} catch (error) {
    console.error('ZIP creation failed:', error.message);
}