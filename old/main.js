const { app, BrowserWindow, screen, ipcMain, shell } = require('electron');
const path = require('path');
<<<<<<< HEAD:main.js
const ConfigManager = require('./config-manager');
=======
const config = require('./config');
>>>>>>> 2d70d9e799f7a41cab182b8469aab2f3b5c7d9cb:old/main.js

class AppleSpotifyPlayer {
    constructor() {
        this.mainWindow = null;
        this.setupWindow = null;
        this.isVisible = false;
        this.autoHideTimer = null;
        this.configManager = new ConfigManager();
        this.isFirstRun = false;
    }

    async createWindow() {
        // Prüfe ob Setup benötigt wird
        await this.checkFirstRun();
        
        if (this.isFirstRun) {
            this.createSetupWindow();
            return;
        }
        
        this.createMainWindow();
    }
    
    async checkFirstRun() {
        this.isFirstRun = this.configManager.isFirstRun();
        console.log('🔍 First run check:', this.isFirstRun ? 'Setup needed' : 'Setup completed');
    }
    
    createSetupWindow() {
        console.log('🔧 Creating setup window...');
        
        const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
        
        this.setupWindow = new BrowserWindow({
            width: 600,
            height: 700,
            x: Math.floor((screenWidth - 600) / 2),
            y: Math.floor((screenHeight - 700) / 2),
            
            frame: false,
            transparent: true,
            resizable: false,
            alwaysOnTop: true,
            skipTaskbar: false,
            
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: true // Sicherheit für Setup aktiviert
            },
            
            show: false
        });
        
        this.setupWindow.loadFile('setup-wizard.html');
        
        this.setupWindow.once('ready-to-show', () => {
            this.setupWindow.show();
            this.setupWindow.focus();
        });
        
