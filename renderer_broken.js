// Apple-Style Spotify Player - NEUE SAUBERE VERSION
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
        this.isDarkMode = localStorage.getItem('spotify-player-theme') === 'dark';
        
        this.init();
    }
    
    async init() {
        console.log('🍎 Apple Player - NEUE VERSION gestartet');
        
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
            console.log('⏮️ Previous track');
            this.spotifyPrevious();
            this.resetAutoHideTimer();
        });
        
        this.elements.nextBtn.addEventListener('click', () => {
            console.log('⏭️ Next track');
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
        console.log('🔍 Checking for existing token...');
        
        // Check if we have stored token
        const storedToken = localStorage.getItem('spotify_access_token');
        const tokenExpiry = localStorage.getItem('spotify_token_expiry');
        
        if (storedToken && tokenExpiry) {
            const expiryTime = parseInt(tokenExpiry);
            const now = Date.now();
            
            // If token is still valid for at least 5 minutes
            if (now < expiryTime - 300000) {
                console.log('✅ Found valid stored token');
                this.spotifyToken = storedToken;
                this.onOAuthSuccess();
                return;
            } else {
                console.log('⏰ Token expired, trying to refresh...');
                const refreshed = await this.checkAndRefreshToken();
                if (refreshed) {
                    this.onOAuthSuccess();
                    return;
                }
            }
        }
        
        console.log('❌ No valid token found - starting OAuth flow');
        // Clear any old data first
        localStorage.clear();
        this.startOAuthFlow();
    }
    
    startOAuthFlow() {
        console.log('🔐 Starting OAuth flow...');
        this.isOAuthMode = true;
        
        // Show OAuth UI immediately and clearly
        this.elements.songTitle.textContent = '🔐 Spotify Verbindung';
        this.elements.artistName.textContent = '👆 HIER KLICKEN';
        this.elements.albumName.textContent = 'Autorisierung erforderlich';
        
        // Set click handler ONLY for OAuth
        this.elements.songTitle.style.cursor = 'pointer';
        this.elements.songTitle.onclick = () => {
            console.log('🔥 OAuth click - opening authorization...');
            this.openSpotifyAuth();
        };
        
        // Also set for artist name with visual feedback
        this.elements.artistName.style.cursor = 'pointer';
        this.elements.artistName.style.color = '#007aff';
        this.elements.artistName.style.fontWeight = 'bold';
        this.elements.artistName.onclick = () => {
            console.log('🔥 OAuth click - opening authorization...');
            this.openSpotifyAuth();
        };
        
        // Show player immediately for OAuth
        console.log('📱 Showing player for OAuth...');
        ipcRenderer.send('show-player');
    }
    
    openSpotifyAuth() {
        console.log('🚀 Opening Spotify authorization...');
        
        const CLIENT_ID = "775fb3995b714b2e91ddd0c4c36861d9";
        const REDIRECT_URI = "http://127.0.0.1:8888/callback";
        const scopes = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
        const state = Math.random().toString(36).substring(7);
        
        const authUrl = `https://accounts.spotify.com/authorize?` +
            `response_type=code&` +
            `client_id=${CLIENT_ID}&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
            `state=${state}`;
        
        console.log('🔗 OAuth URL:', authUrl);
        
        // Update UI
        this.elements.songTitle.textContent = 'Browser geöffnet...';
        this.elements.artistName.textContent = 'Autorisiere die App';
        this.elements.albumName.textContent = 'Kehre dann zurück';
        
        // Open browser
        require('electron').shell.openExternal(authUrl);
        
        // Start callback server
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
                                <p>Kehre zur App zurück.</p>
                            </body>
                        </html>
                    `);
                    
                    server.close();
                    this.exchangeCodeForToken(code, clientId);
                } else {
                    res.end(`
                        <html>
                            <body style="font-family: Arial; text-align: center; padding: 50px;">
                                <h2>❌ Autorisierung fehlgeschlagen</h2>
                                <p>Fehler: ${error}</p>
                            </body>
                        </html>
                    `);
                    server.close();
                }
            }
        });
        
        server.listen(8888, '127.0.0.1', () => {
            console.log('🌐 Server listening on http://127.0.0.1:8888');
        });
    }
    
    async exchangeCodeForToken(code, clientId) {
        console.log('🔄 Exchanging code for token...');
        console.log('📝 Auth code received:', code.substring(0, 10) + '...');
        
        const CLIENT_SECRET = "2c01cacdc1fe4f9d98f3910627508d4e";
        const REDIRECT_URI = "http://127.0.0.1:8888/callback";
        
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
            
            console.log('🔍 Token exchange response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('🎉 Token exchange successful!');
                console.log('📋 Token data:', {
                    access_token: data.access_token.substring(0, 10) + '...',
                    expires_in: data.expires_in,
                    scope: data.scope
                });
                
                // Store token
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
                localStorage.setItem('spotify_token_expiry', (Date.now() + data.expires_in * 1000).toString());
                
                this.spotifyToken = data.access_token;
                console.log('✅ Token stored and set successfully');
                
                this.onOAuthSuccess();
            } else {
                const errorData = await response.text();
                console.error('❌ Token exchange failed:', response.status, errorData);
                this.onOAuthError();
            }
        } catch (error) {
            console.error('❌ Token exchange error:', error);
            this.onOAuthError();
        }
    }
    
    onOAuthSuccess() {
        console.log('🎉 OAuth successful - switching to normal mode');
        this.isOAuthMode = false;
        
        // Reset styles
        this.elements.artistName.style.color = '';
        this.elements.artistName.style.fontWeight = '';
        
        // Clear OAuth click handlers
        this.elements.songTitle.onclick = null;
        this.elements.artistName.onclick = null;
        
        // Set normal click handlers
        this.elements.songTitle.onclick = () => this.openTrackInSpotify();
        this.elements.artistName.onclick = () => this.openTrackInSpotify();
        this.elements.coverImage.onclick = () => this.openTrackInSpotify();
        this.elements.coverPlaceholder.onclick = () => this.openTrackInSpotify();
        
        // Show success message temporarily
        this.elements.songTitle.textContent = '✅ Verbunden!';
        this.elements.artistName.textContent = 'Lädt aktuelle Tracks...';
        this.elements.albumName.textContent = 'Bitte warten...';
        
        // Start monitoring immediately
        console.log('🎵 Starting immediate track monitoring...');
        this.startSpotifyMonitoring();
        
        // Force immediate track check
        setTimeout(() => {
            this.getCurrentTrack();
        }, 500);
    }
    
    onOAuthError() {
        this.elements.songTitle.textContent = 'Fehler bei Autorisierung';
        this.elements.artistName.textContent = 'Klicke zum Wiederholen';
        this.elements.albumName.textContent = 'Versuche es nochmal';
        
        // Keep OAuth handlers for retry
    }
    
    startSpotifyMonitoring() {
        console.log('🎵 Starting Spotify monitoring...');
        
        // Get current track immediately
        this.getCurrentTrack();
        
        // Monitor more frequently for track changes
        this.monitoringInterval = setInterval(async () => {
            console.log('🔍 Monitoring tick - checking current track...');
            this.getCurrentTrack();
        }, 1000); // Check every 1 second instead of 2
        
        console.log('🔄 Monitoring interval started');
    }
    
    async getCurrentTrack() {
        console.log('🎵 getCurrentTrack() called');
        
        if (!this.spotifyToken) {
            console.log('❌ No Spotify token available');
            return;
        }
        
        console.log('✅ Token available, making API call...');
        console.log('🔑 Using token:', this.spotifyToken.substring(0, 10) + '...');
        
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${this.spotifyToken}`
                }
            });
            
            console.log(`🔍 API Response Status: ${response.status}`);
            
            if (response.status === 401 || response.status === 403) {
                console.log('🔑 Token expired or invalid - refreshing...');
                await this.checkAndRefreshToken();
                return; // Try again on next interval
            }
            
            if (response.ok && response.status !== 204) {
                const data = await response.json();
                console.log('📊 API Response Data:', data);
                
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
                    
                    console.log('🎵 Parsed track:', track);
                    
                    if (!this.currentTrack || track.id !== this.currentTrack.id) {
                        console.log(`🔄 TRACK CHANGE DETECTED!`);
                        console.log(`🔄 Old track: ${this.currentTrack?.name || 'none'}`);
                        console.log(`🔄 New track: ${track.name}`);
                        
                        // Show player when new track starts
                        console.log(`📱 Showing player for new track...`);
                        ipcRenderer.send('show-player');
                        
                        this.currentTrack = track;
                        this.updateTrackDisplay();
                        console.log(`🎵 Now playing: ${track.name} - ${track.artist}`);
                    } else {
                        // Update existing track progress
                        this.currentTrack.progress = track.progress;
                        this.currentTrack.is_playing = track.is_playing;
                        console.log(`⏱️ Progress update: ${Math.floor(track.progress/1000)}s`);
                    }
                    
                    // Update play state and progress
                    this.isPlaying = track.is_playing;
                    this.updatePlayButton();
                    this.updateProgress(track.progress, track.duration);
                    
                    // Start progress animation if playing
                    if (this.isPlaying && !this.progressInterval) {
                        this.startProgressAnimation();
                    } else if (!this.isPlaying && this.progressInterval) {
                        this.stopProgressAnimation();
                    }
                } else {
                    console.log('❌ No track data in response');
                }
            } else if (response.status === 204) {
                console.log(`⚠️ No track currently playing (Status: 204 - No Content)`);
                this.showNoTrackPlaying();
            } else {
                console.log(`⚠️ Unexpected status: ${response.status}`);
                const errorText = await response.text();
                console.log('🔍 Error response:', errorText);
            }
        } catch (error) {
            console.error('❌ Error getting current track:', error);
            
            // Check if it's a token error
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.log('🔄 Possible token issue - checking token validity');
                await this.checkAndRefreshToken();
            }
        }
    }
    
    updateTrackDisplay() {
        if (!this.currentTrack) return;
        
        // Update text
        this.elements.songTitle.textContent = this.currentTrack.name;
        this.elements.artistName.textContent = this.currentTrack.artist;
        this.elements.albumName.textContent = this.currentTrack.album;
        
        // Update time
        const minutes = Math.floor(this.currentTrack.duration / 60000);
        const seconds = Math.floor((this.currentTrack.duration % 60000) / 1000);
        this.elements.timeTotal.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Load cover
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
        this.elements.albumName.textContent = 'Spiele einen Song ab';
        this.elements.coverImage.style.display = 'none';
        this.elements.coverPlaceholder.style.display = 'flex';
    }
    
    openTrackInSpotify() {
        if (this.currentTrack?.external_url) {
            require('electron').shell.openExternal(this.currentTrack.external_url);
            console.log('🎵 Opened track in Spotify');
        } else {
            require('electron').shell.openExternal('https://open.spotify.com/');
            console.log('🌐 Opened Spotify web');
        }
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
        
        if (this.spotifyToken) {
            this.spotifyPlayPause();
        }
        
        console.log(`${this.isPlaying ? '▶️' : '⏸️'} Play state: ${this.isPlaying}`);
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
            console.error('Spotify play/pause error:', error);
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
            console.log('⏭️ Skipped to next track');
            
            // Wait a bit then refresh current track
            setTimeout(() => {
                this.getCurrentTrack();
            }, 500);
        } catch (error) {
            console.error('Spotify next error:', error);
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
            console.log('⏮️ Skipped to previous track');
            
            // Wait a bit then refresh current track
            setTimeout(() => {
                this.getCurrentTrack();
            }, 500);
        } catch (error) {
            console.error('Spotify previous error:', error);
        }
    }
    
    updateProgress(currentMs, totalMs) {
        if (!currentMs || !totalMs) return;
        
        // Update progress bar
        const percentage = (currentMs / totalMs) * 100;
        this.elements.progressFill.style.width = `${percentage}%`;
        
        // Update current time display
        const minutes = Math.floor(currentMs / 60000);
        const seconds = Math.floor((currentMs % 60000) / 1000);
        this.elements.timeCurrent.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Store for animation
        this.lastProgressUpdate = Date.now();
        this.progressValue = currentMs;
    }
    
    startProgressAnimation() {
        if (this.progressInterval) return;
        
        console.log('🎵 Starting progress animation');
        this.progressInterval = setInterval(() => {
            if (!this.currentTrack || !this.isPlaying) return;
            
            // Estimate progress based on time elapsed
            const now = Date.now();
            const elapsed = now - this.lastProgressUpdate;
            this.progressValue += elapsed;
            this.lastProgressUpdate = now;
            
            // Update display
            this.updateProgress(this.progressValue, this.currentTrack.duration);
            
            // Don't go beyond track duration
            if (this.progressValue >= this.currentTrack.duration) {
                this.progressValue = this.currentTrack.duration;
                this.stopProgressAnimation();
            }
        }, 200); // Update every 200ms for smooth animation
    }
    
    stopProgressAnimation() {
        if (this.progressInterval) {
            console.log('🎵 Stopping progress animation');
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    async checkAndRefreshToken() {
        console.log('🔄 Checking token expiry...');
        
        const tokenExpiry = localStorage.getItem('spotify_token_expiry');
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        
        if (!tokenExpiry || !refreshToken) {
            console.log('❌ No expiry or refresh token - need re-auth');
            this.showTokenExpiredMessage();
            return false;
        }
        
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();
        
        // Check if token expires in next 5 minutes (300000ms)
        if (now < expiryTime - 300000) {
            console.log('✅ Token still valid');
            return true;
        }
        
        console.log('🔄 Token expired - refreshing...');
        return await this.refreshSpotifyToken(refreshToken);
    }
    
    async refreshSpotifyToken(refreshToken) {
        const CLIENT_ID = "775fb3995b714b2e91ddd0c4c36861d9";
        const CLIENT_SECRET = "2c01cacdc1fe4f9d98f3910627508d4e";
        
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Update stored tokens
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.setItem('spotify_token_expiry', (Date.now() + data.expires_in * 1000).toString());
                
                // Update refresh token if provided
                if (data.refresh_token) {
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                }
                
                this.spotifyToken = data.access_token;
                console.log('✅ Token refreshed successfully');
                
                return true;
            } else {
                console.error('❌ Token refresh failed:', response.status);
                this.showTokenExpiredMessage();
                return false;
            }
        } catch (error) {
            console.error('❌ Token refresh error:', error);
            this.showTokenExpiredMessage();
            return false;
        }
    }
    
    showTokenExpiredMessage() {
        console.log('🔑 Showing token expired message');
        
        this.elements.songTitle.textContent = 'Token abgelaufen';
        this.elements.artistName.textContent = 'Klicke für erneute Anmeldung';
        this.elements.albumName.textContent = 'OAuth erforderlich';
        
        this.elements.coverImage.style.display = 'none';
        this.elements.coverPlaceholder.style.display = 'flex';
        
        // Clear current track
        this.currentTrack = null;
        
        // Set re-auth handler
        this.elements.songTitle.onclick = () => {
            console.log('🔄 Re-auth requested');
            this.startOAuthFlow();
        };
        
        this.elements.artistName.onclick = () => {
            console.log('🔄 Re-auth requested');
            this.startOAuthFlow();
        };
    }
    
    // Recovery method to restart monitoring if it stops
    restartMonitoring() {
        console.log('🔄 Restarting monitoring interval...');
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        this.monitoringInterval = setInterval(async () => {
            console.log('🔍 Monitoring tick - checking current track...');
            this.getCurrentTrack();
        }, 1000);
        
        console.log('✅ Monitoring interval restarted');
    }
    
    handleProgressBarClick(e) {
        if (!this.currentTrack || !this.spotifyToken) return;
        
        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newPosition = Math.floor(this.currentTrack.duration * percentage);
        
        console.log(`🎯 Progress clicked: ${percentage.toFixed(2)} -> ${Math.floor(newPosition/1000)}s`);
        
        // Spotify API call to seek
        this.seekToPosition(newPosition);
    }
    
    handleVolumeBarClick(e) {
        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const volume = Math.floor(percentage * 100);
        
        console.log(`🔊 Volume clicked: ${percentage.toFixed(2)} -> ${volume}%`);
        
        // Update volume visually immediately
        const volumeFill = document.querySelector('.volume-fill');
        if (volumeFill) {
            volumeFill.style.width = `${percentage * 100}%`;
        }
        
        // Spotify API call to set volume
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
            console.log(`⏭️ Seeked to position: ${Math.floor(positionMs/1000)}s`);
        } catch (error) {
            console.error('❌ Seek error:', error);
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
            console.log(`🔊 Volume set to: ${volumePercent}%`);
        } catch (error) {
            console.error('❌ Volume error:', error);
        }
    }
    
    resetAutoHideTimer() {
        // Sende Signal an Main Process, um Auto-Hide Timer zurückzusetzen
        ipcRenderer.send('reset-auto-hide');
        console.log('⏰ Auto-hide timer reset due to user interaction');
    }
    
    initTheme() {
        console.log(`🎨 Initializing theme - Dark mode: ${this.isDarkMode}`);
        this.applyTheme();
        this.updateThemeButton();
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        console.log(`🌙 Theme toggled - Dark mode: ${this.isDarkMode}`);
        
        // Save to localStorage
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
        // Update button icon - Moon for Light Mode, Sun for Dark Mode
        if (this.isDarkMode) {
            this.elements.themeToggle.textContent = '☀️'; // Sun icon when in dark mode
            this.elements.themeToggle.title = 'Switch to Light Mode';
        } else {
            this.elements.themeToggle.textContent = '🌙'; // Moon icon when in light mode  
            this.elements.themeToggle.title = 'Switch to Dark Mode';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍎 Starting NEW Apple Spotify Player');
    const player = new AppleSpotifyPlayer();
    window.applePlayer = player;
});