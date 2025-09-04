const { app, BrowserWindow, screen, ipcMain, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const ConfigManager = require('./config-manager');
const I18n = require('./i18n');


// ===== WINDOWS PORTABLE VERSION FIXES =====
const isWindows = process.platform === 'win32';
const forceShow = process.argv.includes('--show') || process.argv.includes('--force-window-show');

// Windows visibility fix function
function ensureWindowVisible(window) {
    if (isWindows && window) {
        setTimeout(() => {
            window.show();
            window.focus();
            window.setAlwaysOnTop(true);
            setTimeout(() => window.setAlwaysOnTop(false), 100);
        }, 100);
    }
}

class AppleSpotifyPlayer {
    constructor() {
        this.mainWindow = null;
        this.setupWindow = null;
        this.isVisible = false;
        this.autoHideTimer = null;
        this.configManager = new ConfigManager();
        this.isFirstRun = false;
        
        // Performance optimizations
        this.performanceOptimizer = {
            lastUpdate: 0,
            updateThreshold: 2000, // Only update every 2 seconds
            memoryCleanupInterval: 30000, // Clean memory every 30 seconds
            cleanupTimer: null
        };
        
        // Multi-monitor support
        this.monitorManager = {
            currentDisplay: null,
            displayBounds: {},
            savedPositions: {} // Save position per monitor
        };
        
        // Focus-Modus für Vollbild-Apps
        this.focusMode = {
            isEnabled: true,
            wasVisible: false,
            checkInterval: null,
            fullscreenApps: ['steam', 'game', 'video', 'vlc', 'netflix', 'youtube'],
            lastFocusCheck: 0
        };
        
        // Sleep Timer
        this.sleepTimer = {
            isActive: false,
            timeoutId: null,
            remainingTime: 0,
            totalTime: 0,
            updateInterval: null
        };
        
        // Internationalization
        this.i18n = new I18n();
        
        // Start memory optimization
        this.startPerformanceOptimization();
        this.initMultiMonitorSupport();
        this.initAutoUpdater();
        this.initFocusMode();
        this.initPlatformIntegration();
        // Force show on ready (Windows fix)
        if (isWindows) {
            app.whenReady().then(() => {
                setTimeout(() => {
                    if (this.mainWindow) ensureWindowVisible(this.mainWindow);
                    if (this.setupWindow) ensureWindowVisible(this.setupWindow);
                }, 500);
            });
        }

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
            
            show: isWindows || forceShow
        });
        
        this.setupWindow.loadFile('setup-wizard.html');
        ensureWindowVisible(this.setupWindow);
        
        this.setupWindow.once('ready-to-show', () => {
            this.setupWindow.show();
            this.setupWindow.focus();
        });
        
        this.setupSetupEvents();
    }
    
    createMainWindow() {
        // Enhanced multi-monitor aware window positioning
        const targetDisplay = this.getBestDisplayForWindow();
        const { width: screenWidth, height: screenHeight } = targetDisplay.workAreaSize;
        
        // Apple-style window configuration
        this.mainWindow = new BrowserWindow({
            width: 420,  // Zurück zur funktionierenden Größe
            height: 650, // Zurück zur funktionierenden Größe
            x: this.calculateOptimalX(targetDisplay, 420),
            y: this.calculateOptimalY(targetDisplay, 650),
            
            // Apple-style window properties
            frame: false,           // No title bar
            transparent: true,      // Enable transparency
            resizable: false,       // Fixed size like Apple widgets
            alwaysOnTop: true,      // Stay on top
            skipTaskbar: true,      // Don't show in taskbar
            
            // Optimized web features for performance
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                backgroundThrottling: false,
                webSecurity: true,
                // Performance optimizations
                enableRemoteModule: false,
                preload: null, // No preload script for faster startup
                experimentalFeatures: false,
                v8CacheOptions: 'bypassHeatCheck'
            },
            
            // Platform-specific optimizations
            ...(process.platform === 'darwin' ? {
                vibrancy: 'ultra-dark',    // Native blur effect on macOS
                visualEffectState: 'active',
                titleBarStyle: 'hiddenInset'
            } : {}),
            
            ...(process.platform === 'win32' ? {
                // Windows 11 style improvements + UI Fix
                roundedCorners: true,
                opacity: 0.95,
                show: true,           // Force show on Windows
                center: true,         // Always center window
                movable: true,        // Allow dragging
                minimizable: true,    // Allow minimize
                skipTaskbar: false    // Show in taskbar for Windows
            } : {}),
            
            ...(process.platform === 'linux' ? {
                // Linux-specific settings
                icon: path.join(__dirname, 'assets/icon.png')
            } : {}),
            
            // Hide initially
            show: isWindows || forceShow
        });

        // Load the interface
        this.mainWindow.loadFile('index.html');
        ensureWindowVisible(this.mainWindow);
        
        // Apple-style fade-in when ready
        this.mainWindow.once('ready-to-show', () => {
            // Windows-specific fix: Ensure window is visible
            if (process.platform === 'win32') {
                this.mainWindow.show();
                this.mainWindow.focus();
                this.mainWindow.setAlwaysOnTop(true);
                console.log('🪟 Windows: Force-showing window');
            }
            this.showWithAnimation();
        });
        
        // Handle window events
        this.setupMainWindowEvents();
        
        // Setup multi-monitor event listeners
        this.setupMultiMonitorEvents();
        
        // Enable DevTools in development
        if (process.argv.includes('--dev')) {
            this.mainWindow.webContents.openDevTools();
        }
        
        // Handle command line debug flags (for Windows fix script)
        if (process.argv.includes('--show') || process.argv.includes('--enable-logging')) {
            console.log('🔧 Debug mode: Force-showing window');
            this.mainWindow.show();
            this.mainWindow.focus();
            this.mainWindow.center();
            
            if (process.argv.includes('--enable-logging')) {
                console.log('📝 Logging enabled for debugging');
                this.mainWindow.webContents.on('console-message', (event, level, message) => {
                    console.log('Renderer:', message);
                });
            }
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
        
        // Handle Spotify actions
        ipcMain.on('spotify-action', (event, action, data) => {
            this.handleSpotifyAction(action, data);
        });
        
        // Handle theme changes
        ipcMain.on('theme-changed', (event, theme) => {
            this.configManager.updateTheme(theme);
        });
        
        // Get current theme
        ipcMain.handle('get-theme', () => {
            return this.configManager.getTheme();
        });
        
        // Handle context menu actions
        ipcMain.on('show-context-menu', (event) => {
            this.showContextMenu(event);
        });
        
        ipcMain.on('toggle-always-on-top', () => {
            const isAlwaysOnTop = this.mainWindow.isAlwaysOnTop();
            this.mainWindow.setAlwaysOnTop(!isAlwaysOnTop);
        });
        
        ipcMain.on('hide-for-time', (event, minutes) => {
            this.hideWithAnimation();
            setTimeout(() => {
                if (!this.mainWindow.isDestroyed()) {
                    this.showWithAnimation();
                }
            }, minutes * 60 * 1000);
        });
        
        // Handle window position changes for drag functionality
        ipcMain.on('set-window-position', (event, position) => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.setPosition(position.x, position.y);
            }
        });
        
        ipcMain.handle('get-window-position', () => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                return this.mainWindow.getPosition().reduce((pos, val, i) => {
                    pos[i === 0 ? 'x' : 'y'] = val;
                    return pos;
                }, {});
            }
            return { x: 0, y: 0 };
        });
        
        // Auto-updater IPC handlers
        ipcMain.on('check-for-updates', () => {
            autoUpdater.checkForUpdatesAndNotify();
        });
        
        ipcMain.on('restart-and-install', () => {
            autoUpdater.quitAndInstall();
        });
        
        // Focus mode handlers
        ipcMain.on('toggle-focus-mode', () => {
            this.focusMode.isEnabled = !this.focusMode.isEnabled;
            console.log(`🎯 Focus mode: ${this.focusMode.isEnabled ? 'enabled' : 'disabled'}`);
        });
        
        ipcMain.handle('get-focus-mode', () => {
            return this.focusMode.isEnabled;
        });
        
        // Sleep timer handlers
        ipcMain.on('start-sleep-timer', (event, minutes) => {
            this.startSleepTimer(minutes);
        });
        
        ipcMain.on('stop-sleep-timer', () => {
            this.stopSleepTimer();
        });
        
        ipcMain.handle('get-sleep-timer-status', () => {
            return {
                isActive: this.sleepTimer.isActive,
                remainingTime: this.sleepTimer.remainingTime,
                totalTime: this.sleepTimer.totalTime
            };
        });
        
        // Language handlers
        ipcMain.on('set-language', (event, lang) => {
            this.i18n.setLanguage(lang);
        });
        
        ipcMain.handle('get-language', () => {
            return this.i18n.getCurrentLanguage();
        });
        
        ipcMain.handle('get-translation', (event, key) => {
            return this.i18n.t(key);
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

// Platform-specific app configuration
if (process.platform === 'darwin') {
    // macOS: Hide dock icon for overlay behavior
    app.dock.hide();
} else if (process.platform === 'win32') {
    // Windows: Configure for better taskbar integration
    app.setAppUserModelId('com.spoteyfa.apple-spotify-player');
}

// Performance optimization methods
AppleSpotifyPlayer.prototype.startPerformanceOptimization = function() {
    console.log('🚀 Starting performance optimization...');
    
    // Memory cleanup every 30 seconds
    this.performanceOptimizer.cleanupTimer = setInterval(() => {
        if (global.gc) {
            global.gc();
            console.log('🧹 Memory cleanup performed');
        }
        
        // Clear renderer cache if window exists
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.session.clearCache();
        }
    }, this.performanceOptimizer.memoryCleanupInterval);
};

AppleSpotifyPlayer.prototype.shouldUpdateUI = function() {
    const now = Date.now();
    if (now - this.performanceOptimizer.lastUpdate >= this.performanceOptimizer.updateThreshold) {
        this.performanceOptimizer.lastUpdate = now;
        return true;
    }
    return false;
};

// Optimized show animation with faster startup
AppleSpotifyPlayer.prototype.showWithFastAnimation = function() {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.mainWindow.show();
    this.mainWindow.setOpacity(0.95); // Skip fade animation for speed
    
    // Auto-hide after 12 seconds
    this.scheduleAutoHide(12000);
};

// Context Menu Implementation
AppleSpotifyPlayer.prototype.showContextMenu = function(event) {
    const template = [
        {
            label: this.mainWindow.isAlwaysOnTop() ? 
                `${this.i18n.t('alwaysOnTop')} ✓` : 
                this.i18n.t('alwaysOnTop'),
            click: () => {
                const isAlwaysOnTop = this.mainWindow.isAlwaysOnTop();
                this.mainWindow.setAlwaysOnTop(!isAlwaysOnTop);
            }
        },
        { type: 'separator' },
        {
            label: this.i18n.t('hideFor5Min'),
            click: () => {
                this.hideWithAnimation();
                setTimeout(() => {
                    if (!this.mainWindow.isDestroyed()) {
                        this.showWithAnimation();
                    }
                }, 5 * 60 * 1000);
            }
        },
        {
            label: this.i18n.t('hideFor15Min'),
            click: () => {
                this.hideWithAnimation();
                setTimeout(() => {
                    if (!this.mainWindow.isDestroyed()) {
                        this.showWithAnimation();
                    }
                }, 15 * 60 * 1000);
            }
        },
        { type: 'separator' },
        {
            label: this.i18n.t('pinToCorner'),
            submenu: [
                {
                    label: this.i18n.t('topLeft'),
                    click: () => this.pinToCorner('top-left')
                },
                {
                    label: this.i18n.t('topRight'),
                    click: () => this.pinToCorner('top-right')
                },
                {
                    label: this.i18n.t('bottomLeft'),
                    click: () => this.pinToCorner('bottom-left')
                },
                {
                    label: this.i18n.t('bottomRight'),
                    click: () => this.pinToCorner('bottom-right')
                }
            ]
        },
        { type: 'separator' },
        {
            label: this.i18n.t('sleepTimer'),
            submenu: [
                {
                    label: `15 ${this.i18n.t('minutes')}`,
                    click: () => this.startSleepTimer(15)
                },
                {
                    label: `30 ${this.i18n.t('minutes')}`, 
                    click: () => this.startSleepTimer(30)
                },
                {
                    label: `1 ${this.i18n.t('hours')}`,
                    click: () => this.startSleepTimer(60)
                },
                {
                    label: `2 ${this.i18n.t('hours')}`,
                    click: () => this.startSleepTimer(120)
                },
                { type: 'separator' },
                {
                    label: this.i18n.t('stopTimer'),
                    click: () => this.stopSleepTimer(),
                    enabled: this.sleepTimer.isActive
                }
            ]
        },
        { type: 'separator' },
        {
            label: this.i18n.t('settings'),
            submenu: [
                {
                    label: 'Deutsch',
                    type: 'radio',
                    checked: this.i18n.getCurrentLanguage() === 'de',
                    click: () => {
                        this.i18n.setLanguage('de');
                        this.notifyLanguageChange('de');
                    }
                },
                {
                    label: 'English',
                    type: 'radio', 
                    checked: this.i18n.getCurrentLanguage() === 'en',
                    click: () => {
                        this.i18n.setLanguage('en');
                        this.notifyLanguageChange('en');
                    }
                }
            ]
        },
        {
            label: this.i18n.t('about'),
            click: () => {
                const { shell } = require('electron');
                shell.openExternal('https://github.com/Avacon00/spoteyfa');
            }
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: this.mainWindow });
};

AppleSpotifyPlayer.prototype.pinToCorner = function(corner) {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const [windowWidth, windowHeight] = this.mainWindow.getSize();
    const margin = 20;
    
    let x, y;
    
    switch (corner) {
        case 'top-left':
            x = margin;
            y = margin;
            break;
        case 'top-right':
            x = screenWidth - windowWidth - margin;
            y = margin;
            break;
        case 'bottom-left':
            x = margin;
            y = screenHeight - windowHeight - margin;
            break;
        case 'bottom-right':
            x = screenWidth - windowWidth - margin;
            y = screenHeight - windowHeight - margin;
            break;
        default:
            return;
    }
    
    this.mainWindow.setPosition(x, y);
    console.log(`📍 Pinned to ${corner}: (${x}, ${y})`);
};

// Multi-Monitor Support Implementation
AppleSpotifyPlayer.prototype.initMultiMonitorSupport = function() {
    console.log('🖥️ Initializing multi-monitor support...');
    this.updateDisplayInfo();
    
    // Listen for display changes
    screen.on('display-added', () => {
        console.log('🖥️ Display added');
        this.updateDisplayInfo();
    });
    
    screen.on('display-removed', () => {
        console.log('🖥️ Display removed'); 
        this.updateDisplayInfo();
        this.ensureWindowVisible();
    });
    
    screen.on('display-metrics-changed', () => {
        console.log('🖥️ Display metrics changed');
        this.updateDisplayInfo();
    });
};

AppleSpotifyPlayer.prototype.updateDisplayInfo = function() {
    const displays = screen.getAllDisplays();
    this.monitorManager.displayBounds = {};
    
    displays.forEach((display, index) => {
        this.monitorManager.displayBounds[display.id] = {
            index: index,
            bounds: display.bounds,
            workArea: display.workAreaSize,
            scaleFactor: display.scaleFactor,
            isPrimary: display === screen.getPrimaryDisplay()
        };
    });
    
    console.log(`🖥️ Updated info for ${displays.length} displays`);
};

AppleSpotifyPlayer.prototype.getBestDisplayForWindow = function() {
    const displays = screen.getAllDisplays();
    
    // Try to use saved position if available
    if (this.monitorManager.savedPositions.lastDisplay) {
        const savedDisplay = displays.find(d => d.id === this.monitorManager.savedPositions.lastDisplay);
        if (savedDisplay) {
            return savedDisplay;
        }
    }
    
    // Default to primary display
    return screen.getPrimaryDisplay();
};

AppleSpotifyPlayer.prototype.calculateOptimalX = function(display, windowWidth) {
    const margin = 20;
    const savedPosition = this.monitorManager.savedPositions[display.id];
    
    if (savedPosition && savedPosition.x !== undefined) {
        return display.bounds.x + savedPosition.x;
    }
    
    // Default: right side of screen with margin
    return display.bounds.x + display.workAreaSize.width - windowWidth - margin;
};

AppleSpotifyPlayer.prototype.calculateOptimalY = function(display, windowHeight) {
    const margin = 30;
    const savedPosition = this.monitorManager.savedPositions[display.id];
    
    if (savedPosition && savedPosition.y !== undefined) {
        return display.bounds.y + savedPosition.y;
    }
    
    // Default: top with margin
    return display.bounds.y + margin;
};

AppleSpotifyPlayer.prototype.setupMultiMonitorEvents = function() {
    if (!this.mainWindow) return;
    
    // Track window position changes
    this.mainWindow.on('moved', () => {
        const [x, y] = this.mainWindow.getPosition();
        const currentDisplay = screen.getDisplayMatching(this.mainWindow.getBounds());
        
        // Save relative position for this display
        this.monitorManager.savedPositions[currentDisplay.id] = {
            x: x - currentDisplay.bounds.x,
            y: y - currentDisplay.bounds.y
        };
        this.monitorManager.savedPositions.lastDisplay = currentDisplay.id;
        
        console.log(`🖥️ Window moved on display ${currentDisplay.id}: (${x}, ${y})`);
    });
};

AppleSpotifyPlayer.prototype.ensureWindowVisible = function() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    
    const windowBounds = this.mainWindow.getBounds();
    const displays = screen.getAllDisplays();
    
    // Check if window is visible on any display
    const isVisible = displays.some(display => {
        const displayBounds = display.bounds;
        return windowBounds.x < displayBounds.x + displayBounds.width &&
               windowBounds.x + windowBounds.width > displayBounds.x &&
               windowBounds.y < displayBounds.y + displayBounds.height &&
               windowBounds.y + windowBounds.height > displayBounds.y;
    });
    
    if (!isVisible) {
        console.log('⚠️ Window not visible, repositioning...');
        const primaryDisplay = screen.getPrimaryDisplay();
        const x = this.calculateOptimalX(primaryDisplay, windowBounds.width);
        const y = this.calculateOptimalY(primaryDisplay, windowBounds.height);
        this.mainWindow.setPosition(x, y);
    }
};