        this.setupSetupEvents();
    }
    
    createMainWindow() {
        // Get display dimensions
        const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
        
        // Apple-style window configuration
        this.mainWindow = new BrowserWindow({
            width: 420,  // Zurück zur funktionierenden Größe
            height: 650, // Zurück zur funktionierenden Größe
            x: screenWidth - 440, // 20px margin from right
            y: 30,                // 30px from top
            
            // Apple-style window properties
            frame: false,           // No title bar
            transparent: true,      // Enable transparency
            resizable: false,       // Fixed size like Apple widgets
            alwaysOnTop: true,      // Stay on top
            skipTaskbar: true,      // Don't show in taskbar
            
            // Secure web features configuration
            webPreferences: {
<<<<<<< HEAD:main.js
                nodeIntegration: true,
                contextIsolation: false,
                backgroundThrottling: false, // Keep animations smooth
                webSecurity: true           // Sicherheit wieder aktiviert
=======
                nodeIntegration: false,              // ✅ Disabled for security
                contextIsolation: true,              // ✅ Enabled for security
                enableRemoteModule: false,           // ✅ Disabled for security
                preload: path.join(__dirname, 'preload.js'), // ✅ Secure preload script
                backgroundThrottling: false,         // Keep animations smooth
                webSecurity: true,                   // ✅ Enabled for security
                allowRunningInsecureContent: false,  // ✅ Prevent mixed content
                experimentalFeatures: false          // ✅ Disable experimental features
>>>>>>> 2d70d9e799f7a41cab182b8469aab2f3b5c7d9cb:old/main.js
            },
            
            // macOS-specific (if running on Mac)
            vibrancy: 'ultra-dark',    // Native blur effect on macOS
            visualEffectState: 'active',
            
            // Windows-specific transparency
            opacity: 0.95,
            
            // Hide initially
            show: false
        });

        // Load the interface
        this.mainWindow.loadFile('index.html');
        
        // Apple-style fade-in when ready
        this.mainWindow.once('ready-to-show', () => {
            this.showWithAnimation();
        });
        
        // Handle window events
        this.setupMainWindowEvents();
        
        // Enable DevTools only in development mode
        if (config.isDevelopment()) {
            this.mainWindow.webContents.openDevTools();
        }
    }
    
    showWithAnimation() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.mainWindow.show();
        
        // Apple-style smooth fade-in
        let opacity = 0;
        const fadeIn = () => {
            opacity += 0.05;
            if (opacity <= 0.95) {
                this.mainWindow.setOpacity(opacity);
                setTimeout(fadeIn, 20); // 50fps animation
            } else {
                this.mainWindow.setOpacity(0.95);
            }
        };
        fadeIn();
        
        // Auto-hide after 12 seconds (Apple-style)
        this.scheduleAutoHide(12000);
    }
    
    hideWithAnimation() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        let opacity = 0.95;
        
        const fadeOut = () => {
            opacity -= 0.05;
            if (opacity > 0) {
                this.mainWindow.setOpacity(opacity);
                setTimeout(fadeOut, 20);
            } else {
                this.mainWindow.hide();
            }
        };
        fadeOut();
    }
    
    scheduleAutoHide(delay) {
        // Clear existing timer
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }
        
        // Set new timer
        this.autoHideTimer = setTimeout(() => {
            try {
                if (this.isVisible && this.mainWindow && !this.mainWindow.isDestroyed()) {
                    console.log('🔄 Auto-hiding player after', delay / 1000, 'seconds');
                    this.hideWithAnimation();
                }
            } catch (error) {
                // Silently handle EPIPE and other console errors
                // This prevents crashes when window is already closed
            }
        }, delay);
        
        try {
            console.log('⏰ Auto-hide scheduled for', delay / 1000, 'seconds');
        } catch (error) {
            // Silently handle console errors
        }
    }
    
    setupSetupEvents() {
        // Setup-spezifische Events
        ipcMain.on('setup-completed', (event, credentials) => {
            console.log('✅ Setup completed, switching to main player');
            
            // Speichere Credentials sicher
            if (credentials && credentials.clientId && credentials.clientSecret) {
                this.configManager.markSetupCompleted(credentials.clientId, credentials.clientSecret);
            }
            
            if (this.setupWindow) {
                this.setupWindow.close();
                this.setupWindow = null;
            }
            
            this.isFirstRun = false;
            this.createMainWindow();
        });
        
        ipcMain.on('restart-app', () => {
            console.log('🔄 Restarting app...');
            app.relaunch();
            app.quit();
        });
        
        ipcMain.on('reset-config', () => {
            console.log('🗑️ Resetting configuration...');
            this.configManager.resetConfig();
            app.relaunch();
            app.quit();
        });
        
        // Provide credentials to renderer
        ipcMain.handle('get-credentials', () => {
            return this.configManager.getCredentials();
        });
        
        this.setupWindow.on('closed', () => {
            if (this.isFirstRun) {
                // Falls Setup-Fenster geschlossen wird ohne Abschluss
                app.quit();
            }
        });
    }
    
    setupMainWindowEvents() {
        // Handle close button click
        ipcMain.on('close-player', () => {
            try {
                console.log('❌ Close button clicked - quitting app');
            } catch (error) {
                // Silently handle console errors
            }
            
            // Clear timers to prevent EPIPE errors
            if (this.autoHideTimer) {
                clearTimeout(this.autoHideTimer);
                this.autoHideTimer = null;
            }
            
            this.hideWithAnimation();
            // Nach Animation komplett beenden
            setTimeout(() => {
                app.quit();
            }, 1000);
        });
        
        // Handle show player request
        ipcMain.on('show-player', () => {
            try {
                console.log('📱 Show player requested from renderer');
            } catch (error) {
                // Silently handle console errors
            }
            this.showWithAnimation();
        });
        
        // Handle auto-hide timer reset
        ipcMain.on('reset-auto-hide', () => {
            try {
                console.log('⏰ Resetting auto-hide timer due to user interaction');
            } catch (error) {
                // Silently handle console errors
            }
            this.scheduleAutoHide(12000); // Reset to 12 seconds
        });
        
        // Secure IPC handlers
        this.setupSecureIpcHandlers();
        
        // Handle theme changes
        ipcMain.on('theme-changed', (event, theme) => {
            this.configManager.updateTheme(theme);
        });
        
        // Get current theme
        ipcMain.handle('get-theme', () => {
            return this.configManager.getTheme();
        });
        
        // Prevent window from being closed
        this.mainWindow.on('close', (event) => {
            event.preventDefault();
            this.hideWithAnimation();
        });
    }
    
    setupSecureIpcHandlers() {
        // Spotify configuration handlers
        ipcMain.handle('get-spotify-config', () => {
            return config.getSpotifyConfig();
        });
        
        ipcMain.handle('save-spotify-config', (event, clientId, clientSecret) => {
            // Validate inputs
            if (!clientId || !clientSecret || 
                typeof clientId !== 'string' || 
                typeof clientSecret !== 'string') {
                throw new Error('Invalid configuration data');
            }
            
            return config.saveToUserData(clientId, clientSecret);
        });
        
        // External URL handler with validation
        ipcMain.handle('open-external', (event, url) => {
            // Validate URL before opening
            if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
                // Additional validation for Spotify URLs
                if (url.includes('spotify.com') || url.includes('accounts.spotify.com')) {
                    return shell.openExternal(url);
                }
                throw new Error('URL not allowed');
            }
            throw new Error('Invalid URL format');
        });
        
        // Platform info
        ipcMain.handle('get-platform', () => {
            return {
                platform: process.platform,
                arch: process.arch,
                version: process.version
            };
        });
    }
    
    handleSpotifyAction(action, data) {
        // Forward Spotify actions to renderer process
        this.mainWindow.webContents.send('spotify-response', action, data);
    }
    
    setRoundedWindowShape() {
        // Erstelle eine runde Fenstermaske passend zum Player
        const { width, height } = this.mainWindow.getBounds();
        const borderRadius = 20;
        
        // Für Windows: Verwende native Windows API für runde Ecken
        if (process.platform === 'win32') {
            try {
                // Windows 11 Style rounded corners
                const os = require('os');
                const winVersion = os.release();
                
                console.log(`🪟 Windows Version: ${winVersion}`);
                
                // Versuche Windows 11 rounded corners
                if (parseFloat(winVersion) >= 10.0) {
                    // Windows 10/11: Setze DWM Attributes für runde Ecken
                    const dwmapi = require('child_process');
                    const hwnd = this.mainWindow.getNativeWindowHandle();
                    
                    console.log(`🔧 Window Handle: ${hwnd}`);
                    
                    // Fallback: Verwende eine Clipping Region
                    this.createRoundedRegion(width, height, borderRadius);
                }
                
                console.log('🔄 Applied Windows rounded window shape');
            } catch (error) {
                console.log('⚠️ Could not apply native window shape:', error.message);
                // Fallback zu CSS-only Lösung
                this.applyCSSRounding(borderRadius);
            }
        } else {
            // macOS: Nutze native vibrancy
            console.log('🍎 Using macOS native rounded corners');
        }
    }
    
    createRoundedRegion(width, height, radius) {
        try {
            // Erstelle eine rundge Clipping-Region für das Fenster
            const { nativeImage } = require('electron');
            
            // Erstelle Canvas für die Maske
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            
            // Zeichne abgerundetes Rechteck
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(width - radius, 0);
            ctx.quadraticCurveTo(width, 0, width, radius);
            ctx.lineTo(width, height - radius);
            ctx.quadraticCurveTo(width, height, width - radius, height);
            ctx.lineTo(radius, height);
            ctx.quadraticCurveTo(0, height, 0, height - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.fillStyle = 'black';
            ctx.fill();
            
            // Konvertiere zu Elektron Maske
            const imageData = ctx.getImageData(0, 0, width, height);
            const mask = nativeImage.createFromDataURL(canvas.toDataURL());
            
            // Setze die Fensterform (falls unterstützt)
            if (this.mainWindow.setShape) {
                this.mainWindow.setShape([{x: 0, y: 0, width: width, height: height}]);
                console.log('🎯 Applied custom window shape');
            }
            
        } catch (error) {
            console.log('❌ Could not create rounded region:', error.message);
        }
    }
    
    applyCSSRounding(borderRadius) {
        // Fallback CSS-Rundungen
        this.mainWindow.webContents.insertCSS(`
            body {
                border-radius: ${borderRadius}px;
                overflow: hidden;
                background: transparent;
            }
            
            .player-widget {
                border-radius: ${borderRadius}px;
                margin: 0;
                width: 100vw;
                height: 100vh;
                min-height: 100vh;
            }
        `);
        
        console.log('🎨 Applied CSS fallback rounding');
    }
}

// App lifecycle
app.whenReady().then(() => {
    const player = new AppleSpotifyPlayer();
    player.createWindow();
    
    // macOS: Re-create window when dock icon is clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            player.createWindow();
        } else {
            player.showWithAnimation();
        }
    });
});

// Quit when all windows are closed (auch auf macOS)
app.on('window-all-closed', () => {
    console.log('💀 All windows closed - quitting app');
    app.quit();
});

// Sauberes Beenden bei CTRL+C oder Prozess-Beendigung
app.on('before-quit', () => {
    console.log('🛑 App is quitting - cleaning up');
});

// Windows-spezifisch: Beende alle Prozesse
if (process.platform === 'win32') {
    process.on('SIGINT', () => {
        console.log('🔥 SIGINT received - force quitting');
        app.quit();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('🔥 SIGTERM received - force quitting');
        app.quit();
        process.exit(0);
    });
}

// macOS: Hide dock icon (optional)
if (process.platform === 'darwin') {
    app.dock.hide();
}