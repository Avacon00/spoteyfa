Ein moderner Spotify-Overlay im Apfel-Design mit kleinen **Glasmorphismus** und **Backdrop-Filter-Effekten**.

![spoteyfa_dark](https://github.com/user-attachments/assets/27be7b40-1d0b-4ce4-bc86-249b29479b66)
![spoteyfa_light](https://github.com/user-attachments/assets/ecdd5442-6575-4104-aab6-fb4d3d8171e3)

## ✨ Features

### 🎨 **Apfel-Design**
- **Glasmorphismus**: `backdrop-filter: blur(40px)`
- **Abgerundete Ecken**
- **Schatten**
- **SF Pro Display**
- **Farbschema 007aff Blue, #1d1d1f**

### 🎵 **Spotify-Integration**
- **Live Track-Daten**: Titel, Künstler, Album
- **Hochauflösende Cover**: 240x240px Album-Covers
- **Funktionale Controls**: Play/Pause, Previous/Next
- **Echtzeit-Progress**: Smooth animierte Progress-Bar
- **Click-to-Open**: Cover-Klick öffnet Spotify

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
   - ✅ **Automatisch über Setup-Wizard**

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

### **🎵 Normale Verwendung (Nach Setup)**
1. App startet direkt mit Apple-Glasmorphismus-Design
2. Zeigt aktuell spielenden Spotify-Song
3. Echtzeit-Updates alle 1-2 Sekunden, flüssige 60fps Timeline-Animation

### **Interactions**
- **Cover/Titel-Klick**: Öffnet Song in Spotify
- **Play-Button**: ⏸ ↔ ▶ Toggle mit Animation
- **Close-Button**: Apple-Red Hover, Fade-Out
- **Auto-Hide**: 12 Sekunden (Apple-typisch)

## 🔧 Technische Details
### **60fps Progress-Animation**
```javascript
setInterval(() => {
    progressValue += 0.001;
    progressBar.style.width = `${progressValue * 100}%`;
}, 16); // 60fps
```
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
