// Setup Wizard - Spotify Developer Credentials Setup
// Handles first-time setup for user-provided API credentials

class SetupWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        
        // Initialize wizard on page load
        this.init();
    }
    
    init() {
        console.log('🧙‍♂️ Setup Wizard initialized');
        
        // Check if setup is needed
        if (this.needsSetup()) {
            console.log('🔧 First-time setup required');
            this.showWizard();
        } else {
            console.log('✅ Setup already completed');
            this.hideWizard();
        }
    }
    
    needsSetup() {
        // Check if user has already provided their credentials
        const clientId = localStorage.getItem('spotify_client_id');
        const clientSecret = localStorage.getItem('spotify_client_secret');
        
        // Return true if credentials are missing or invalid
        return !clientId || !clientSecret || 
               clientId === '*TRAGE HIER DEINE CLIENT_ID EIN*' ||
               clientSecret === '*TRAGE HIER DEINE CLIENT_SECRET EIN*';
    }
    
    showWizard() {
        const wizard = document.getElementById('setupWizard');
        const player = document.getElementById('playerWidget');
        
        if (wizard && player) {
            wizard.style.display = 'block';
            player.style.display = 'none';
        }
        
        this.showStep(1);
    }
    
    hideWizard() {
        const wizard = document.getElementById('setupWizard');
        const player = document.getElementById('playerWidget');
        
        console.log('🎭 Hiding wizard, showing player');
        console.log('Wizard element:', wizard);
        console.log('Player element:', player);
        
        if (wizard && player) {
            wizard.style.display = 'none';
            player.style.display = 'block';
            player.style.opacity = '1';
            player.style.visibility = 'visible';
            
            // Add player-active class to body for background
            document.body.classList.add('player-active');
            console.log('🎨 Added player-active class to body');
            
            console.log('✅ Player should now be visible');
            console.log('Player display:', player.style.display);
            console.log('Player opacity:', player.style.opacity);
        } else {
            console.error('❌ Missing wizard or player element!');
        }
    }
    
    showStep(stepNumber) {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.style.display = 'none';
            }
        }
        
        // Show current step
        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.style.display = 'block';
        }
        
        this.currentStep = stepNumber;
        console.log(`📍 Showing step ${stepNumber}/${this.totalSteps}`);
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    openSpotifyDev() {
        console.log('🌐 Opening Spotify Developer Dashboard');
        const { shell } = require('electron');
        shell.openExternal('https://developer.spotify.com/dashboard');
    }
    
    showHelp(field) {
        const tooltip = document.getElementById(`help${field.charAt(0).toUpperCase() + field.slice(1)}`);
        
        if (tooltip) {
            // Hide all other tooltips first
            document.querySelectorAll('.help-tooltip').forEach(tip => {
                tip.style.display = 'none';
            });
            
            // Show this tooltip
            tooltip.style.display = 'block';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 3000);
        }
    }
    
    togglePassword() {
        const input = document.getElementById('clientSecret');
        const button = document.querySelector('.show-password');
        
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
        } else {
            input.type = 'password';
            button.textContent = '👁';
        }
    }
    
    async validateAndStart() {
        const clientId = document.getElementById('clientId').value.trim();
        const clientSecret = document.getElementById('clientSecret').value.trim();
        
        console.log('🔍 Validating credentials...');
        
        // Basic validation
        if (!clientId || !clientSecret) {
            this.showValidationError('Bitte gib sowohl die Client ID als auch das Client Secret ein');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Test the credentials with a simple API call
            const isValid = await this.testCredentials(clientId, clientSecret);
            
            if (isValid) {
                // Save credentials
                localStorage.setItem('spotify_client_id', clientId);
                localStorage.setItem('spotify_client_secret', clientSecret);
                
                console.log('✅ Credentials validated and saved');
                this.showValidationSuccess('Zugangsdaten erfolgreich validiert!');
                
                // Start the player after a short delay
                setTimeout(() => {
                    this.completeSetup();
                }, 1500);
                
            } else {
                this.showValidationError('Ungültige Zugangsdaten. Bitte überprüfe deine Client ID und dein Client Secret.');
            }
            
        } catch (error) {
            console.error('❌ Credential validation error:', error);
            this.showValidationError('Zugangsdaten können nicht validiert werden. Bitte überprüfe deine Internetverbindung und versuche es erneut.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async testCredentials(clientId, clientSecret) {
        try {
            // Test with Spotify's token endpoint
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials'
                })
            });
            
            // If we get a successful response, credentials are valid
            return response.ok;
            
        } catch (error) {
            console.error('Credential test failed:', error);
            return false;
        }
    }
    
    setLoadingState(loading) {
        const button = document.getElementById('startBtn');
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.spinner');
        
        if (loading) {
            button.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            this.showValidationLoading('Validiere Zugangsdaten...');
        } else {
            button.disabled = false;
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
        }
    }
    
    showValidationSuccess(message) {
        this.showValidationMessage(message, 'success');
    }
    
    showValidationError(message) {
        this.showValidationMessage(message, 'error');
    }
    
    showValidationLoading(message) {
        this.showValidationMessage(message, 'loading');
    }
    
    showValidationMessage(message, type) {
        const statusDiv = document.getElementById('validationStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `validation-status ${type}`;
            statusDiv.style.display = 'block';
        }
    }
    
    completeSetup() {
        console.log('🎉 Setup completed successfully');
        
        // Hide wizard and show player first
        this.hideWizard();
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('🎵 Initializing player...');
            
            // Initialize the main player
            if (window.applePlayer) {
                console.log('🔄 Cleaning up existing player');
                window.applePlayer.cleanup();
                delete window.applePlayer;
            }
            
            // Create new player instance
            try {
                console.log('🚀 Creating new AppleSpotifyPlayer instance');
                const player = new AppleSpotifyPlayer();
                window.applePlayer = player;
                console.log('✅ Player created successfully');
                
                // Force show player widget
                const playerWidget = document.getElementById('playerWidget');
                if (playerWidget) {
                    console.log('💫 Ensuring player widget visibility');
                    playerWidget.style.display = 'block';
                    playerWidget.style.opacity = '1';
                }
                
            } catch (error) {
                console.error('❌ Error creating player:', error);
            }
            
        }, 500);
    }
    
    // Reset setup (for testing or if user wants to change credentials)
    resetSetup() {
        localStorage.removeItem('spotify_client_id');
        localStorage.removeItem('spotify_client_secret');
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiry');
        
        console.log('🔄 Setup reset');
        
        // Show wizard again
        this.showWizard();
        this.showStep(1);
    }
}

// Global functions for HTML onclick handlers
let setupWizard;

function nextStep() {
    setupWizard.nextStep();
}

function prevStep() {
    setupWizard.prevStep();
}

function openSpotifyDev() {
    setupWizard.openSpotifyDev();
}

function showHelp(field) {
    setupWizard.showHelp(field);
}

function togglePassword() {
    setupWizard.togglePassword();
}

function validateAndStart() {
    setupWizard.validateAndStart();
}

// Initialize wizard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧙‍♂️ Initializing Setup Wizard');
    setupWizard = new SetupWizard();
});

// Export for use by main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SetupWizard;
}