// Auto-Updater Implementation
AppleSpotifyPlayer.prototype.initAutoUpdater = function() {
    console.log('🔄 Initializing auto-updater...');
    
    // Configure auto-updater
    autoUpdater.checkForUpdatesAndNotify();
    
    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
        console.log('🔍 Checking for updates...');
    });
    
    autoUpdater.on('update-available', (info) => {
        console.log(`📥 Update available: ${info.version}`);
        this.notifyUpdateAvailable(info);
    });
    
    autoUpdater.on('update-not-available', (info) => {
        console.log('✅ App is up to date');
    });
    
    autoUpdater.on('error', (err) => {
        console.log('❌ Auto-updater error:', err);
    });
    
    autoUpdater.on('download-progress', (progressObj) => {
        const percent = Math.round(progressObj.percent);
        console.log(`⬇️ Download progress: ${percent}%`);
        this.notifyUpdateProgress(percent);
    });
    
    autoUpdater.on('update-downloaded', (info) => {
        console.log(`✅ Update downloaded: ${info.version}`);
        this.notifyUpdateReady(info);
    });
    
    // Check for updates every 2 hours
    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 2 * 60 * 60 * 1000);
};

AppleSpotifyPlayer.prototype.notifyUpdateAvailable = function(info) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes
        });
    }
};

