// Internationalization (i18n) Module für SPOTEYFA
// Unterstützt Deutsch (DE) und Englisch (EN)

class I18n {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {
            de: {
                // UI Labels
                loading: 'Wird geladen...',
                pleaseWait: 'Bitte warten',
                spotifyPlayer: 'Spotify Player',
                
                // Controls
                play: 'Abspielen',
                pause: 'Pausieren',
                next: 'Weiter',
                previous: 'Zurück',
                
                // Time
                minutes: 'Minuten',
                hours: 'Stunden',
                seconds: 'Sekunden',
                
                // Context Menu
                alwaysOnTop: 'Immer im Vordergrund',
                hideFor5Min: '5 Minuten ausblenden',
                hideFor15Min: '15 Minuten ausblenden',
                pinToCorner: 'An Ecke heften',
                topLeft: 'Oben links',
                topRight: 'Oben rechts',
                bottomLeft: 'Unten links',
                bottomRight: 'Unten rechts',
                sleepTimer: 'Sleep Timer',
                stopTimer: 'Timer stoppen',
                settings: 'Einstellungen',
                about: 'Über SPOTEYFA',
                
                // Sleep Timer
                sleepTimerStarted: 'Sleep Timer gestartet',
                sleepTimerStopped: 'Sleep Timer gestoppt',
                sleepTimerExpired: 'Sleep Timer: Musik wurde pausiert',
                
                // Focus Mode
                focusModeEnabled: 'Fokus-Modus aktiviert',
                focusModeDisabled: 'Fokus-Modus deaktiviert',
                fullscreenDetected: 'Vollbild-App erkannt, Player ausgeblendet',
                fullscreenClosed: 'Vollbild-App geschlossen, Player angezeigt',
                
                // Updates
                updateAvailable: 'Update verfügbar',
                updateDownloading: 'Update wird heruntergeladen',
                updateReady: 'Update bereit zur Installation',
                restartAndInstall: 'Neustarten und installieren',
                
                // Setup
                setupWizard: 'Einrichtungsassistent',
                welcome: 'Willkommen',
                spotifySetup: 'Spotify einrichten',
                credentials: 'Zugangsdaten',
                clientId: 'Client ID',
                clientSecret: 'Client Secret',
                validate: 'Validieren',
                
                // Notifications
                authSuccess: 'Spotify Authentifizierung erfolgreich',
                authFailed: 'Spotify Authentifizierung fehlgeschlagen',
                connectionError: 'Verbindungsfehler',
                
                // Theme
                darkMode: 'Dunkler Modus',
                lightMode: 'Heller Modus'
            },
            
            en: {
                // UI Labels
                loading: 'Loading...',
                pleaseWait: 'Please wait',
                spotifyPlayer: 'Spotify Player',
                
                // Controls
                play: 'Play',
                pause: 'Pause',
                next: 'Next',
                previous: 'Previous',
                
                // Time
                minutes: 'minutes',
                hours: 'hours',
                seconds: 'seconds',
                
                // Context Menu
                alwaysOnTop: 'Always on Top',
                hideFor5Min: 'Hide for 5 minutes',
                hideFor15Min: 'Hide for 15 minutes',
                pinToCorner: 'Pin to Corner',
                topLeft: 'Top Left',
                topRight: 'Top Right',
                bottomLeft: 'Bottom Left',
                bottomRight: 'Bottom Right',
                sleepTimer: 'Sleep Timer',
                stopTimer: 'Stop Timer',
                settings: 'Settings',
                about: 'About SPOTEYFA',
                
                // Sleep Timer
                sleepTimerStarted: 'Sleep timer started',
                sleepTimerStopped: 'Sleep timer stopped',
                sleepTimerExpired: 'Sleep Timer: Music paused',
                
                // Focus Mode
                focusModeEnabled: 'Focus mode enabled',
                focusModeDisabled: 'Focus mode disabled',
                fullscreenDetected: 'Fullscreen app detected, player hidden',
                fullscreenClosed: 'Fullscreen app closed, player shown',
                
                // Updates
                updateAvailable: 'Update available',
                updateDownloading: 'Downloading update',
                updateReady: 'Update ready to install',
                restartAndInstall: 'Restart and install',
                
                // Setup
                setupWizard: 'Setup Wizard',
                welcome: 'Welcome',
                spotifySetup: 'Setup Spotify',
                credentials: 'Credentials',
                clientId: 'Client ID',
                clientSecret: 'Client Secret',
                validate: 'Validate',
                
                // Notifications
                authSuccess: 'Spotify authentication successful',
                authFailed: 'Spotify authentication failed',
                connectionError: 'Connection error',
                
                // Theme
                darkMode: 'Dark Mode',
                lightMode: 'Light Mode'
            }
        };
    }
    
    detectLanguage() {
        // Check if we're in main process (no localStorage) or renderer process
        if (typeof localStorage === 'undefined') {
            // Main process - use OS locale or default to German for Windows
            const os = require('os');
            const locale = os.platform() === 'win32' ? 'de' : 'en';
            return locale;
        }
        
        // Renderer process - check saved preference
        const savedLang = localStorage.getItem('spoteyfa-language');
        if (savedLang && this.translations[savedLang]) {
            return savedLang;
        }
        
        // Check system language
        const systemLang = navigator.language || navigator.userLanguage || 'en';
        if (systemLang.startsWith('de')) {
            return 'de';
        }
        
        // Default to English
        return 'en';
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            // Only save to localStorage in renderer process
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('spoteyfa-language', lang);
            }
            console.log(`🌐 Language set to: ${lang}`);
            return true;
        }
        return false;
    }
    
    t(key) {
        const translation = this.translations[this.currentLanguage]?.[key];
        if (translation) {
            return translation;
        }
        
        // Fallback to English
        const fallback = this.translations['en']?.[key];
        if (fallback) {
            console.warn(`⚠️ Missing ${this.currentLanguage} translation for: ${key}`);
            return fallback;
        }
        
        // Return key if no translation found
        console.warn(`❌ No translation found for key: ${key}`);
        return key;
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
} else {
    window.I18n = I18n;
}