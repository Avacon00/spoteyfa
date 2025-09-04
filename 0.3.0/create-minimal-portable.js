#!/usr/bin/env node

/**
 * SPOTEYFA v0.3.0 - Minimal Windows Fix Package
 * Creates a tiny fix package under 1MB for the Windows UI issue
 */

const fs = require('fs');
const path = require('path');

class MinimalFixCreator {
    constructor() {
        this.version = '0.3.0';
        this.fixDir = './windows-fix-package';
    }

    log(message, type = 'info') {
        const icons = { info: '📝', success: '✅', warn: '⚠️' };
        console.log(`${icons[type]} ${message}`);
    }

    async create() {
        this.log('Creating minimal Windows fix package...', 'info');
        
        if (fs.existsSync(this.fixDir)) {
            fs.rmSync(this.fixDir, { recursive: true });
        }
        fs.mkdirSync(this.fixDir, { recursive: true });

        // Copy fix script
        fs.copyFileSync('./SPOTEYFA-Windows-Fix.bat', path.join(this.fixDir, 'SPOTEYFA-Windows-Fix.bat'));
        
        // Create registry fix for window positioning
        const regFix = `Windows Registry Editor Version 5.00

; SPOTEYFA v0.3.0 - Reset Window Position Registry Fix
; This clears any saved window position that might be off-screen

[HKEY_CURRENT_USER\\Software\\SPOTEYFA]
"window-position-x"=-
"window-position-y"=-
"window-state"=-

[HKEY_CURRENT_USER\\Software\\Electron]
"SPOTEYFA"=-
`;

        fs.writeFileSync(path.join(this.fixDir, 'Reset-SPOTEYFA-Window-Position.reg'), regFix);

        // Create comprehensive instructions
        const instructions = `# SPOTEYFA v0.3.0 - Windows UI Fix Package

## 🚨 Problem
SPOTEYFA installs successfully but no window appears when started.
Multiple processes may be running in Task Manager.

## 💡 Solutions (Try in order)

### Solution 1: Force Show Script ⚡ (RECOMMENDED)
1. Right-click "SPOTEYFA-Windows-Fix.bat"
2. Select "Run as administrator"
3. Follow the prompts

### Solution 2: Registry Reset 🔧
1. Double-click "Reset-SPOTEYFA-Window-Position.reg"  
2. Click "Yes" to add to registry
3. Restart SPOTEYFA

### Solution 3: Manual Window Reset 🎯
1. Open Task Manager (Ctrl+Shift+Esc)
2. End all "SPOTEYFA.exe" processes
3. Open Command Prompt as Administrator:
   \`\`\`cmd
   cd "C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\SPOTEYFA"
   SPOTEYFA.exe --show --center --reset-window-bounds
   \`\`\`

### Solution 4: Clean Reinstall 🔄
1. Uninstall SPOTEYFA from Control Panel
2. Delete: \`%LOCALAPPDATA%\\Programs\\SPOTEYFA\`
3. Run registry reset (Solution 2)
4. Reinstall as Administrator

## 🎯 Why This Happens
- Window positioned off-screen (multi-monitor setup)
- Electron window show/hide logic issue  
- Windows saved invalid window bounds
- Missing Visual C++ redistributables

## ✅ Success Indicators
- SPOTEYFA icon appears in system tray
- Music controls visible when Spotify plays
- Window responds to dragging

## 🆘 Still Not Working?
1. Check Windows Event Viewer for errors
2. Install Visual C++ Redistributable x64
3. Add SPOTEYFA.exe to Windows Defender exclusions
4. Try running from different user account

---
**This fix package is <1MB and addresses the most common Windows startup issues.**`;

        fs.writeFileSync(path.join(this.fixDir, 'README.md'), instructions);

        // Create PowerShell alternative
        const psScript = `# SPOTEYFA v0.3.0 - PowerShell Fix Script
Write-Host "SPOTEYFA Windows Fix - PowerShell Version" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Kill existing processes
Get-Process -Name "SPOTEYFA" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 2

# Find SPOTEYFA installation
$paths = @(
    "$env:LOCALAPPDATA\\Programs\\SPOTEYFA\\SPOTEYFA.exe",
    "$env:ProgramFiles\\SPOTEYFA\\SPOTEYFA.exe",
    "$env:ProgramFiles(x86)\\SPOTEYFA\\SPOTEYFA.exe"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        Write-Host "Found SPOTEYFA at: $path" -ForegroundColor Yellow
        Write-Host "Starting with force-show flags..." -ForegroundColor Yellow
        
        Start-Process -FilePath $path -ArgumentList "--show", "--enable-logging", "--log-level=0"
        
        Write-Host "SPOTEYFA started! Check your system tray." -ForegroundColor Green
        exit 0
    }
}

Write-Host "ERROR: SPOTEYFA.exe not found!" -ForegroundColor Red
Write-Host "Please check installation or reinstall as Administrator." -ForegroundColor Red
Read-Host "Press Enter to continue"`;

        fs.writeFileSync(path.join(this.fixDir, 'SPOTEYFA-Fix.ps1'), psScript);

        return this.fixDir;
    }

    async package() {
        const fixPath = await this.create();
        
        // Create ZIP (much smaller than 100MB)
        const { execSync } = require('child_process');
        const zipName = `SPOTEYFA-v${this.version}-Windows-UI-Fix.zip`;
        
        try {
            execSync(`cd "${fixPath}" && zip -r "../${zipName}" *`, { stdio: 'inherit' });
            
            const stats = fs.statSync(zipName);
            const sizeKB = (stats.size / 1024).toFixed(1);
            
            this.log(`✅ Created ${zipName} (${sizeKB}KB)`, 'success');
            
            return { zipName, sizeKB };
            
        } catch (error) {
            this.log(`Package creation failed: ${error.message}`, 'warn');
            return null;
        }
    }
}

// Run
const creator = new MinimalFixCreator();
creator.package().then(result => {
    if (result) {
        console.log(`\\n🎉 Windows UI Fix Package created: ${result.zipName}`);
        console.log(`📏 Size: ${result.sizeKB}KB (Perfect for GitHub!)`);
        console.log('\\n💡 This provides multiple solutions for the Windows startup issue.');
    }
}).catch(console.error);