AppleSpotifyPlayer.prototype.notifyUpdateProgress = function(percent) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-progress', percent);
    }
};

AppleSpotifyPlayer.prototype.notifyUpdateReady = function(info) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-ready', {
            version: info.version
        });
    }
};

// Focus Mode Implementation
AppleSpotifyPlayer.prototype.initFocusMode = function() {
    console.log('🎯 Initializing focus mode...');
    
    // Check for fullscreen apps every 3 seconds
    this.focusMode.checkInterval = setInterval(() => {
        if (this.focusMode.isEnabled) {
            this.checkForFullscreenApps();
        }
    }, 3000);
};

AppleSpotifyPlayer.prototype.checkForFullscreenApps = function() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    
    const now = Date.now();
    if (now - this.focusMode.lastFocusCheck < 2000) return; // Throttle checks
    this.focusMode.lastFocusCheck = now;
    
    try {
        // Platform-specific fullscreen detection
        if (process.platform === 'win32') {
            this.checkWindowsFullscreen();
        } else if (process.platform === 'darwin') {
            this.checkMacFullscreen();
        } else {
            this.checkLinuxFullscreen();
        }
    } catch (error) {
        // Silent error handling for focus mode
    }
};

AppleSpotifyPlayer.prototype.checkWindowsFullscreen = function() {
    const { exec } = require('child_process');
    
    // Check for fullscreen windows using PowerShell
    const command = `powershell "Get-Process | Where-Object {$_.MainWindowTitle -ne ''} | Select-Object ProcessName,MainWindowTitle | ConvertTo-Json"`;
    
    exec(command, { timeout: 1000 }, (error, stdout) => {
        if (error) return;
        
        try {
            const processes = JSON.parse(stdout);
            const processArray = Array.isArray(processes) ? processes : [processes];
            
            const hasFullscreenApp = processArray.some(proc => {
                if (!proc || !proc.ProcessName) return false;
                const processName = proc.ProcessName.toLowerCase();
                const windowTitle = (proc.MainWindowTitle || '').toLowerCase();
                
                return this.focusMode.fullscreenApps.some(app => 
                    processName.includes(app) || windowTitle.includes(app)
                ) || windowTitle.includes('fullscreen');
            });
            
            this.handleFullscreenState(hasFullscreenApp);
        } catch (parseError) {
            // Silent error handling
        }
    });
};

