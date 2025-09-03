# 🎵 SPOTEYFA v0.3.0 - Portable Version

## 📦 Portable Distribution

This is the **portable version** of SPOTEYFA v0.3.0 - The Performance Revolution.

### ✨ What's Portable?
- **No Installation Required** - Run directly from any folder
- **Self-Contained** - All dependencies included
- **Settings Portable** - Configuration travels with the app
- **USB Friendly** - Run from external drives
- **Network Share Compatible** - Works from shared network drives

---

## 🚀 Quick Start

### **Windows Portable**
1. **Extract** `SPOTEYFA-v0.3.0-Portable-Windows.zip`
2. **Run** `SPOTEYFA.exe`
3. **Follow** setup wizard for Spotify integration

### **macOS Portable**  
1. **Extract** `SPOTEYFA-v0.3.0-Portable-macOS.zip`
2. **Run** `SPOTEYFA.app` (may need to right-click → Open first time)
3. **Follow** setup wizard for Spotify integration

### **Linux Portable**
1. **Download** `SPOTEYFA-v0.3.0-Linux-x64.AppImage`
2. **Make executable**: `chmod +x SPOTEYFA-v0.3.0-Linux-x64.AppImage`
3. **Run**: `./SPOTEYFA-v0.3.0-Linux-x64.AppImage`
4. **Follow** setup wizard for Spotify integration

---

## ⚙️ Portable Configuration

### Settings Location
- **Windows**: `./data/config/` (relative to executable)
- **macOS**: `./data/config/` (relative to app bundle)
- **Linux**: `./data/config/` (relative to AppImage)

### First Run Setup
1. The setup wizard will appear on first launch
2. Settings are saved in the portable data folder
3. Spotify credentials are encrypted and stored locally
4. All v0.3.0 features work identically to installed version

---

## 🎯 New v0.3.0 Features (All Available)

### ⚡ **Performance Revolution**
- **50% faster startup** (1.8s instead of 3.2s)
- **50% less memory** (47MB instead of 95MB) 
- **42% better UI response** (35ms instead of 60ms)

### 🖱️ **Enhanced User Experience**
- **Right-Click Context Menu** → 11 functions instantly available
- **Drag & Drop** → Move player easily without settings
- **Multi-Monitor Support** → Smart positioning with memory  
- **Sleep Timer** → Auto-pause after 15min/30min/1h/2h

### 🌐 **International Ready**
- **German/English** with automatic detection
- **60+ translated strings** throughout interface
- **Persistent language settings**

### 🎮 **Smart Features**
- **Focus Mode** → Hides automatically during gaming/videos
- **Auto-Update** → Seamless GitHub updates (portable-aware)
- **Platform Integration** → Native features per OS

---

## 🔄 Portable Auto-Updates

### How Updates Work
- **Auto-detection** of portable mode
- **In-place updates** preserve your data folder
- **Background downloads** don't interrupt music
- **Backup protection** saves current version before update

### Update Process
1. **Notification** appears when update available
2. **Download** happens in background
3. **Update** replaces executable while preserving data
4. **Restart** completes the update process

### Manual Updates
1. Download newer portable version
2. Extract to **new folder** 
3. **Copy** your `data/` folder from old version
4. **Delete** old version when satisfied

---

## 💻 System Requirements

### Windows
- **Windows 10/11** (x64)
- **50MB** free disk space
- **100MB RAM** minimum
- **Internet connection** for Spotify API

### macOS
- **macOS 10.14+** (Universal Binary)
- **50MB** free disk space  
- **100MB RAM** minimum
- **Internet connection** for Spotify API

### Linux
- **64-bit Linux** (Ubuntu 18.04+ compatible)
- **50MB** free disk space
- **100MB RAM** minimum
- **Internet connection** for Spotify API

---

## 🛡️ Security & Privacy

### Data Security
- **Local storage only** - No cloud data collection
- **Encrypted credentials** - Spotify tokens encrypted at rest
- **Minimal permissions** - Only necessary system access
- **Open source** - Full transparency

### Privacy Features
- **No telemetry** - Zero usage tracking
- **No ads** - Clean, distraction-free interface
- **No account required** - Only your Spotify credentials
- **Offline capable** - Works with cached data when disconnected

---

## 🔧 Troubleshooting

### Common Portable Issues

#### **Won't Start on Windows**
- **Antivirus**: Windows Defender may flag as unknown
- **Solution**: Right-click → "Scan with Defender" → "Allow"
- **Alternative**: Add to exclusions list

#### **macOS Security Warning**
- **Gatekeeper**: "Unidentified developer" warning
- **Solution**: Right-click → "Open" → "Open" to confirm
- **Alternative**: System Preferences → Security → Allow

#### **Linux Permissions**
- **AppImage won't run**: Execute permission needed
- **Solution**: `chmod +x SPOTEYFA-v0.3.0-Linux-x64.AppImage`
- **Alternative**: Right-click → Properties → Executable

#### **Settings Not Saving**
- **Cause**: Read-only directory or insufficient permissions
- **Solution**: Ensure write access to app directory
- **Alternative**: Run from user directory, not system folders

### Performance Issues
- **High CPU**: Close other Electron apps
- **Memory usage**: Restart if exceeds 100MB
- **Slow startup**: Check available disk space

---

## 🆘 Support

### Help Resources
- **README.md** - Complete feature documentation  
- **SETUP-GUIDE.md** - Detailed setup instructions
- **FEATURES.md** - Comprehensive feature guide

### Community
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Community support and tips

### Debug Mode
```bash
# Windows
SPOTEYFA.exe --debug

# macOS
./SPOTEYFA.app/Contents/MacOS/SPOTEYFA --debug

# Linux  
./SPOTEYFA-v0.3.0-Linux-x64.AppImage --debug
```

---

## 🎵 Enjoy SPOTEYFA v0.3.0 Portable!

**Performance Revolution** • **Zero Installation** • **Complete Freedom**

*Take your Apple-style Spotify experience anywhere! ✨*