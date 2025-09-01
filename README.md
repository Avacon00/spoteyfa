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
   - ~~Die sind bereits in `renderer.js` eingetragen~~ ✅ **Automatisch über Setup-Wizard**

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

### **🧙‍♂️ Setup-Wizard (Erster Start)**

Beim ersten Start erscheint automatisch ein **deutscher Setup-Wizard**, der dich durch die Einrichtung führt:

#### **Schritt 1: Willkommen**
- Begrüßung und Überblick über die Einrichtung
- **"Weiter"** zum nächsten Schritt

#### **Schritt 2: Spotify Developer Account**
- **Anleitung** zur Erstellung eines Spotify Developer Accounts
- **"Developer Dashboard öffnen"** Button führt direkt zu [developer.spotify.com](https://developer.spotify.com/dashboard)
- **Hilfe-Tooltips** für jeden Schritt:
  1. Account erstellen/einloggen
  2. Neue App erstellen (`name: "Mein Spotify Player"`)
  3. Client ID und Client Secret kopieren

#### **Schritt 3: Zugangsdaten eingeben**
- **Client ID** Eingabefeld mit Validierung
- **Client Secret** Eingabefeld (versteckbar mit 👁/🙈 Button)
- **Hilfe-Buttons** (❓) mit detaillierten Tooltips
- **"Zugangsdaten validieren & Starten"** prüft die Daten live über Spotify API

#### **Automatische Validierung**
```javascript
// Live-Validierung der Zugangsdaten
const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret) },
    body: new URLSearchParams({ grant_type: 'client_credentials' })
});
```

#### **Nach erfolgreicher Einrichtung**
- Zugangsdaten werden in `localStorage` gespeichert
- Setup-Wizard verschwindet automatisch
- **Apple-Style Player** startet sofort
- Einrichtung muss nie wiederholt werden

### **🎵 Normale Verwendung (Nach Setup)**
1. App startet direkt mit Apple-Glasmorphismus-Design
2. Zeigt aktuell spielenden Spotify-Song
3. Echtzeit-Updates alle 2 Sekunden, flüssige 60fps Timeline-Animation

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

- ~~**OAuth-Flow**: Derzeit Demo-Modus, echte Spotify-Auth muss implementiert werden~~ ✅ **Setup-Wizard implementiert**
- **Token-Refresh**: Automatische Token-Erneuerung fehlt
- **macOS-Optimierung**: Vibrancy-Effekte nur auf Mac verfügbar
- **Performance**: Electron hat höheren RAM-Verbrauch als native Apps

## 🔧 Zurücksetzen der Einrichtung

Falls du deine Spotify-Zugangsdaten ändern möchtest:

```javascript
// Öffne DevTools (F12) und führe aus:
localStorage.removeItem('spotify_client_id');
localStorage.removeItem('spotify_client_secret');
location.reload(); // Setup-Wizard erscheint wieder
```

## 📄 Lizenz

MIT License - Frei verwendbar für persönliche und kommerzielle Projekte.

---

**🍎 Perfekte Apple-Ästhetik mit moderner Web-Technologie!**