AppleSpotifyPlayer.prototype.checkMacFullscreen = function() {
    const { exec } = require('child_process');
    
    // Check for fullscreen apps on macOS
    const command = `osascript -e 'tell application "System Events" to get name of processes whose frontmost is true'`;
    
    exec(command, { timeout: 1000 }, (error, stdout) => {
        if (error) return;
        
        const frontmostApp = stdout.trim().toLowerCase();
        const hasFullscreenApp = this.focusMode.fullscreenApps.some(app => 
            frontmostApp.includes(app)
        );
        
        this.handleFullscreenState(hasFullscreenApp);
    });
};

AppleSpotifyPlayer.prototype.checkLinuxFullscreen = function() {
    const { exec } = require('child_process');
    
    // Check for fullscreen windows on Linux
    const command = `xprop -root _NET_ACTIVE_WINDOW | cut -d' ' -f5`;
    
    exec(command, { timeout: 1000 }, (error, stdout) => {
        if (error) return;
        
        const windowId = stdout.trim();
        if (windowId && windowId !== '0x0') {
            exec(`xprop -id ${windowId} WM_NAME`, { timeout: 1000 }, (error, stdout) => {
                if (error) return;
                
                const windowName = stdout.toLowerCase();
                const hasFullscreenApp = this.focusMode.fullscreenApps.some(app => 
                    windowName.includes(app)
                );
                
                this.handleFullscreenState(hasFullscreenApp);
            });
        }
    });
};

