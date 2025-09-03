# 🚀 SPOTEYFA v0.3.0 - Setup-Anleitung

## 📋 Schnell-Setup

### 1. **Download & Entpacken**
- Neueste Version für deine Plattform herunterladen
- Archiv an gewünschten Ort entpacken
- Zum `0.3.0` Ordner navigieren

### 2. **Abhängigkeiten installieren**
```bash
npm install
```

### 3. **Anwendung starten**
```bash
npm start
```

### 4. **Setup-Wizard folgen**
Der Setup-Wizard führt dich durch:
- Spotify Developer Account Erstellung
- API-Zugangsdaten Konfiguration
- Feature-Tutorial für v0.3.0

---

## 🔑 Spotify API Einrichtung

### Schritt 1: Spotify Developer Account erstellen
1. Besuche [developer.spotify.com](https://developer.spotify.com)
2. Melde dich mit deinem Spotify-Account an
3. Akzeptiere die Nutzungsbedingungen

### Schritt 2: Neue App erstellen
1. Klicke **"Create App"**
2. Fülle das Formular aus:
   - **App Name**: SPOTEYFA (oder deine Wahl)
   - **App Description**: Persönlicher Spotify-Overlay-Player
   - **Redirect URI**: `http://localhost:8888/callback`
   - **APIs**: Web API

### Schritt 3: Zugangsdaten abrufen
1. In deinem App-Dashboard, klicke **"Settings"**
2. Kopiere deine **Client ID**
3. Klicke **"View client secret"** und kopiere **Client Secret**

### Schritt 4: In SPOTEYFA eingeben
1. Starte SPOTEYFA
2. Der Setup-Wizard fragt nach den Zugangsdaten
3. Füge Client ID und Client Secret ein
4. Klicke **"Validieren & Fortfahren"**

---

## 🎯 Erste Features im Überblick

### Neue v0.3.0 Features Übersicht
- **Rechtsklick-Menü**: Alle Features sofort verfügbar
- **Drag & Drop**: Player verschieben ohne Einstellungen
- **Multi-Monitor**: Intelligente Positionierung über Displays
- **Sleep Timer**: Auto-Pause nach eingestellter Zeit
- **Sprachunterstützung**: Deutsch/Englisch Wechsel
- **Focus-Modus**: Auto-Verstecken bei Gaming/Videos

### Feature-Tutorial
Der Setup-Wizard enthält ein interaktives Tutorial mit:
- Verwendung des Rechtsklick-Kontextmenüs
- Drag & Drop Funktionalität Demonstration
- Sleep Timer Konfigurationsoptionen
- Sprachwechsel-Prozess
- Focus-Modus Verhalten Erklärung

---

## 🖱️ Grundlegende Nutzung

### Rechtsklick-Kontextmenü
- **Always on Top**: Fenster-Priorität umschalten
- **Hide for X minutes**: Temporäres Verstecken (5min/15min)
- **Pin to Corner**: An Bildschirmecken einrasten
- **Sleep Timer**: Auto-Pause Zeit einstellen
- **Settings**: Sprache und Einstellungen
- **About**: GitHub Repository Zugang

### Drag & Drop Bedienung
- Klicken und halten irgendwo auf dem Player
- Zur gewünschten Position ziehen
- Loslassen zum Platzieren
- Position wird automatisch pro Monitor gespeichert

### Multi-Monitor Unterstützung
- Player merkt sich Position auf jedem Display
- Passt sich automatisch beim Wechseln zwischen Monitoren an
- Intelligente Positionierung verhindert Off-Screen Platzierung

---

## ⚙️ Konfigurationsoptionen

### Spracheinstellungen
1. Rechtsklick auf Player
2. **"Settings"** auswählen
3. **"Deutsch"** oder **"English"** wählen
4. Änderung wird sofort angewendet

### Performance-Einstellungen
- Memory-Cleanup: Automatisch alle 30 Sekunden
- Update-Intervall: 3 Sekunden (performance-optimiert)
- Animation: 60fps wenn aktiv, reduziert bei Inaktivität

### Plattform-Integration
- **Windows**: Taskbar-Integration, abgerundete Ecken
- **macOS**: Native Vibrancy, Dock-Integration
- **Linux**: MPRIS-Unterstützung, Desktop-Benachrichtigungen

---

## 🔧 Fehlerbehebung

### Häufige Probleme

#### Setup-Wizard erscheint nicht
```bash
# Gespeicherte Zugangsdaten löschen
localStorage.removeItem('spotify_client_id');
localStorage.removeItem('spotify_client_secret');
# Anwendung neu starten
```

#### Authentifizierung schlägt fehl
- Client ID und Secret auf Korrektheit prüfen
- Internetverbindung überprüfen
- Spotify-Account auf Aktivität prüfen
- Client Secret neu generieren versuchen

#### Player aktualisiert nicht
- Prüfen ob Spotify Musik abspielt
- Spotify-Account Premium-Status verifizieren (empfohlen)
- Sowohl Spotify als auch SPOTEYFA neu starten

#### Focus-Modus funktioniert nicht
- Vollbild-Erkennung aktiviert lassen
- Prüfen ob Gaming/Video-App wirklich im Vollbild ist
- Plattformspezifische Erkennung kann variieren

### Performance-Probleme

#### Hoher Speicherverbrauch
- Automatische Bereinigung aktiviert lassen
- Anwendung neu starten wenn Speicher über 100MB
- Andere Electron-Anwendungen schließen

#### Langsamer Start
- npm-Cache leeren: `npm cache clean --force`
- Abhängigkeiten neu installieren: `rm -rf node_modules && npm install`
- System-Ressourcen-Beschränkungen prüfen

---

## 📱 Plattformspezifische Hinweise

### Windows 10/11
- Benötigt Windows 10 Version 1903 oder neuer für alle Features
- Windows Defender zeigt möglicherweise Warnung beim ersten Start (normal)
- Taskbar-Integration benötigt Windows 11 für abgerundete Ecken

### macOS
- Benötigt macOS 10.14 (Mojave) oder neuer
- Native Vibrancy-Effekte funktionieren am besten ab macOS 11+
- Globale Shortcuts benötigen möglicherweise Barrierefreiheits-Berechtigungen

### Linux
- AppImage-Format für maximale Kompatibilität
- MPRIS-Integration benötigt D-Bus
- Desktop-Benachrichtigungen brauchen Notification-Daemon
- Getestet auf Ubuntu 20.04+, Fedora 34+, Debian 11+

---

## 🔄 Updates

### Auto-Update System
- Prüft alle 2 Stunden auf Updates
- Download im Hintergrund ohne Unterbrechung
- Benachrichtigung wenn Update bereit zur Installation
- Benötigt Neustart zum Anwenden des Updates

### Manuelle Updates
1. Neueste Version von GitHub herunterladen
2. SPOTEYFA vollständig schließen
3. Dateien mit neuer Version ersetzen
4. Anwendung neu starten
5. Bestehende Einstellungen bleiben erhalten

---

## 🆘 Hilfe bekommen

### Dokumentation
- **README.md**: Vollständige Feature-Dokumentation
- **CHANGELOG.md**: Versionshistorie und Änderungen
- **BUILD-INSTRUCTIONS.md**: Entwicklungssetup

### Community-Support
- **GitHub Issues**: Bug-Reports und Feature-Anfragen
- **GitHub Discussions**: Community-Fragen und Tipps
- **Release Notes**: Neueste Features und Fixes

### Debugging
```bash
# Debug-Modus aktivieren
DEBUG=spoteyfa:* npm run dev

# Performance-Debugging
npm run dev -- --debug-performance

# Feature-spezifisches Debugging
npm run dev -- --debug-i18n
npm run dev -- --debug-focus-mode
```

---

**🎵 Willkommen bei SPOTEYFA v0.3.0 - Die Performance-Revolution! ✨**

*Für zusätzliche Hilfe, besuche unser GitHub Repository*