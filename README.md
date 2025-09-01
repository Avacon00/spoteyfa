# 🎵 Spotify Desktop Overlay Tool

Ein elegantes, ressourcenschonendes Windows-Desktop-Tool, das Benachrichtigungen für neue Spotify-Songs anzeigt.

## ✨ Features

- **Echtzeit-Monitoring**: Überwacht aktuell spielende Spotify-Songs
- **Elegante Overlays**: Dezente, animierte Benachrichtigungen oben rechts
- **Album-Cover**: Zeigt Thumbnail des aktuellen Album-Covers
- **Auto-Hide**: Benachrichtigungen verschwinden nach 5 Sekunden automatisch
- **Klick-to-Open**: Klick auf Benachrichtigung öffnet Song in Spotify
- **Windows-Startup**: Startet automatisch mit Windows
- **Ressourcenschonend**: Minimaler Speicher- und CPU-Verbrauch
- **Moderne UI**: Dunkles Design mit glatten Animationen

## 🛠️ Installation

### 1. Dependencies installieren
```bash
python setup.py
```

### 2. Spotify API einrichten
1. Gehe zu [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Erstelle eine neue App
3. Kopiere **Client ID** und **Client Secret**
4. Öffne `spotify_overlay.py` und trage die Credentials ein:
   ```python
   CLIENT_ID = "deine_client_id_hier"
   CLIENT_SECRET = "dein_client_secret_hier"
   ```
5. Setze in der Spotify App die **Redirect URI** auf: `http://localhost:8888/callback`

### 3. Tool starten
```bash
python spotify_overlay.py
```

## 🚀 Verwendung

1. **Erstes Starten**: Beim ersten Start öffnet sich automatisch der Browser für die Spotify-Authentifizierung
2. **Automatische Benachrichtigungen**: Sobald ein neuer Song startet, erscheint eine Overlay-Benachrichtigung
3. **Interaktion**: Klicke auf die Benachrichtigung um den Song in Spotify zu öffnen
4. **Background-Modus**: Das Tool läuft unsichtbar im Hintergrund

## ⚙️ Konfiguration

### Windows-Startup
Das Tool fügt sich automatisch zum Windows-Startup hinzu. Falls gewünscht, kann dies deaktiviert werden:

```python
# In spotify_overlay.py - Zeile entfernen oder kommentieren:
SystemTrayManager.add_to_startup()
```

### Overlay-Anpassungen
Verschiedene Einstellungen können in der `OverlayWindow`-Klasse angepasst werden:

```python
# Position und Größe
width, height = 350, 100
x = screen_width - width - 20  # Abstand vom rechten Rand
y = 20  # Abstand vom oberen Rand

# Auto-Hide Timer
self.root.after(5000, self.hide)  # 5000ms = 5 Sekunden

# Transparenz
self.root.attributes('-alpha', 0.95)  # 0.0 bis 1.0
```

## 🔧 Systemanforderungen

- **Betriebssystem**: Windows 10/11
- **Python**: 3.8 oder höher
- **Spotify**: Desktop-App oder Web-Player im Browser
- **Internet**: Für Spotify API und Album-Cover

## 📁 Projektstruktur

```
spoteyfa/
├── spotify_overlay.py    # Hauptanwendung
├── setup.py             # Setup-Script
├── requirements.txt     # Python-Dependencies
└── README.md           # Dokumentation
```

## 🔍 Architektur

Das Tool ist modular aufgebaut für einfache Erweiterungen:

### Hauptkomponenten
- **SpotifyClient**: API-Anbindung und Datenabruf
- **OverlayWindow**: GUI und Benachrichtigungsanzeige  
- **SystemTrayManager**: Windows-Integration
- **SpotifyOverlayApp**: Orchestrierung und Monitoring

### Erweiterungsmöglichkeiten
- **Weitere Musik-Services**: Neue Client-Klassen für Apple Music, YouTube Music etc.
- **Customization**: Themes, Positionen, Animationen
- **Hotkeys**: Globale Tastenkombinationen
- **Statistiken**: Hörgewohnheiten tracken
- **Social Features**: Teilen aktueller Songs

## 🐛 Troubleshooting

### "Spotify API-Credentials nicht konfiguriert"
- Stelle sicher, dass CLIENT_ID und CLIENT_SECRET korrekt eingetragen sind
- Prüfe, dass die Redirect URI in der Spotify App gesetzt ist

### "Fehler bei Spotify-Initialisierung"  
- Stelle sicher, dass Spotify läuft (Desktop-App oder Browser)
- Prüfe deine Internetverbindung
- Lösche `.spotify_cache` und starte neu

### Overlay wird nicht angezeigt
- Prüfe, dass ein Song in Spotify läuft
- Stelle sicher, dass Windows-Benachrichtigungen aktiviert sind
- Prüfe die Bildschirmauflösung (Overlay könnte außerhalb sein)

## 📄 Lizenz

Dieses Projekt ist für persönlichen Gebrauch entwickelt. Spotify ist ein Markenzeichen von Spotify AB.

## 🤝 Beitragen

Pull Requests und Issues sind willkommen! Besonders für:
- Performance-Optimierungen
- Neue Multimedia-Integrationen  
- UI/UX Verbesserungen
- Cross-Platform Kompatibilität