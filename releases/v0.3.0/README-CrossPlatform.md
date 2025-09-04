# SPOTEYFA v0.3.0 - Cross-Platform Release

## 🎯 **Platform Support**

### ✅ **Supported Operating Systems:**
- **Linux**: Ubuntu, Debian, Fedora, Arch Linux, openSUSE
- **macOS**: 10.14+ with Homebrew
- **Windows**: See Windows-specific release for better experience

## 🚀 **Quick Installation**

### **Automatic Installation:**
```bash
chmod +x install.sh
./install.sh
```

### **Manual Installation:**
```bash
# 1. Install Node.js (if not installed)
# Linux (Ubuntu/Debian):
sudo apt install nodejs npm

# macOS (with Homebrew):
brew install node

# 2. Install dependencies
npm install --production

# 3. Start SPOTEYFA
npm start
```

## 🎨 **Features**

### **Core Features:**
- 🍎 **Apple Glassmorphism Design** - Beautiful modern interface
- 🎵 **Spotify Integration** - Full playback control
- 🖥️ **Multi-Monitor Support** - Advanced display management
- 🎯 **Focus Mode** - Fullscreen app compatibility
- ⏰ **Sleep Timer** - Auto-shutdown functionality
- 🌍 **Internationalization** - German/English support

### **Technical Features:**
- ⚡ **Electron-based** - Cross-platform compatibility
- 🔧 **Configurable** - Extensive customization options
- 🔄 **Auto-updates** - Seamless update system
- 📱 **Responsive UI** - Adapts to different screen sizes

## 📋 **Requirements**

### **System Requirements:**
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Spotify Premium Account** (for full functionality)
- **Internet Connection** (for Spotify API)

### **Hardware Requirements:**
- **RAM**: 512MB minimum, 1GB recommended
- **Storage**: 200MB free space
- **Graphics**: Hardware acceleration support recommended

## 🛠️ **Usage**

### **First-Time Setup:**
1. Run the installation script: `./install.sh`
2. Start SPOTEYFA: `./start-spoteyfa.sh`
3. Follow the setup wizard to connect your Spotify account
4. Enjoy your music with beautiful Apple-style interface!

### **Daily Usage:**
```bash
# Start SPOTEYFA
./start-spoteyfa.sh

# Or directly
npm start
```

## 🔧 **Configuration**

### **Config Location:**
- **Linux**: `~/.spoteyfa/`
- **macOS**: `~/Library/Application Support/SPOTEYFA/`

### **Available Settings:**
- Display preferences (monitor, position, size)
- Audio settings (volume, quality)
- UI customization (themes, transparency)
- Keyboard shortcuts
- Language selection

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **"Node.js not found"**
```bash
# Install Node.js for your system
# Ubuntu/Debian: sudo apt install nodejs npm
# Fedora: sudo dnf install nodejs npm  
# Arch: sudo pacman -S nodejs npm
# macOS: brew install node
```

#### **"npm install fails"**
```bash
# Clear npm cache and retry
npm cache clean --force
npm install --production
```

#### **"Electron app won't start"**
```bash
# Check dependencies
npm ls
# Reinstall if needed
rm -rf node_modules
npm install --production
```

#### **"Spotify connection issues"**
- Ensure you have a Spotify Premium account
- Check your internet connection
- Verify Spotify API credentials in setup wizard

## 📞 **Support**

### **Get Help:**
- 📂 **GitHub Issues**: https://github.com/Avacon00/spoteyfa/issues
- 📖 **Documentation**: Check README.md files
- 🐛 **Bug Reports**: Use GitHub issue templates

### **System Information for Bug Reports:**
```bash
# Include this information in bug reports
echo "OS: $(uname -s) $(uname -r)"
echo "Arch: $(uname -m)"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
```

## 📄 **License**
MIT License - See LICENSE.txt for details

## 🎵 **Enjoy!**
SPOTEYFA brings the beautiful Apple music experience to your Linux/macOS desktop!