AppleSpotifyPlayer.prototype.handleFullscreenState = function(isFullscreenAppActive) {
    if (isFullscreenAppActive && this.isVisible) {
        console.log('🎯 Fullscreen app detected, hiding player');
        this.focusMode.wasVisible = true;
        this.hideWithAnimation();
    } else if (!isFullscreenAppActive && this.focusMode.wasVisible && !this.isVisible) {
        console.log('🎯 Fullscreen app closed, showing player');
        this.focusMode.wasVisible = false;
        setTimeout(() => {
            this.showWithAnimation();
        }, 500); // Brief delay to ensure smooth transition
    }
};

// Sleep Timer Implementation
AppleSpotifyPlayer.prototype.startSleepTimer = function(minutes) {
    console.log(`😴 Starting sleep timer for ${minutes} minutes`);
    
    // Stop existing timer if running
    this.stopSleepTimer();
    
    const totalSeconds = minutes * 60;
    this.sleepTimer.isActive = true;
    this.sleepTimer.totalTime = totalSeconds;
    this.sleepTimer.remainingTime = totalSeconds;
    
    // Update timer every second
    this.sleepTimer.updateInterval = setInterval(() => {
        this.sleepTimer.remainingTime--;
        
        // Send update to renderer
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('sleep-timer-update', {
                remainingTime: this.sleepTimer.remainingTime,
                totalTime: this.sleepTimer.totalTime
            });
        }
        
        // Check if timer expired
        if (this.sleepTimer.remainingTime <= 0) {
            this.executeSleepTimer();
        }
    }, 1000);
    
    // Set main timeout as backup
    this.sleepTimer.timeoutId = setTimeout(() => {
        this.executeSleepTimer();
    }, totalSeconds * 1000);
    
    // Notify renderer
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('sleep-timer-started', {
            minutes: minutes,
            totalTime: totalSeconds
        });
    }
};

