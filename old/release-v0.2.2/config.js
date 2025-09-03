// Secure Configuration Management for Spotify Player
const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class SecureConfig {
    constructor() {
        this.config = {};
        this.loadConfig();
    }
    
    loadConfig() {
        // 1. Try to load from .env file (development)
        this.loadFromEnvFile();
        
        // 2. Try to load from user data directory (production)
        this.loadFromUserData();
        
        // 3. Fallback to default values
        this.setDefaults();
    }
    
    loadFromEnvFile() {
        try {
            const envPath = path.join(__dirname, '.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const lines = envContent.split('\n');
                
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        const [key, value] = trimmed.split('=');
                        if (key && value) {
                            process.env[key.trim()] = value.trim();
                        }
                    }
                });
                
                console.log('🔐 Loaded configuration from .env file');
            }
        } catch (error) {
            console.log('⚠️ Could not load .env file:', error.message);
        }
    }
    
    loadFromUserData() {
        try {
            const userDataPath = app.getPath('userData');
            const configPath = path.join(userDataPath, 'spotify-config.json');
            
            if (fs.existsSync(configPath)) {
                const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                
                // Decrypt stored credentials (basic obfuscation for local storage)
                if (configData.spotify_client_id) {
                    this.config.clientId = this.decrypt(configData.spotify_client_id);
                }
                if (configData.spotify_client_secret) {
                    this.config.clientSecret = this.decrypt(configData.spotify_client_secret);
                }
                
                console.log('🔐 Loaded encrypted configuration from user data');
            }
        } catch (error) {
            console.log('⚠️ Could not load user data config:', error.message);
        }
    }
    
    setDefaults() {
        // Environment variables take precedence
        this.config.clientId = process.env.SPOTIFY_CLIENT_ID || 
                              this.config.clientId || 
                              '775fb3995b714b2e91ddd0c4c36861d9';
                              
        this.config.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || 
                                   this.config.clientSecret || 
                                   '2c01cacdc1fe4f9d98f3910627508d4e';
                                   
        this.config.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 
                                  'http://127.0.0.1:8888/callback';
                                  
        this.config.nodeEnv = process.env.NODE_ENV || 'production';
        this.config.debug = process.env.ELECTRON_DEBUG === 'true';
    }
    
    // Simple encryption/decryption for local storage (not for production secrets!)
    encrypt(text) {
        // Simple Base64 encoding with basic obfuscation
        const encoded = Buffer.from(text).toString('base64');
        return encoded.split('').reverse().join('');
    }
    
    decrypt(encrypted) {
        try {
            const reversed = encrypted.split('').reverse().join('');
            return Buffer.from(reversed, 'base64').toString('utf8');
        } catch (error) {
            return encrypted; // Return as-is if decryption fails
        }
    }
    
    saveToUserData(clientId, clientSecret) {
        try {
            const userDataPath = app.getPath('userData');
            const configPath = path.join(userDataPath, 'spotify-config.json');
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(userDataPath)) {
                fs.mkdirSync(userDataPath, { recursive: true });
            }
            
            const configData = {
                spotify_client_id: this.encrypt(clientId),
                spotify_client_secret: this.encrypt(clientSecret),
                updated_at: new Date().toISOString()
            };
            
            fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
            
            // Update current config
            this.config.clientId = clientId;
            this.config.clientSecret = clientSecret;
            
            console.log('🔐 Saved encrypted configuration to user data');
            return true;
        } catch (error) {
            console.error('❌ Failed to save configuration:', error);
            return false;
        }
    }
    
    getSpotifyConfig() {
        return {
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            redirectUri: this.config.redirectUri
        };
    }
    
    isConfigured() {
        return this.config.clientId && 
               this.config.clientId !== 'your_spotify_client_id_here' &&
               !this.config.clientId.includes('*TRAGE HIER') &&
               this.config.clientSecret && 
               this.config.clientSecret !== 'your_spotify_client_secret_here' &&
               !this.config.clientSecret.includes('*TRAGE HIER');
    }
    
    isDevelopment() {
        return this.config.nodeEnv === 'development' || this.config.debug;
    }
}

// Export singleton instance
const config = new SecureConfig();
module.exports = config;