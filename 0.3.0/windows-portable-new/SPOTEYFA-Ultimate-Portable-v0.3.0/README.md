# 🎵 SPOTEYFA v0.3.0 - Windows Portable Edition


## 🚀 **SUPER EINFACHE INSTALLATION - WÄHLEN SIE IHRE METHODE:**

### **🟢 FÜR ABSOLUTE ANFÄNGER (Empfohlen):**
```
Doppelklick auf: SPOTEYFA-ONE-CLICK.bat
```
**Das war's!** Alles wird vollautomatisch installiert und gestartet.

### **🟡 FÜR VORSICHTIGE BENUTZER:**
```
Doppelklick auf: SPOTEYFA-Auto-Installer.bat
```
Fragt nach Bestätigung, dann automatische Installation.

### **🔵 FÜR ERFAHRENE BENUTZER:**
```
Doppelklick auf: Start-SPOTEYFA.bat
``` 
(Benötigt vorinstalliertes Node.js)

📚 **Detaillierte Anleitung:** Siehe `README-INSTALLATION.md`

---

## 🚀 Quick Start

1. **Extract** this folder to your desired location
2. **Double-click** `Start-SPOTEYFA.bat` 
3. **Follow** the setup wizard
4. **Enjoy** your Apple-style Spotify player!

## 📋 Requirements

- **Node.js 18+** (https://nodejs.org)
- **Windows 10/11**
- **Active Spotify Account**
- **Internet Connection**

## 🎯 Features

### ✨ New in v0.3.0
- 🎯 **Drag & Drop** window positioning
- 🖥️ **Multi-Monitor Support** with position memory
- ⏰ **Sleep Timer** (15min, 30min, 1h, 2h)
- 🌍 **Internationalization** (German/English)
- 🔄 **Auto-Update System**
- 🎮 **Focus Mode** (auto-hide during games/videos)

### 🎨 Core Features  
- **Apple Glassmorphism Design** with blur effects
- **Live Spotify Integration** with real-time updates
- **Right-Click Context Menu** with 11+ functions
- **Platform-Optimized** for Windows 11
- **Performance Optimized** (50% less memory usage)

## 🖱️ Usage

### First Time Setup
1. Run `Start-SPOTEYFA.bat`
2. Setup wizard will guide you through Spotify configuration
3. Enter your Spotify Client ID and Secret
4. Player starts automatically

### Daily Use
- **Start**: Double-click `Start-SPOTEYFA.bat`
- **Debug**: Use `Debug-SPOTEYFA.bat` if issues occur
- **Force Show**: Use `Force-Show-SPOTEYFA.bat` if window is invisible

### Interactions
- **Right-click** → Access all features
- **Drag & Drop** → Move window around
- **Cover Click** → Open Spotify
- **ESC** → Hide/Show toggle

## 🔧 Scripts Explained

| Script | Purpose |
|--------|---------|
| `Start-SPOTEYFA.bat` | Main launcher (recommended) |
| `Debug-SPOTEYFA.bat` | Debug mode with logging |
| `Force-Show-SPOTEYFA.bat` | Fix invisible window issue |
| `Install-Dependencies.bat` | Manual dependency installation |

## 🐛 Troubleshooting

### Window Not Visible
1. Use `Force-Show-SPOTEYFA.bat`
2. Check Task Manager for SPOTEYFA process
3. Try `Debug-SPOTEYFA.bat` for error logs

### Dependencies Missing
1. Run `Install-Dependencies.bat`
2. Ensure Node.js is installed
3. Check internet connection

### Spotify Connection Issues
1. Verify Spotify is running and logged in
2. Check Spotify API credentials in setup
3. Try restarting both SPOTEYFA and Spotify

## 📊 Performance

- **Memory Usage**: ~47MB (50% less than v0.2.5)
- **Startup Time**: <2 seconds
- **CPU Usage**: <1% when idle
- **Bundle Size**: ~35MB portable

## 🌐 Multi-Language

- **German** (Deutsch) - Default in German Windows
- **English** - Default elsewhere
- **Switch**: Right-click → Settings → Language

## 📁 File Structure

```
SPOTEYFA-Windows-Portable-v0.3.0/
├── Start-SPOTEYFA.bat          # Main launcher
├── Debug-SPOTEYFA.bat          # Debug launcher  
├── Force-Show-SPOTEYFA.bat     # UI fix launcher
├── Install-Dependencies.bat     # Manual installer
├── README.md                   # This file
├── LICENSE.txt                 # MIT License
├── package.json                # Project configuration
├── main.js                     # Main application (Windows-fixed)
├── renderer.js                 # UI renderer
├── i18n.js                     # Internationalization
├── config-manager.js           # Configuration management
├── index.html                  # Main interface
├── style.css                   # Apple-style CSS
├── setup-wizard.html           # First-run setup
├── assets/                     # Icons and resources
└── node_modules/               # Dependencies (after install)
```

## 🔗 Links

- **GitHub**: https://github.com/Avacon00/spoteyfa
- **Issues**: https://github.com/Avacon00/spoteyfa/issues
- **Releases**: https://github.com/Avacon00/spoteyfa/releases

---

**🎵 Built with ❤️ using Electron and modern web technologies**

*Apple-inspired design meets Spotify functionality - v0.3.0 Performance Revolution*
