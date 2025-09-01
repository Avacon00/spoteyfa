Apple-Style Spotify Player
Ein moderner Spotify-Player im  Apple Music Design mit teilweisen echten **Glasmorphismus** und **Backdrop-Filter-Effekten**.

![spoteyfa_dark](https://github.com/user-attachments/assets/27be7b40-1d0b-4ce4-bc86-249b29479b66)
![spoteyfa_light](https://github.com/user-attachments/assets/ecdd5442-6575-4104-aab6-fb4d3d8171e3)

## ✨ Features

### 🎨 **Perfektes Apple-Design**
- **Echtes Glasmorphismus**: `backdrop-filter: blur(40px)`
- **Abgerundete Ecken**: 20px border-radius
- **Apple-Schatten**: Weiche 60px Schatten mit 10% Opacity
- **SF Pro Display** Typography (Segoe UI fallback)
- **Apple-Farbschema**: #007aff Blue, #1d1d1f Text, etc.

### 🎵 **Spotify-Integration**
- **Live Track-Daten**: Titel, Künstler, Album
- **Hochauflösende Cover**: 240x240px Album-Covers
- **Funktionale Controls**: Play/Pause, Previous/Next
- **Echtzeit-Progress**: Smooth animierte Progress-Bar
- **Click-to-Open**: Cover-Klick öffnet Spotify

### 🚀 **Apple-Animationen**
- **60fps Progress-Animation**: Butterweiche Bewegungen
- **Smooth Hover-Effekte**: Apple-typische Micro-Interactions
- **Fade-Transitions**: 300ms cubic-bezier Übergänge
- **Scale-Feedback**: Button-Press Animationen

## 🛠️ Installation

### Voraussetzungen
- **Node.js** 18+ 
- **npm** oder **yarn**
- **Spotify Developer Account**

### Setup

1. **Dependencies installieren**:
   ```bash
   cd electron-player
   npm install
   ```

2. **Spotify API konfigurieren**:
   - Gehe zu [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Erstelle eine neue App
   - Kopiere Client ID und Secret
   - Die sind bereits in `renderer.js` eingetragen

3. **App starten**:
   ```bash
   npm start
   ```

4. **Development-Modus** (mit DevTools):
   ```bash
   npm run dev
   ```

### 📦 Build für Distribution

```bash
npm run build
```

Erstellt ausführbare Dateien in `/dist/`:
- **Windows**: `.exe` Installer
- **macOS**: `.dmg` Package  
- **Linux**: `.AppImage`

## 🎯 Verwendung

### **Erster Start**
1. App startet automatisch mit Glasmorphismus-Effekt
2. Zeigt Demo-Content ("Nachtwind - Digital Dreams")
3. Progress-Bar animiert sich automatisch

### **Spotify-Integration**
1. Für echte Spotify-Daten OAuth-Flow implementieren
2. Token wird in `getSpotifyToken()` abgerufen
3. Automatisches Monitoring alle 2 Sekunden

### **Apple-Interactions**
- **Cover/Titel-Klick**: Öffnet Song in Spotify
- **Play-Button**: ⏸ ↔ ▶ Toggle mit Animation
- **Close-Button**: Apple-Red Hover, Fade-Out
- **Auto-Hide**: 12 Sekunden (Apple-typisch)

## 🔧 Technische Details

### **Glasmorphismus-Implementierung**
```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(40px);
-webkit-backdrop-filter: blur(40px);
border-radius: 20px;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
```

### **Apple-Animationen**
```css
transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### **60fps Progress-Animation**
```javascript
setInterval(() => {
    progressValue += 0.001;
    progressBar.style.width = `${progressValue * 100}%`;
}, 16); // 60fps
```

### **Electron-Konfiguration**
- **Transparent Window**: `transparent: true`
- **Always On Top**: `alwaysOnTop: true`
- **No Frame**: `frame: false`
- **macOS Vibrancy**: `vibrancy: 'ultra-dark'`

## 📱 Design-Spezifikation

### **Exakte Maße**
- **Fenster**: 400px × 500px
- **Album-Cover**: 240px × 240px
- **Progress-Bar**: 4px Höhe
- **Play-Button**: 50px × 50px
- **Volume-Bar**: 120px Breite

### **Apple-Typography**
- **Song-Titel**: 22px, font-weight 600
- **Künstler**: 16px, color #6e6e73  
- **Album**: 14px, color #8e8e93
- **Zeit**: 13px, tabular-nums

### **Farb-Palette**
```css
--apple-blue: #007aff;
--apple-primary: #1d1d1f;
--apple-secondary: #6e6e73;
--apple-tertiary: #8e8e93;
--apple-red: #ff3b30;
--progress-bg: #e5e5e7;
```

## 🌟 Warum Electron statt tkinter?

| Feature | tkinter | Electron |
|---------|---------|----------|
| **Glasmorphismus** | ❌ Nicht möglich | ✅ Echte CSS-Effekte |
| **Abgerundete Ecken** | ❌ Simulation nur | ✅ Native border-radius |
| **Blur-Effekte** | ❌ Keine Unterstützung | ✅ backdrop-filter |
| **Smooth Animationen** | ❌ Begrenzt | ✅ 60fps CSS-Transitions |
| **Apple-Typography** | ❌ Eingeschränkt | ✅ Vollständige Font-Control |
| **Cross-Platform** | ⚠️ Styling-Unterschiede | ✅ Identisch überall |

## 🚨 Bekannte Limitierungen

- **OAuth-Flow**: Derzeit Demo-Modus, echte Spotify-Auth muss implementiert werden
- **Token-Refresh**: Automatische Token-Erneuerung fehlt
- **macOS-Optimierung**: Vibrancy-Effekte nur auf Mac verfügbar
- **Performance**: Electron hat höheren RAM-Verbrauch als native Apps

## 📄 Lizenz

MIT License - Frei verwendbar für persönliche und kommerzielle Projekte.

---

**🍎 Perfekte Apple-Ästhetik mit moderner Web-Technologie!**
