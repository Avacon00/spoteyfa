// Apple-Style Spotify Player - FUNKTIONIERENDE VERSION
const { ipcRenderer } = require('electron');

class AppleSpotifyPlayer {
    constructor() {
        // Spotify integration
        this.spotifyToken = null;
        this.currentTrack = null;
        this.isPlaying = true;
        this.progressValue = 0;
        
        // OAuth state
        this.isOAuthMode = false;
        
        // Progress tracking
        this.progressInterval = null;
        this.lastProgressUpdate = 0;
        this.lastServerProgress = 0;
        this.localProgressStart = 0;
        
        // Monitoring
        this.monitoringInterval = null;
        this.currentPollingInterval = 2000; // Dynamic polling interval
        this.isUserActive = true; // Track user activity
        this.lastUserActivity = Date.now();
        
        // DOM elements
        this.elements = {
            closeBtn: document.getElementById('closeBtn'),
            playBtn: document.getElementById('playBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            
            songTitle: document.getElementById('songTitle'),
            artistName: document.getElementById('artistName'),
            albumName: document.getElementById('albumName'),
            
            coverImage: document.getElementById('coverImage'),
            coverPlaceholder: document.getElementById('coverPlaceholder'),
            
            progressFill: document.getElementById('progressFill'),
            volumeFill: document.getElementById('volumeFill'),
            
            timeCurrent: document.getElementById('timeCurrent'),
            timeTotal: document.getElementById('timeTotal'),
            
            themeToggle: document.getElementById('themeToggle')
        };
        
        // Theme management
        this.isDarkMode = localStorage.getItem('spotify-player-theme') === 'dark';
        
        this.init();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
    }
    
    cleanup() {
        console.log('🧹 Cleaning up resources...');
        
        // Clear all intervals and timeouts
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        // Cancel animation frames
        this.stopProgressAnimation();
        
        if (this.monitoringInterval) {
            clearTimeout(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        // Clear activity tracking interval
        if (this.activityCheckInterval) {
            clearInterval(this.activityCheckInterval);
            this.activityCheckInterval = null;
        }
        
        // Remove event listeners to prevent memory leaks
        ['click', 'keydown', 'mousemove'].forEach(event => {
            document.removeEventListener(event, this.activityHandler);
        });
        
        console.log('✅ Cleanup completed');
    }
    
    async init() {
        console.log('🍎 Apple Player gestartet');
        
        // Setup theme first
        this.initTheme();
        
        // Setup basic controls
        this.setupBasicControls();
        
        // Check for existing token first
        await this.checkExistingToken();
    }
    
    setupBasicControls() {
        // Close button
        this.elements.closeBtn.addEventListener('click', () => {
            this.cleanup(); // Clean up before closing
            ipcRenderer.send('close-player');
        });
        
        // Theme toggle button
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
            this.resetAutoHideTimer();
        });
        
        // Play/Pause
        this.elements.playBtn.addEventListener('click', () => {
            this.togglePlayPause();
            this.resetAutoHideTimer();
        });
        
        // Skip buttons
        this.elements.prevBtn.addEventListener('click', () => {
            this.spotifyPrevious();
            this.resetAutoHideTimer();
        });
        
        this.elements.nextBtn.addEventListener('click', () => {
            this.spotifyNext();
            this.resetAutoHideTimer();
        });
        
        // Progress Bar Click Handler
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                this.handleProgressBarClick(e);
                this.resetAutoHideTimer();
            });
        }
        
        // Volume Bar Click Handler
        const volumeBar = document.querySelector('.volume-bar');
        if (volumeBar) {
            volumeBar.addEventListener('click', (e) => {
                this.handleVolumeBarClick(e);
                this.resetAutoHideTimer();
            });
        }
    }
    
    async checkExistingToken() {
        console.log('🔍 Checking existing token...');
        
        // Prüfe erst ob Credentials konfiguriert sind
        const clientId = await this.getStoredClientId();
        const clientSecret = await this.getStoredClientSecret();
        
        if (!clientId || !clientSecret) {
            console.log('❌ No credentials configured');
            this.showNoCredentialsMessage();
            return;
        }
        
        const storedToken = localStorage.getItem('spotify_access_token');
        const tokenExpiry = localStorage.getItem('spotify_token_expiry');
        
        if (storedToken && tokenExpiry) {
            const expiryTime = parseInt(tokenExpiry);
            const now = Date.now();
            
            if (now < expiryTime - 300000) {
                console.log('✅ Valid token found');
                this.spotifyToken = storedToken;
                this.onOAuthSuccess();
                return;
            }
        }
        
        console.log('❌ No valid token - starting OAuth');
        this.startOAuthFlow();
    }
    
    startOAuthFlow() {
        console.log('🔐 Starting OAuth...');
        this.isOAuthMode = true;
        
        this.elements.songTitle.textContent = 'Spotify Autorisierung';
        this.elements.artistName.textContent = 'Klicke hier zum Verbinden';
        this.elements.albumName.textContent = '';
        
        this.elements.songTitle.style.cursor = 'pointer';
        this.elements.artistName.style.cursor = 'pointer';
        
        this.elements.songTitle.onclick = () => this.openSpotifyAuth();
        this.elements.artistName.onclick = () => this.openSpotifyAuth();
        
        ipcRenderer.send('show-player');
    }
    
    async openSpotifyAuth() {
        console.log('🚀 Opening Spotify auth...');
        
        const CLIENT_ID = await this.getStoredClientId();
        const REDIRECT_URI = "http://127.0.0.1:8888/callback";
        const scopes = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
        const state = Math.random().toString(36).substring(7);
        
        if (!CLIENT_ID) {
            this.showNoCredentialsMessage();
            return;
        }
        
        const authUrl = `https://accounts.spotify.com/authorize?` +
            `response_type=code&` +
            `client_id=${CLIENT_ID}&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
            `state=${state}`;
        
        this.elements.songTitle.textContent = 'Browser geöffnet...';
        this.elements.artistName.textContent = 'Autorisiere die App';
        
        require('electron').shell.openExternal(authUrl);
        this.startCallbackServer(CLIENT_ID);
    }
    
    async startCallbackServer(clientId) {
        console.log('🌐 Starting callback server...');
        
        const http = require('http');
        const url = require('url');
        
        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            
            if (parsedUrl.pathname === '/callback') {
                const code = parsedUrl.query.code;
                const error = parsedUrl.query.error;
                
                res.writeHead(200, {'Content-Type': 'text/html'});
                if (code) {
                    res.end(`
                        <html>
                            <body style="font-family: Arial; text-align: center; padding: 50px;">
                                <h2>✅ Spotify Autorisierung erfolgreich!</h2>
                                <p>Du kannst diesen Tab schließen.</p>
                            </body>
                        </html>
                    `);
                    
                    server.close();
                    this.exchangeCodeForToken(code, clientId);
                } else {
                    res.end(`<html><body><h2>❌ Fehler: ${error}</h2></body></html>`);
                    server.close();
                }
            }
        });
        
        server.listen(8888, '127.0.0.1');
    }
    
    async exchangeCodeForToken(code, clientId) {
        console.log('🔄 Exchanging code...');
        
        const CLIENT_SECRET = await this.getStoredClientSecret();
        const REDIRECT_URI = "http://127.0.0.1:8888/callback";
        
        if (!CLIENT_SECRET) {
            this.showNoCredentialsMessage();
            return;
        }
        
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + CLIENT_SECRET)
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: REDIRECT_URI
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
                localStorage.setItem('spotify_token_expiry', (Date.now() + data.expires_in * 1000).toString());
                
                this.spotifyToken = data.access_token;
                console.log('✅ Token obtained');
                
                this.onOAuthSuccess();
            }
        } catch (error) {
            console.error('❌ Token exchange error:', error);
        }
    }
    
    onOAuthSuccess() {
        console.log('🎉 OAuth successful');
        this.isOAuthMode = false;
        
        this.elements.songTitle.onclick = null;
        this.elements.artistName.onclick = null;
        
        this.elements.songTitle.textContent = 'Verbunden';
        this.elements.artistName.textContent = 'Lädt Tracks...';
        this.elements.albumName.textContent = '';
        
        this.startSpotifyMonitoring();
    }
    
    startSpotifyMonitoring() {
        console.log('🎵 Starting smart monitoring...');
        
        this.getCurrentTrack();
        this.startSmartPolling();
        
        // Start smooth progress animation
        this.startProgressAnimation();
        
        // Track user activity for smart polling
        this.setupActivityTracking();
    }
    
    startSmartPolling() {
        if (this.monitoringInterval) {
            clearTimeout(this.monitoringInterval);
        }
        
        const poll = () => {
            this.getCurrentTrack();
            
            // Dynamic interval based on activity and play state
            this.currentPollingInterval = this.calculatePollingInterval();
            
            this.monitoringInterval = setTimeout(() => poll(), this.currentPollingInterval);
        };
        
        poll();
    }
    
    calculatePollingInterval() {
        const now = Date.now();
        const timeSinceActivity = now - this.lastUserActivity;
        
        // If user was active recently (last 30 seconds), poll fast
        if (timeSinceActivity < 30000) {
            return 2000; // 2 seconds - responsive
        }
        
        // If music is playing but user inactive, medium polling
        if (this.isPlaying) {
            return 5000; // 5 seconds - save API calls
        }
        
        // If music paused and user inactive, slow polling  
        return 10000; // 10 seconds - minimal API usage
    }
    
    setupActivityTracking() {
        // Store reference for cleanup
        this.activityHandler = () => {
            this.lastUserActivity = Date.now();
            this.isUserActive = true;
            
            // Reset to fast polling temporarily
            if (this.currentPollingInterval > 2000) {
                console.log('🎯 User activity detected - increasing poll rate');
                this.startSmartPolling();
            }
        };
        
        // Track user interactions
        ['click', 'keydown', 'mousemove'].forEach(event => {
            document.addEventListener(event, this.activityHandler);
        });
        
        // Reset activity flag after some time - store interval reference
        this.activityCheckInterval = setInterval(() => {
            const timeSinceActivity = Date.now() - this.lastUserActivity;
            this.isUserActive = timeSinceActivity < 30000;
        }, 5000);
    }
    
    startProgressAnimation() {
        if (this.progressAnimationId) {
            cancelAnimationFrame(this.progressAnimationId);
        }
        
        const animate = () => {
            if (this.isPlaying && this.currentTrack && this.lastServerProgress > 0) {
                // Calculate local progress based on elapsed time since last server update
                const now = Date.now();
                const elapsed = now - this.localProgressStart;
                const currentProgress = this.lastServerProgress + elapsed;
                
                if (currentProgress <= this.currentTrack.duration) {
                    this.updateProgressBar(currentProgress, this.currentTrack.duration);
                    // Continue animation for smooth 60fps updates
                    this.progressAnimationId = requestAnimationFrame(animate);
                } else {
                    // Stop animation when track ends
                    this.stopProgressAnimation();
                }
            } else if (this.isPlaying && this.currentTrack) {
                // Keep trying to animate if playing but no progress data yet
                this.progressAnimationId = requestAnimationFrame(animate);
            }
        };
        
        // Start the animation loop
        this.progressAnimationId = requestAnimationFrame(animate);
    }
    
    stopProgressAnimation() {
        if (this.progressAnimationId) {
            cancelAnimationFrame(this.progressAnimationId);
            this.progressAnimationId = null;
        }
    }
    
    async getCurrentTrack() {
        if (!this.spotifyToken) return;
        
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${this.spotifyToken}`
                }
            });
            
            if (response.ok && response.status !== 204) {
                const data = await response.json();
                if (data && data.item) {
                    const track = {
                        id: data.item.id,
                        name: data.item.name,
                        artist: data.item.artists.map(a => a.name).join(', '),
                        album: data.item.album.name,
                        duration: data.item.duration_ms,
                        progress: data.progress_ms,
                        is_playing: data.is_playing,
                        image_url: data.item.album.images[0]?.url,
                        external_url: data.item.external_urls.spotify
                    };
                    
                    if (!this.currentTrack || track.id !== this.currentTrack.id) {
                        console.log(`🔄 New track: ${track.name}`);
                        ipcRenderer.send('show-player');
                        this.currentTrack = track;
                        this.updateTrackDisplay();
                    }
                    
                    this.isPlaying = track.is_playing;
                    this.updatePlayButton();
                    
                    // Update server progress for smooth animation
                    this.lastServerProgress = track.progress;
                    this.localProgressStart = Date.now();
                    this.updateProgressBar(track.progress, track.duration);
                }
            } else if (response.status === 204) {
                console.log('⚠️ No track playing');
                this.showNoTrackPlaying();
            }
        } catch (error) {
            console.error('❌ Error getting track:', error);
        }
    }
    
    updateTrackDisplay() {
        if (!this.currentTrack) return;
        
        this.elements.songTitle.textContent = this.currentTrack.name;
        this.elements.artistName.textContent = this.currentTrack.artist;
        this.elements.albumName.textContent = this.currentTrack.album;
        
        const minutes = Math.floor(this.currentTrack.duration / 60000);
        const seconds = Math.floor((this.currentTrack.duration % 60000) / 1000);
        this.elements.timeTotal.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.loadAlbumCover(this.currentTrack.image_url);
    }
    
    loadAlbumCover(imageUrl) {
        if (!imageUrl) {
            this.elements.coverImage.style.display = 'none';
            this.elements.coverPlaceholder.style.display = 'flex';
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            this.elements.coverImage.src = imageUrl;
            this.elements.coverImage.style.display = 'block';
            this.elements.coverPlaceholder.style.display = 'none';
        };
        img.onerror = () => {
            this.elements.coverImage.style.display = 'none';
            this.elements.coverPlaceholder.style.display = 'flex';
        };
        img.src = imageUrl;
    }
    
    showNoTrackPlaying() {
        this.currentTrack = null;
        this.elements.songTitle.textContent = 'Kein Track aktiv';
        this.elements.artistName.textContent = 'Starte Spotify';
        this.elements.albumName.textContent = '';
        this.elements.coverImage.style.display = 'none';
        this.elements.coverPlaceholder.style.display = 'flex';
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
        
        // Reset progress tracking when play state changes
        if (this.isPlaying) {
            this.localProgressStart = Date.now();
            this.startProgressAnimation();
        } else {
            this.stopProgressAnimation();
        }
        
        if (this.spotifyToken) {
            this.spotifyPlayPause();
        }
    }
    
    updatePlayButton() {
        const icon = this.isPlaying ? '⏸' : '▶';
        this.elements.playBtn.textContent = icon;
    }
    
    async spotifyPlayPause() {
        if (!this.spotifyToken) return;
        
        try {
            const endpoint = this.isPlaying ? 'play' : 'pause';
            await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.spotifyToken}`
                }
            });
        } catch (error) {
            console.error('Play/pause error:', error);
        }
    }
    
    async spotifyNext() {
        if (!this.spotifyToken) return;
        
        try {
            await fetch('https://api.spotify.com/v1/me/player/next', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.spotifyToken}`
                }
            });
            
            setTimeout(() => this.getCurrentTrack(), 500);
        } catch (error) {
            console.error('Next error:', error);
        }
    }
    
    async spotifyPrevious() {
        if (!this.spotifyToken) return;
        
        try {
            await fetch('https://api.spotify.com/v1/me/player/previous', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.spotifyToken}`
                }
            });
            
            setTimeout(() => this.getCurrentTrack(), 500);
        } catch (error) {
            console.error('Previous error:', error);
        }
    }
    
    updateProgressBar(currentMs, totalMs) {
        if (!currentMs || !totalMs) return;
        
        const percentage = (currentMs / totalMs) * 100;
        this.elements.progressFill.style.width = `${percentage}%`;
        
        const minutes = Math.floor(currentMs / 60000);
        const seconds = Math.floor((currentMs % 60000) / 1000);
        this.elements.timeCurrent.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    handleProgressBarClick(e) {
        if (!this.currentTrack || !this.spotifyToken) return;
        
        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newPosition = Math.floor(this.currentTrack.duration * percentage);
        
        this.seekToPosition(newPosition);
    }
    
    handleVolumeBarClick(e) {
        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const volume = Math.floor(percentage * 100);
        
        const volumeFill = document.querySelector('.volume-fill');
        if (volumeFill) {
            volumeFill.style.width = `${percentage * 100}%`;
        }
        
        this.setSpotifyVolume(volume);
    }
    
    async seekToPosition(positionMs) {
        if (!this.spotifyToken) return;
        
        try {
            await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.spotifyToken}`
                }
            });
        } catch (error) {
            console.error('Seek error:', error);
        }
    }
    
    async setSpotifyVolume(volumePercent) {
        if (!this.spotifyToken) return;
        
        try {
            await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.spotifyToken}`
                }
            });
        } catch (error) {
            console.error('Volume error:', error);
        }
    }
    
    resetAutoHideTimer() {
        ipcRenderer.send('reset-auto-hide');
    }
    
    initTheme() {
        this.applyTheme();
        this.updateThemeButton();
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('spotify-player-theme', this.isDarkMode ? 'dark' : 'light');
        this.applyTheme();
        this.updateThemeButton();
    }
    
    applyTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    updateThemeButton() {
        if (this.isDarkMode) {
            this.elements.themeToggle.textContent = '☀️';
            this.elements.themeToggle.title = 'Switch to Light Mode';
        } else {
            this.elements.themeToggle.textContent = '🌙';
            this.elements.themeToggle.title = 'Switch to Dark Mode';
        }
    }
    
    // Credential Management
    async getStoredClientId() {
        // Versuche erst localStorage, dann Main-Process
        let clientId = localStorage.getItem('spotify_client_id');
        if (!clientId) {
            try {
                const credentials = await ipcRenderer.invoke('get-credentials');
                clientId = credentials.clientId;
                // Cache in localStorage für bessere Performance
                if (clientId) {
                    localStorage.setItem('spotify_client_id', clientId);
                }
            } catch (error) {
                console.error('Error getting credentials from main process:', error);
            }
        }
        return clientId;
    }
    
    async getStoredClientSecret() {
        // Versuche erst localStorage, dann Main-Process
        let clientSecret = localStorage.getItem('spotify_client_secret');
        if (!clientSecret) {
            try {
                const credentials = await ipcRenderer.invoke('get-credentials');
                clientSecret = credentials.clientSecret;
                // Cache in localStorage für bessere Performance
                if (clientSecret) {
                    localStorage.setItem('spotify_client_secret', clientSecret);
                }
            } catch (error) {
                console.error('Error getting credentials from main process:', error);
            }
        }
        return clientSecret;
    }
    
    showNoCredentialsMessage() {
        this.elements.songTitle.textContent = 'Keine Spotify-Credentials';
        this.elements.artistName.textContent = 'Bitte App neu starten';
        this.elements.albumName.textContent = 'Setup erforderlich';
        
        // Zeige Reset-Button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 Setup zurücksetzen';
        resetBtn.style.cssText = `
            background: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
            border: 1px solid rgba(255, 107, 107, 0.3);
            padding: 8px 15px;
            border-radius: 8px;
            margin-top: 10px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        resetBtn.onclick = () => {
            localStorage.removeItem('spotify_client_id');
            localStorage.removeItem('spotify_client_secret');
            localStorage.removeItem('spotify_setup_completed');
            localStorage.removeItem('spotify_access_token');
            localStorage.removeItem('spotify_refresh_token');
            localStorage.removeItem('spotify_token_expiry');
            ipcRenderer.send('reset-config');
        };
        
        const infoSection = document.querySelector('.song-info');
        if (infoSection && !infoSection.querySelector('button')) {
            infoSection.appendChild(resetBtn);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍎 Starting Apple Spotify Player');
    
    // Prüfe ob Setup abgeschlossen ist
    const setupCompleted = localStorage.getItem('spotify_setup_completed');
    const clientId = localStorage.getItem('spotify_client_id');
    const clientSecret = localStorage.getItem('spotify_client_secret');
    
    if (!setupCompleted || !clientId || !clientSecret) {
        console.log('⚠️ Setup not completed or credentials missing');
        // Sende Signal an Main-Process für Setup
        require('electron').ipcRenderer.send('restart-app');
        return;
    }
    
    const player = new AppleSpotifyPlayer();
    window.applePlayer = player;
});
