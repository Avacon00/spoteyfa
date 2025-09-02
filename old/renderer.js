// Apple-Style Spotify Player - SECURE VERSION
// Using secure electronAPI instead of direct Node.js requires

class AppleSpotifyPlayer {
    constructor() {
        // Spotify integration
        this.spotifyToken = null;
        this.currentTrack = null;
        this.isPlaying = true;
        this.progressValue = 0;
        
        // OAuth state
        this.isOAuthMode = false;
        
        // Secure configuration
        this.spotifyConfig = null;
        
        // Progress tracking
        this.progressInterval = null;
        this.lastProgressUpdate = 0;
        this.lastServerProgress = 0;
        this.localProgressStart = 0;
        
        // Monitoring
        this.monitoringInterval = null;
        
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
        this.isDarkMode = window.electronAPI?.getStoredTheme() === 'dark';
        
        this.init();
    }
    
    async init() {
        console.log('🍎 Apple Player gestartet (Secure Mode)');
        
        // Load secure configuration first
        await this.loadSpotifyConfig();
        
        // Setup theme first
        this.initTheme();
        
        // Setup basic controls
        this.setupBasicControls();
        
        // Check for existing token first
        await this.checkExistingToken();
    }
    
    async loadSpotifyConfig() {
        try {
            this.spotifyConfig = await window.electronAPI.getSpotifyConfig();
            console.log('🔐 Spotify configuration loaded securely');
        } catch (error) {
            console.error('❌ Failed to load Spotify configuration:', error);
            // Fallback to default values
            this.spotifyConfig = {
                clientId: '775fb3995b714b2e91ddd0c4c36861d9',
                clientSecret: '2c01cacdc1fe4f9d98f3910627508d4e',
                redirectUri: 'http://127.0.0.1:8888/callback'
            };
        }
    }
    
    setupBasicControls() {
        // Close button
        this.elements.closeBtn.addEventListener('click', () => {
            window.electronAPI.closePlayer();
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
        
        const storedToken = window.electronAPI?.getStoredToken();
        const tokenExpiry = window.electronAPI?.getTokenExpiry();
        
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
        
        window.electronAPI.showPlayer();
    }
    
    async openSpotifyAuth() {
        console.log('🚀 Opening Spotify auth...');
        
        const CLIENT_ID = this.spotifyConfig.clientId;
        const REDIRECT_URI = this.spotifyConfig.redirectUri;
        const scopes = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
        const state = Math.random().toString(36).substring(7);
        
        const authUrl = `https://accounts.spotify.com/authorize?` +
            `response_type=code&` +
            `client_id=${CLIENT_ID}&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
            `state=${state}`;
        
        this.elements.songTitle.textContent = 'Browser geöffnet...';
        this.elements.artistName.textContent = 'Autorisiere die App';
        
        try {
            await window.electronAPI.openExternal(authUrl);
            this.startCallbackServer(CLIENT_ID);
        } catch (error) {
            console.error('❌ Failed to open external URL:', error);
            this.elements.songTitle.textContent = 'Fehler beim Öffnen';
            this.elements.artistName.textContent = 'Bitte erneut versuchen';
        }
    }
    
    async startCallbackServer(clientId) {
        console.log('🌐 Starting callback server...');
        
        // Note: In secure mode, we can't use Node.js modules directly
        // This would need to be handled by the main process
        // For now, we'll show a manual authorization flow
        
        this.elements.songTitle.textContent = 'Manuelle Autorisierung';
        this.elements.artistName.textContent = 'Nach der Autorisierung wird ein Code angezeigt';
        
        // TODO: Implement secure callback server in main process
        console.log('⚠️ Callback server not implemented in secure mode');
        
        /*
        // Original callback server code (requires Node.js access)
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
        */
        } catch (error) {
            console.error('❌ Cannot start callback server in secure mode:', error);
            this.elements.songTitle.textContent = 'Sicherheitsmodus aktiv';
            this.elements.artistName.textContent = 'Manuelle Token-Eingabe erforderlich';
        }
    }
    
    async exchangeCodeForToken(code, clientId) {
        console.log('🔄 Exchanging code...');
        
        const CLIENT_SECRET = this.spotifyConfig.clientSecret;
        const REDIRECT_URI = this.spotifyConfig.redirectUri;
        
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
                
                // Store tokens securely
                window.electronAPI.setStoredToken(data.access_token);
                window.electronAPI.setRefreshToken(data.refresh_token);
                window.electronAPI.setTokenExpiry((Date.now() + data.expires_in * 1000).toString());
                
                this.spotifyToken = data.access_token;
                console.log('✅ Token obtained and stored securely');
                
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
        console.log('🎵 Starting monitoring...');
        
        this.getCurrentTrack();
        
        this.monitoringInterval = setInterval(() => {
            this.getCurrentTrack();
        }, 2000);
        
        // Start smooth progress animation
        this.startProgressAnimation();
    }
    
    startProgressAnimation() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        this.progressInterval = setInterval(() => {
            if (this.isPlaying && this.currentTrack && this.lastServerProgress > 0) {
                // Calculate local progress based on elapsed time since last server update
                const now = Date.now();
                const elapsed = now - this.localProgressStart;
                const currentProgress = this.lastServerProgress + elapsed;
                
                if (currentProgress <= this.currentTrack.duration) {
                    this.updateProgressBar(currentProgress, this.currentTrack.duration);
                }
            }
        }, 100); // Update every 100ms for smooth animation
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
                        window.electronAPI.showPlayer();
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
        window.electronAPI.resetAutoHide();
    }
    
    initTheme() {
        this.applyTheme();
        this.updateThemeButton();
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        window.electronAPI?.setStoredTheme(this.isDarkMode ? 'dark' : 'light');
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍎 Starting Apple Spotify Player');
    const player = new AppleSpotifyPlayer();
    window.applePlayer = player;
});
