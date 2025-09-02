# 🎵 Apple Spotify Player - Portable Release Guide

## 📥 Download & Run

### Für Windows-Benutzer:
1. **Gehe zu [Releases](https://github.com/Avacon00/spoteyfa/releases)**
2. **Download** die neueste `Apple-Spotify-Player-X.X.X-portable.exe`
3. **Doppelklick** auf die .exe - fertig! ✨

### ✅ Keine Installation erforderlich
- ❌ Keine Admin-Rechte nötig
- ❌ Keine Registry-Einträge  
- ❌ Keine System-Veränderungen
- ✅ Einfach herunterladen und starten

## 🚀 Erste Schritte

### 1. Setup-Wizard
Beim ersten Start führt dich der **deutsche Setup-Wizard** durch die Einrichtung:
- Spotify Developer Account erstellen
- Client ID und Secret eingeben  
- Automatische Validierung

### 2. Spotify Autorisierung
- Browser öffnet automatisch
- Bei Spotify anmelden
- App autorisieren
- Zurück zum Player

### 3. Fertig! 🎉
- Player startet automatisch
- Zeigt aktuellen Song
- Apple-Design mit Glasmorphismus
- Auto-Hide nach 12 Sekunden

## ✨ Features

### 🍎 Authentisches Apple Design
- **Glassmorphismus** mit Backdrop-Filter
- **SF Pro Display** Schrift
- **Abgerundete Ecken** und Schatten
- **Smooth Animationen**

### 🎵 Vollständige Spotify Integration
- **Live Track-Anzeige** (Titel, Künstler, Album)  
- **Hochauflösende Cover** (240x240px)
- **Media Controls** (Play/Pause, Next/Previous)
- **Echtzeit Progress-Bar** mit 60fps Animation
- **Volume Control** mit visueller Rückmeldung

### 🌙 Personalisierung
- **Dark/Light Mode** Toggle
- **Auto-Hide** Funktionalität  
- **Always-on-top** Overlay
- **Sichere Credential-Speicherung**

### 🔒 Sicherheit
- **OAuth 2.0** Authentifizierung
- **Verschlüsselte** lokale Datenspeicherung
- **Sichere API-Kommunikation**
- **Keine Hardcoded Secrets**

## 🔧 Technische Details

- **Electron Framework** v28
- **Node.js** Backend
- **Sichere Preload-Scripts**
- **Context Isolation** aktiviert
- **WebSecurity** aktiviert

## 💡 Troubleshooting

### App startet nicht?
1. **Windows 10/11** erforderlich (x64)
2. **Internet-Verbindung** prüfen
3. **Antivirus** temporär deaktivieren
4. Als **normaler Benutzer** ausführen (nicht Admin)

### Spotify Verbindung?
1. **Spotify Account** erforderlich (kostenlos OK)
2. **Developer Account** bei [developer.spotify.com](https://developer.spotify.com)
3. **App** in Dashboard erstellen
4. **Redirect URI**: `http://127.0.0.1:8888/callback`

### Setup neu starten?
1. **F12** drücken (DevTools)  
2. **Console** öffnen
3. Eingeben: `localStorage.clear(); location.reload()`
4. **Enter** drücken

## 🆘 Support

**Issues**: [GitHub Issues](https://github.com/Avacon00/spoteyfa/issues)  
**Discussions**: [GitHub Discussions](https://github.com/Avacon00/spoteyfa/discussions)

---

**Viel Spaß mit deinem Apple-Style Spotify Player!** 🎵✨