// Sichere Konfigurationsverwaltung für Spoteyfa
const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigManager {
    constructor() {
        this.configDir = path.join(os.homedir(), '.spoteyfa');
        this.configFile = path.join(this.configDir, 'config.json');
        this.defaultConfig = {
            setupCompleted: false,
            clientId: null,
            clientSecret: null,
            theme: 'light',
            autoHide: true,
            autoHideDelay: 12000
        };
        
        this.ensureConfigDir();
    }
    
    ensureConfigDir() {
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
            console.log('📁 Created config directory:', this.configDir);
        }
    }
    
    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
                return { ...this.defaultConfig, ...config };
            }
        } catch (error) {
            console.error('❌ Error loading config:', error);
        }
        
        return { ...this.defaultConfig };
    }
    
    saveConfig(config) {
        try {
            const configToSave = { ...this.loadConfig(), ...config };
            fs.writeFileSync(this.configFile, JSON.stringify(configToSave, null, 2));
            console.log('💾 Config saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving config:', error);
            return false;
        }
    }
    
    isFirstRun() {
        const config = this.loadConfig();
        return !config.setupCompleted;
    }
    
    markSetupCompleted(clientId, clientSecret) {
        return this.saveConfig({
            setupCompleted: true,
            clientId: clientId,
            clientSecret: clientSecret
        });
    }
    
    getCredentials() {
        const config = this.loadConfig();
        return {
            clientId: config.clientId,
            clientSecret: config.clientSecret
        };
    }
    
    resetConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                fs.unlinkSync(this.configFile);
                console.log('🗑️ Config file deleted');
            }
            return true;
        } catch (error) {
            console.error('❌ Error resetting config:', error);
            return false;
        }
    }
    
    updateTheme(theme) {
        return this.saveConfig({ theme: theme });
    }
    
    getTheme() {
        const config = this.loadConfig();
        return config.theme;
    }
    
    updateAutoHideSettings(autoHide, delay) {
        return this.saveConfig({
            autoHide: autoHide,
            autoHideDelay: delay
        });
    }
    
    getAutoHideSettings() {
        const config = this.loadConfig();
        return {
            autoHide: config.autoHide,
            delay: config.autoHideDelay
        };
    }
}

module.exports = ConfigManager;