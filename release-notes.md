# 🎵 Apple Spotify Player v0.2.2 - Source Release

## 📥 Download & Installation

### For Windows Users:
1. **Download** `Apple-Spotify-Player-v0.2.2-Source.zip`
2. **Extract** the ZIP file to any folder
3. **Double-click** `INSTALL_AND_RUN.bat`
4. **Done!** The app will install and start automatically ✨

### For macOS/Linux Users:
1. **Download** `Apple-Spotify-Player-v0.2.2-Source.zip`
2. **Extract** the ZIP file to any folder
3. **Open Terminal** in the extracted folder
4. **Run**: `chmod +x install-and-run.sh && ./install-and-run.sh`
5. **Done!** The app will install and start automatically ✨

## ✅ No Admin Rights Required
- ❌ No system installation
- ❌ No registry changes
- ❌ No admin permissions needed
- ✅ Runs from any folder
- ✅ Portable and self-contained

## 🚀 First Time Setup

### 1. Automatic Installation
The installer will:
- Check for Node.js (install from https://nodejs.org if missing)
- Install dependencies automatically
- Start the app

### 2. Spotify Setup Wizard
On first run:
- Follow the German setup wizard
- Create Spotify Developer account if needed
- Enter your Client ID and Secret
- Authorize the app

### 3. Ready to Use! 🎉
- Beautiful Apple-style player appears
- Shows your current Spotify track
- Auto-hides after 12 seconds
- Dark/Light mode toggle available

## ✨ Features

### 🍎 Authentic Apple Design
- **Glassmorphism** with backdrop blur effects
- **SF Pro Display** typography
- **Rounded corners** and smooth shadows
- **60fps animations** throughout

### 🎵 Complete Spotify Integration
- **Live track display** (title, artist, album)
- **High-res album covers** (240x240px)
- **Media controls** (play/pause, next/previous)
- **Real-time progress bar** with smooth animation
- **Volume control** with visual feedback
- **Click-to-open** in Spotify

### 🌙 Personalization
- **Dark/Light mode** toggle
- **Auto-hide** functionality (12 seconds)
- **Always-on-top** overlay mode
- **Secure credential** storage

### 🔒 Security Features
- **OAuth 2.0** authentication
- **Encrypted** local data storage
- **Secure API** communication
- **Context isolation** enabled
- **No hardcoded secrets**

## 🔧 Technical Requirements

- **Windows 10/11**, **macOS 10.14+**, or **Linux**
- **Node.js 18+** (installer will check)
- **Internet connection** for Spotify
- **Spotify account** (free or premium)

## 💡 Troubleshooting

### Installation Issues?
1. **Install Node.js** from https://nodejs.org
2. **Run as normal user** (no admin needed)
3. **Check antivirus** isn't blocking the installer
4. **Try manual installation**: `npm install && npm start`

### Spotify Connection Issues?
1. **Create Developer Account**: https://developer.spotify.com
2. **Create new app** in Spotify Dashboard
3. **Set Redirect URI**: `http://127.0.0.1:8888/callback`
4. **Copy Client ID and Secret** from dashboard
5. **Restart app** to trigger setup wizard again

### App Performance?
1. **Close other applications** for better performance
2. **Check internet connection** for smooth streaming
3. **Update Spotify app** if using desktop client

## 🔄 Reset Setup
If you need to reconfigure Spotify:
1. **Press F12** to open Developer Tools
2. **Go to Console** tab
3. **Type**: `localStorage.clear(); location.reload()`
4. **Press Enter** - Setup wizard will appear again

## 🆘 Support & Community

- **Bug Reports**: [GitHub Issues](https://github.com/Avacon00/spoteyfa/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/Avacon00/spoteyfa/discussions)
- **Source Code**: [GitHub Repository](https://github.com/Avacon00/spoteyfa)

## 📝 Version History

**v0.2.2** - Current Release
- ✅ Fixed GitHub Actions build issues
- ✅ Improved installation process
- ✅ Added cross-platform support
- ✅ Enhanced security configuration
- ✅ Better error handling

---

**Enjoy your beautiful Apple-style Spotify Player!** 🎵✨

*Made with ❤️ using Electron and modern web technologies*