AppleSpotifyPlayer.prototype.stopSleepTimer = function() {
    if (this.sleepTimer.isActive) {
        console.log('⏹️ Stopping sleep timer');
        
        this.sleepTimer.isActive = false;
        
        if (this.sleepTimer.timeoutId) {
            clearTimeout(this.sleepTimer.timeoutId);
            this.sleepTimer.timeoutId = null;
        }
        
        if (this.sleepTimer.updateInterval) {
            clearInterval(this.sleepTimer.updateInterval);
            this.sleepTimer.updateInterval = null;
        }
        
        this.sleepTimer.remainingTime = 0;
        this.sleepTimer.totalTime = 0;
        
        // Notify renderer
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('sleep-timer-stopped');
        }
    }
};

AppleSpotifyPlayer.prototype.executeSleepTimer = function() {
    console.log('😴 Sleep timer expired - pausing Spotify');
    
    // Stop the timer
    this.stopSleepTimer();
    
    // Send pause command to Spotify
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('execute-sleep-timer');
    }
    
    // Show notification
    this.showSleepTimerNotification();
};

AppleSpotifyPlayer.prototype.showSleepTimerNotification = function() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        // Show player briefly to display notification
        if (!this.isVisible) {
            this.showWithAnimation();
        }
        
        this.mainWindow.webContents.send('show-sleep-notification', {
            message: this.i18n.t('sleepTimerExpired'),
            duration: 5000
        });
        
        // Auto-hide after showing notification
        setTimeout(() => {
            if (this.isVisible) {
                this.scheduleAutoHide(5000);
            }
        }, 1000);
    }
};

