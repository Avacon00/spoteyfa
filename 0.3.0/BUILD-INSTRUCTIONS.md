# 🔨 SPOTEYFA v0.3.0 - Build Instructions

## 📋 Prerequisites

### System Requirements
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher  
- **Git** (for cloning and version control)
- **Internet connection** (for dependencies)

### Platform-Specific Tools

#### Windows
- **Visual Studio Build Tools** 2019 or later
- **Python** 3.8+ (for native modules)
- **Windows 10 SDK** (for native integrations)

#### macOS  
- **Xcode Command Line Tools**
- **macOS 10.14+** (for building universal binaries)
- **Apple Developer Certificate** (for code signing)

#### Linux
- **build-essential** package
- **libnss3-dev** (for Electron)
- **libdrm2**, **libxss1**, **libgconf-2-4** (runtime dependencies)

## 🚀 Quick Build

```bash
# 1. Navigate to release directory
cd 0.3.0

# 2. Install all dependencies
npm install

# 3. Build for current platform
npm run build
```

## 🔧 Development Build

```bash
# Install dependencies
npm install

# Start development server with DevTools
npm run dev

# For debugging specific features
npm run dev -- --debug-performance
npm run dev -- --debug-i18n
npm run dev -- --debug-focus-mode
```

## 📦 Production Builds

### All Platforms (Recommended)
```bash
# Build for all platforms
npm run build

# Outputs:
# dist/win-unpacked/     - Windows executable
# dist/mac/              - macOS app bundle  
# dist/linux-unpacked/   - Linux AppImage
```

### Platform-Specific Builds

#### Windows
```bash
npm run build -- --win

# Output: dist/SPOTEYFA-0.3.0-Setup.exe
# Type: NSIS installer with auto-updater
```

#### macOS
```bash  
npm run build -- --mac

# Output: dist/SPOTEYFA-0.3.0.dmg
# Type: Universal binary (Intel + Apple Silicon)
```

#### Linux
```bash
npm run build -- --linux

# Output: dist/SPOTEYFA-0.3.0.AppImage
# Type: Portable AppImage
```

## 🧪 Testing Builds

### Automated Testing
```bash
# Run syntax validation
npm run validate

# Performance benchmarks
npm run benchmark

# Feature validation
npm run test-features
```

### Manual Testing Checklist

#### Core Functionality
- [ ] Spotify OAuth flow works
- [ ] Music playback controls responsive
- [ ] Theme switching functional
- [ ] Auto-hide timing correct

#### New v0.3.0 Features
- [ ] Right-click context menu appears
- [ ] Drag & drop window movement
- [ ] Multi-monitor position memory
- [ ] Language switching (DE/EN)
- [ ] Sleep timer countdown
- [ ] Focus mode detection
- [ ] Auto-updater notifications

#### Platform Integration
- [ ] **Windows:** Taskbar integration, rounded corners
- [ ] **macOS:** Vibrancy effects, global shortcuts
- [ ] **Linux:** MPRIS integration, desktop file

#### Performance Validation
- [ ] Startup under 2 seconds
- [ ] Memory usage under 50MB
- [ ] CPU usage under 1% when idle
- [ ] Smooth 60fps animations

## 🔍 Debugging

### Enable Debug Mode
```bash
# Full debug logging
DEBUG=spoteyfa:* npm run dev

# Feature-specific debugging  
DEBUG=spoteyfa:focus-mode npm run dev
DEBUG=spoteyfa:i18n npm run dev
DEBUG=spoteyfa:performance npm run dev
```

### Debug Features

#### Performance Profiling
```javascript
// In DevTools console
performance.mark('app-start');
// ... app loads
performance.mark('app-ready');
performance.measure('startup-time', 'app-start', 'app-ready');
```

#### Memory Monitoring
```javascript
// In DevTools console  
setInterval(() => {
  console.log('Memory:', process.memoryUsage());
}, 5000);
```

## 📤 Release Package Creation

### 1. Pre-Release Validation
```bash
# Validate all code
npm run lint
npm run test
npm run validate-build

# Performance benchmarks
npm run benchmark
```

### 2. Version Bumping
```bash
# Update version in package.json
npm version 0.3.0

# Update version strings in code
sed -i 's/0\.2\.5/0.3.0/g' *.js *.html *.md
```

### 3. Build All Platforms
```bash
# Clean previous builds
rm -rf dist/

# Build for all platforms
npm run build-all-platforms

# Verify outputs
ls -la dist/
```

### 4. Create Release Archive
```bash
# Create zip with all platforms
zip -r SPOTEYFA-v0.3.0-All-Platforms.zip dist/

# Create individual platform zips
zip -r SPOTEYFA-v0.3.0-Windows.zip dist/*win*
zip -r SPOTEYFA-v0.3.0-macOS.zip dist/*mac*  
zip -r SPOTEYFA-v0.3.0-Linux.zip dist/*linux*
```

## 🔐 Code Signing

### Windows Code Signing
```bash
# Using DigiCert/Sectigo certificate
signtool sign /f certificate.p12 /p PASSWORD /t http://timestamp.digicert.com dist/*.exe
```

### macOS Code Signing  
```bash
# Using Apple Developer Certificate
codesign --force --verify --verbose --sign "Developer ID Application: Your Name" dist/SPOTEYFA.app
```

## 📊 Build Optimization

### Bundle Size Optimization
```bash
# Analyze bundle size
npm run analyze-bundle

# Remove unused dependencies
npm run prune-deps

# Minimize assets
npm run optimize-assets
```

### Performance Optimizations
- Electron v28+ for latest V8 improvements
- Context isolation for security
- Preload scripts for faster IPC
- Asset compression for smaller downloads

## 🚨 Common Build Issues

### Issue: Native Module Compilation Fails
```bash
# Solution: Rebuild native modules
npm run rebuild-native

# Alternative: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Code Signing Fails
- Verify certificate is valid and not expired
- Check certificate store has private key
- Ensure timestamp server is accessible

### Issue: macOS Notarization Fails  
```bash
# Submit for notarization
xcrun altool --notarize-app --file SPOTEYFA-0.3.0.dmg --username your@email.com --password APP_PASSWORD
```

## ✅ Build Verification

### Final Checklist
- [ ] All platforms build successfully
- [ ] No security warnings
- [ ] File sizes reasonable (<100MB)
- [ ] Digital signatures valid
- [ ] Auto-updater configuration correct
- [ ] All new features functional

---

**Build System Status: Ready for Production** 🚀