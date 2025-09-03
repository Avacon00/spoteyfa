// Secure Preload Script for Spotify Player
// This script runs in an isolated context and exposes only necessary APIs

const { contextBridge, ipcRenderer } = require('electron');

// Secure API exposure to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // IPC Communication - only specific channels allowed
    closePlayer: () => ipcRenderer.send('close-player'),
    showPlayer: () => ipcRenderer.send('show-player'),
    resetAutoHide: () => ipcRenderer.send('reset-auto-hide'),
    
    // Spotify configuration - secure access
    getSpotifyConfig: () => ipcRenderer.invoke('get-spotify-config'),
    saveSpotifyConfig: (clientId, clientSecret) => 
        ipcRenderer.invoke('save-spotify-config', clientId, clientSecret),
    
    // System APIs - limited access
    openExternal: (url) => {
        // Validate URL before opening
        if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
            return ipcRenderer.invoke('open-external', url);
        }
        throw new Error('Invalid URL');
    },
    
    // Platform info
    getPlatform: () => ipcRenderer.invoke('get-platform'),
    
    // Theme management
    getStoredTheme: () => localStorage.getItem('spotify-player-theme'),
    setStoredTheme: (theme) => localStorage.setItem('spotify-player-theme', theme),
    
    // Token management - secure storage
    getStoredToken: () => localStorage.getItem('spotify_access_token'),
    setStoredToken: (token) => localStorage.setItem('spotify_access_token', token),
    getTokenExpiry: () => localStorage.getItem('spotify_token_expiry'),
    setTokenExpiry: (expiry) => localStorage.setItem('spotify_token_expiry', expiry),
    getRefreshToken: () => localStorage.getItem('spotify_refresh_token'),
    setRefreshToken: (token) => localStorage.setItem('spotify_refresh_token', token),
    
    // Clear all tokens
    clearTokens: () => {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiry');
    }
});

// Remove Node.js APIs from window object for security
delete window.require;
delete window.exports;
delete window.module;

console.log('🔒 Secure preload script loaded');