// Language change notification
AppleSpotifyPlayer.prototype.notifyLanguageChange = function(language) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('language-changed', language);
    }
};

// Platform Integration Implementation
AppleSpotifyPlayer.prototype.initPlatformIntegration = function() {
    console.log(`🖥️ Initializing platform integration for ${process.platform}...`);
    
    if (process.platform === 'darwin') {
        this.initMacOSIntegration();
    } else if (process.platform === 'win32') {
        this.initWindowsIntegration();
    } else if (process.platform === 'linux') {
        this.initLinuxIntegration();
    }
};

AppleSpotifyPlayer.prototype.initMacOSIntegration = function() {
    console.log('🍎 Setting up macOS integration...');
    
    // Native macOS media controls
    if (app.dock) {
        app.dock.setIcon(path.join(__dirname, 'assets/icon-mac.png'));
    }
    
    // macOS-specific keyboard shortcuts
    const { globalShortcut } = require('electron');
    
    // Register global shortcuts for media control
    globalShortcut.register('MediaPlayPause', () => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('global-play-pause');
        }
    });
    
    globalShortcut.register('MediaNextTrack', () => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('global-next-track');
        }
    });
    
    globalShortcut.register('MediaPreviousTrack', () => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('global-previous-track');
        }
    });
};

