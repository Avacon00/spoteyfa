# 🎵 SPOTEYFA v0.3.0 - Asset Icons Guide

## 📁 Icon Assets Overview

This directory contains all platform-specific icon assets for SPOTEYFA v0.3.0, optimized for the Apple-style design language.

## 🎨 Design Specifications

### **Visual Style**
- **Apple-inspired glassmorphism** aesthetic
- **Spotify green accent** (#1DB954) with Apple blue (#007AFF)
- **Rounded corners** following Apple's design language
- **Clean, minimal iconography** with music note symbolism
- **High contrast** for accessibility across light/dark modes

### **Color Palette**
- **Primary**: #007AFF (Apple Blue)
- **Secondary**: #1DB954 (Spotify Green)  
- **Background**: Glassmorphism with 40% blur
- **Text**: #1D1D1F (Apple Text Dark) / #FFFFFF (Apple Text Light)

## 📱 Platform-Specific Icons

### **Windows (.ico)**
- **File**: `icon.ico`
- **Sizes**: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256
- **Format**: ICO with embedded PNG layers
- **Usage**: Window icon, taskbar, system tray, installer

### **macOS (.icns)**  
- **File**: `icon.icns`
- **Sizes**: 16x16@1x, 16x16@2x, 32x32@1x, 32x32@2x, 128x128@1x, 128x128@2x, 256x256@1x, 256x256@2x, 512x512@1x, 512x512@2x
- **Format**: ICNS with Retina support
- **Usage**: Dock, Finder, Applications folder, spotlight

### **Linux (.png)**
- **File**: `icon.png`  
- **Size**: 512x512 (primary), with 256x256, 128x128, 64x64, 32x32, 16x16 variants
- **Format**: PNG with transparency
- **Usage**: Application menu, desktop shortcut, window manager

## 🔧 Icon Creation Guidelines

### **For Developers/Designers**
If you need to recreate or modify the icons:

1. **Base Design**:
   - Start with 512x512 canvas
   - Use glassmorphism effect (blur, transparency)
   - Include subtle music note or Spotify-style wave pattern
   - Apply Apple-standard rounded corners (20% of width/height)

2. **Color Application**:
   - Background: Semi-transparent with backdrop blur
   - Primary elements: Apple blue (#007AFF)
   - Accent elements: Spotify green (#1DB954)
   - Ensure WCAG AA contrast compliance

3. **Export Settings**:
   - **PNG**: Transparent background, high quality
   - **ICO**: Multiple sizes embedded, optimized for Windows
   - **ICNS**: Retina-ready with @1x and @2x variants

## 🛠️ Build Integration

### **Electron Builder Configuration**
Icons are automatically integrated during build:

```json
{
  "mac": {
    "icon": "assets/icons/icon.icns"
  },
  "win": {
    "icon": "assets/icons/icon.ico"
  },
  "linux": {
    "icon": "assets/icons/icon.png"
  }
}
```

### **Auto-Generated Variants**
Electron Builder automatically generates:
- **Windows**: Multiple ICO sizes for different contexts
- **macOS**: Dock icons, notification icons, menu bar icons
- **Linux**: Desktop entry icons, window manager icons

## 🎨 Visual Identity

### **Brand Consistency**
- Icons maintain SPOTEYFA's Apple-inspired aesthetic
- Consistent with the main application's glassmorphism theme
- Recognizable across all platforms and contexts
- Professional appearance suitable for productivity environments

### **Accessibility Features**
- High contrast variants for accessibility modes
- Clear distinction in monochrome/grayscale
- Appropriate sizing for vision-impaired users
- Platform-specific accessibility integration

---

**Built with ❤️ for the SPOTEYFA Community**  
*Apple-style design meets Spotify functionality*