const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

class AppleSpotifyPlayer {
    constructor() {
        this.mainWindow = null;
        this.isVisible = false;
        this.autoHideTimer = null;
    }

    createWindow() {
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
            
            // Enable modern web features
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                backgroundThrottling: false, // Keep animations smooth
                webSecurity: false          // Allow cross-origin requests
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
        this.setupWindowEvents();
        
        // Enable DevTools in development
        if (process.argv.includes('--dev')) {
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
        
        // Auto-hide after 12 seconds (Apple-style) - but not during setup wizard
        this.checkAndScheduleAutoHide();
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
    
    checkAndScheduleAutoHide() {
        // Check if setup wizard is active
        this.mainWindow.webContents.executeJavaScript(`
            document.getElementById('setupWizard') && 
            document.getElementById('setupWizard').style.display !== 'none'
        `).then((isWizardActive) => {
            if (!isWizardActive) {
                // Only auto-hide if wizard is not active
                this.scheduleAutoHide(12000);
            } else {
                console.log('🧙‍♂️ Setup wizard active - skipping auto-hide');
            }
        }).catch(() => {
            // Fallback: schedule auto-hide anyway
            this.scheduleAutoHide(12000);
        });
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
    
    setupWindowEvents() {
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
        
        // Handle Spotify actions
        ipcMain.on('spotify-action', (event, action, data) => {
            this.handleSpotifyAction(action, data);
        });
        
        // Prevent window from being closed
        this.mainWindow.on('close', (event) => {
            event.preventDefault();
            this.hideWithAnimation();
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