AppleSpotifyPlayer.prototype.initWindowsIntegration = function() {
    console.log('🪟 Setting up Windows integration...');
    
    // Windows 11 rounded corners
    if (this.mainWindow) {
        try {
            // Enable Windows 11 style rounded corners
            const dwmapi = require('child_process');
            const windowHandle = this.mainWindow.getNativeWindowHandle();
            
            // Try to apply Windows 11 rounded corners
            dwmapi.exec(`powershell -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport(\\\"dwmapi.dll\\\")] public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize); }'; [Win32]::DwmSetWindowAttribute(${windowHandle}, 33, [ref]2, 4)"`, (error) => {
                if (error) {
                    console.log('ℹ️ Windows 11 rounded corners not available');
                } else {
                    console.log('✅ Applied Windows 11 rounded corners');
                }
            });
        } catch (error) {
            console.log('ℹ️ Advanced Windows integration not available');
        }
    }
    
    // Windows taskbar progress
    this.setupWindowsTaskbarIntegration();
};

AppleSpotifyPlayer.prototype.initLinuxIntegration = function() {
    console.log('🐧 Setting up Linux integration...');
    
    // MPRIS D-Bus integration for media controls
    try {
        const { exec } = require('child_process');
        
        // Check if we can register as MPRIS player
        exec('which dbus-send', (error) => {
            if (!error) {
                console.log('✅ D-Bus available for MPRIS integration');
                this.setupMPRISIntegration();
            } else {
                console.log('ℹ️ D-Bus not available, skipping MPRIS integration');
            }
        });
    } catch (error) {
        console.log('ℹ️ MPRIS integration not available');
    }
};

AppleSpotifyPlayer.prototype.setupWindowsTaskbarIntegration = function() {
    if (this.mainWindow && process.platform === 'win32') {
        // Set taskbar progress when playing
        this.mainWindow.setProgressBar(0, { mode: 'none' });
        
        // Update taskbar based on play state
        if (this.mainWindow.webContents) {
            this.mainWindow.webContents.on('did-finish-load', () => {
                // Setup taskbar thumbnail toolbar
                this.mainWindow.setThumbarButtons([
                    {
                        tooltip: 'Previous',
                        icon: path.join(__dirname, 'assets/prev-icon.png'),
                        click: () => {
                            this.mainWindow.webContents.send('taskbar-previous');
                        }
                    },
                    {
                        tooltip: 'Play/Pause',
                        icon: path.join(__dirname, 'assets/play-icon.png'),
                        click: () => {
                            this.mainWindow.webContents.send('taskbar-play-pause');
                        }
                    },
                    {
                        tooltip: 'Next',
                        icon: path.join(__dirname, 'assets/next-icon.png'),
                        click: () => {
                            this.mainWindow.webContents.send('taskbar-next');
                        }
                    }
                ]);
            });
        }
    }
};

AppleSpotifyPlayer.prototype.setupMPRISIntegration = function() {
    // Linux MPRIS D-Bus integration
    const { exec } = require('child_process');
    
    // Register as MPRIS media player
    const mprisSetup = `
        dbus-send --session --type=method_call \\
        --dest=org.freedesktop.DBus /org/freedesktop/DBus \\
        org.freedesktop.DBus.RequestName \\
        string:org.mpris.MediaPlayer2.spoteyfa uint32:0
    `;
    
    exec(mprisSetup, (error) => {
        if (!error) {
            console.log('✅ Registered as MPRIS media player');
        }
    });
};