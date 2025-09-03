# 🚀 SPOTEYFA v0.3.0 - Setup Guide

## 📋 Quick Setup

### 1. **Download & Extract**
- Download the latest release for your platform
- Extract the archive to your desired location
- Navigate to the `0.3.0` folder

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Start Application**
```bash
npm start
```

### 4. **Follow Setup Wizard**
The setup wizard will guide you through:
- Spotify Developer Account creation
- API credentials configuration
- Feature tutorial for v0.3.0

---

## 🔑 Spotify API Setup

### Step 1: Create Spotify Developer Account
1. Visit [developer.spotify.com](https://developer.spotify.com)
2. Log in with your Spotify account
3. Accept the Terms of Service

### Step 2: Create New App
1. Click **"Create App"**
2. Fill out the form:
   - **App Name**: SPOTEYFA (or your choice)
   - **App Description**: Personal Spotify overlay player
   - **Redirect URI**: `http://localhost:8888/callback`
   - **APIs**: Web API

### Step 3: Get Credentials
1. In your app dashboard, click **"Settings"**
2. Copy your **Client ID**
3. Click **"View client secret"** and copy **Client Secret**

### Step 4: Enter in SPOTEYFA
1. Start SPOTEYFA
2. The setup wizard will prompt for credentials
3. Paste Client ID and Client Secret
4. Click **"Validate & Continue"**

---

## 🎯 First Launch Features

### New v0.3.0 Features Overview
- **Right-Click Menu**: Access all features instantly
- **Drag & Drop**: Move player without settings
- **Multi-Monitor**: Smart positioning across displays
- **Sleep Timer**: Auto-pause after set duration
- **Language Support**: English/German switching
- **Focus Mode**: Auto-hide during gaming/videos

### Feature Tutorial
The setup wizard includes an interactive tutorial showing:
- How to use the right-click context menu
- Drag & drop functionality demonstration  
- Sleep timer configuration options
- Language switching process
- Focus mode behavior explanation

---

## 🖱️ Basic Usage

### Right-Click Context Menu
- **Always on Top**: Toggle window priority
- **Hide for X minutes**: Temporary hiding (5min/15min)
- **Pin to Corner**: Snap to screen corners
- **Sleep Timer**: Set auto-pause duration
- **Settings**: Language and preferences
- **About**: GitHub repository access

### Drag & Drop Operation
- Click and hold anywhere on the player
- Drag to desired position
- Release to place
- Position is automatically saved per monitor

### Multi-Monitor Support
- Player remembers position on each display
- Automatically adjusts when moving between monitors
- Smart positioning prevents off-screen placement

---

## ⚙️ Configuration Options

### Language Settings
1. Right-click on player
2. Select **"Settings"**
3. Choose **"English"** or **"Deutsch"**
4. Change applies immediately

### Performance Settings
- Memory cleanup: Automatic every 30 seconds
- Update interval: 3 seconds (optimized for performance)
- Animation: 60fps when active, reduced when idle

### Platform Integration
- **Windows**: Taskbar integration, rounded corners
- **macOS**: Native vibrancy, dock integration
- **Linux**: MPRIS support, desktop notifications

---

## 🔧 Troubleshooting

### Common Issues

#### Setup Wizard Doesn't Appear
```bash
# Clear cached credentials
localStorage.removeItem('spotify_client_id');
localStorage.removeItem('spotify_client_secret');
# Restart application
```

#### Authentication Fails
- Verify Client ID and Secret are correct
- Check internet connection
- Ensure Spotify account is active
- Try regenerating Client Secret

#### Player Doesn't Update
- Check if Spotify is playing music
- Verify Spotify account has active premium (recommended)
- Restart both Spotify and SPOTEYFA

#### Focus Mode Not Working
- Ensure fullscreen detection is enabled
- Check if gaming/video app is truly fullscreen
- Platform-specific detection may vary

### Performance Issues

#### High Memory Usage
- Check if automatic cleanup is enabled
- Restart application if memory exceeds 100MB
- Close other Electron applications

#### Slow Startup
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for system resource constraints

---

## 📱 Platform-Specific Notes

### Windows 10/11
- Requires Windows 10 version 1903 or later for full features
- Windows Defender may show warning on first run (normal)
- Taskbar integration requires Windows 11 for rounded corners

### macOS
- Requires macOS 10.14 (Mojave) or later
- Native vibrancy effects work best on macOS 11+
- Global shortcuts may require accessibility permissions

### Linux
- AppImage format for maximum compatibility
- MPRIS integration requires D-Bus
- Desktop notifications need notification daemon
- Tested on Ubuntu 20.04+, Fedora 34+, Debian 11+

---

## 🔄 Updates

### Auto-Update System
- Checks for updates every 2 hours
- Downloads in background without interruption
- Notifies when update is ready to install
- Requires restart to apply update

### Manual Updates
1. Download latest release from GitHub
2. Close SPOTEYFA completely
3. Replace files with new version
4. Restart application
5. Existing settings are preserved

---

## 🆘 Getting Help

### Documentation
- **README.md**: Complete feature documentation
- **CHANGELOG.md**: Version history and changes
- **BUILD-INSTRUCTIONS.md**: Development setup

### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Community questions and tips
- **Release Notes**: Latest features and fixes

### Debugging
```bash
# Enable debug mode
DEBUG=spoteyfa:* npm run dev

# Performance debugging
npm run dev -- --debug-performance

# Feature-specific debugging
npm run dev -- --debug-i18n
npm run dev -- --debug-focus-mode
```

---

**🎵 Welcome to SPOTEYFA v0.3.0 - The Performance Revolution! ✨**

*For additional help, visit our GitHub repository*