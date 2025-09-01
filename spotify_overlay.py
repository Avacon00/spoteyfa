#!/usr/bin/env python3
"""
Spotify Desktop Overlay Tool
Ein schlankes Windows-Desktop-Tool für Spotify Song-Benachrichtigungen.
Zeigt elegante Overlay-Notifications mit Albumcover, Titel und Interpret.
"""

import tkinter as tk
from tkinter import ttk
import threading
import time
import requests
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import json
import os
from PIL import Image, ImageTk
import io
# Windows-APIs (optional - fallback ohne win32gui)
try:
    import win32gui
    import win32con
    WIN32_AVAILABLE = True
except ImportError:
    WIN32_AVAILABLE = False
import winreg
import sys
import webbrowser
from typing import Optional, Dict, Any


class SpotifyConfig:
    """Spotify API Konfiguration und Authentifizierung"""
    CLIENT_ID = "775fb3995b714b2e91ddd0c4c36861d9"  # Hier Spotify Client ID eintragen
    CLIENT_SECRET = "2c01cacdc1fe4f9d98f3910627508d4e"  # Hier Spotify Client Secret eintragen
    REDIRECT_URI = "http://127.0.0.1:8888/callback"
    SCOPE = "user-read-currently-playing user-read-playback-state user-modify-playback-state"
    
    @classmethod
    def is_configured(cls) -> bool:
        """Prüft ob API-Credentials konfiguriert sind"""
        return bool(cls.CLIENT_ID and cls.CLIENT_SECRET)


class SpotifyClient:
    """Verwaltet die Spotify API-Verbindung und Datenabruf"""
    
    def __init__(self):
        self.sp = None
        self.current_track = None
        self.last_track_id = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialisiert den Spotify Client"""
        if not SpotifyConfig.is_configured():
            print("[WARNING] Spotify API-Credentials nicht konfiguriert!")
            print("[INFO] Bitte CLIENT_ID und CLIENT_SECRET in spotify_overlay.py eintragen")
            return
        
        try:
            # Cache im Temp-Verzeichnis erstellen (Berechtigungen sind sicher)
            import tempfile
            cache_dir = tempfile.gettempdir()
            cache_file = os.path.join(cache_dir, "spotify_overlay_cache.json")
            
            print(f"[DEBUG] Cache-Pfad: {cache_file}")
            
            self.sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
                client_id=SpotifyConfig.CLIENT_ID,
                client_secret=SpotifyConfig.CLIENT_SECRET,
                redirect_uri=SpotifyConfig.REDIRECT_URI,
                scope=SpotifyConfig.SCOPE,
                cache_path=cache_file,
                open_browser=True,
                show_dialog=False  # Verhindert wiederholte Authentifizierung
            ))
            print("[OK] Spotify Client erfolgreich initialisiert")
        except Exception as e:
            print(f"[ERROR] Fehler bei Spotify-Initialisierung: {e}")
            self.sp = None
    
    def get_current_track(self) -> Optional[Dict[str, Any]]:
        """Holt die aktuell spielenden Track-Informationen"""
        if not self.sp:
            return None
        
        try:
            current = self.sp.current_playback()
            if not current or not current.get('is_playing'):
                return None
            
            track = current.get('item')
            if not track:
                return None
            
            track_info = {
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join([artist['name'] for artist in track['artists']]),
                'album': track['album']['name'],
                'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
                'external_url': track['external_urls']['spotify']
            }
            
            return track_info
        except spotipy.exceptions.SpotifyException as e:
            if e.http_status == 401:  # Token abgelaufen
                print("[INFO] Spotify Token abgelaufen - erneue Authentifizierung...")
                self._initialize_client()  # Token erneuern
            else:
                print(f"[WARNING] Spotify API Fehler: {e}")
            return None
        except Exception as e:
            print(f"[WARNING] Fehler beim Abrufen des aktuellen Tracks: {e}")
            return None
    
    def has_track_changed(self) -> bool:
        """Prüft ob sich der aktuelle Track geändert hat"""
        current = self.get_current_track()
        if not current:
            return False
        
        track_changed = current['id'] != self.last_track_id
        if track_changed:
            self.current_track = current
            self.last_track_id = current['id']
        
        return track_changed


class OverlayWindow:
    """Elegantes Overlay-Fenster für Song-Benachrichtigungen"""
    
    def __init__(self, on_click_callback=None, on_play_callback=None, on_skip_callback=None, on_prev_callback=None):
        self.root = None
        self.is_visible = False
        self.on_click_callback = on_click_callback
        self.on_play_callback = on_play_callback
        self.on_skip_callback = on_skip_callback
        self.on_prev_callback = on_prev_callback
        self.fade_job = None
        self._create_window()
    
    def _create_window(self):
        """Erstellt das Overlay-Fenster"""
        self.root = tk.Toplevel()
        self.root.withdraw()  # Zunächst verstecken
        
        # Fenster-Eigenschaften
        self.root.overrideredirect(True)  # Keine Titelleiste
        self.root.attributes('-alpha', 0.92)  # Glass-Transparenz
        self.root.attributes('-topmost', True)  # Immer im Vordergrund
        
        # Apple Music Style mit Spotify-Farben und Windows Glass
        width, height = 380, 420
        screen_width = self.root.winfo_screenwidth()
        x = screen_width - width - 20
        y = 20
        
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        
        # Windows Glass-Effekt: Mehrschichtige Transparenz für Blur-Simulation
        self.shadow_frame = tk.Frame(
            self.root,
            bg='#000000',
            relief='flat',
            bd=0
        )
        self.shadow_frame.pack(fill='both', expand=True, padx=8, pady=8)
        
        # Blur-Layer 1: Dunkle Basis
        self.blur1 = tk.Frame(
            self.shadow_frame,
            bg='#0d1117',  # GitHub/Spotify Dark
            relief='flat',
            bd=0
        )
        self.blur1.pack(fill='both', expand=True, padx=2, pady=2)
        
        # Blur-Layer 2: Glass-Highlight
        self.blur2 = tk.Frame(
            self.blur1,
            bg='#1e1e1e',
            relief='ridge',
            bd=1
        )
        self.blur2.pack(fill='both', expand=True, padx=2, pady=2)
        
        # Hauptframe: Apple Music Style Container
        self.main_frame = tk.Frame(
            self.blur2,
            bg='#1e1e1e',  # Spotify Primary
            relief='flat',
            bd=0
        )
        self.main_frame.pack(fill='both', expand=True, padx=4, pady=4)
        
        # Oberer Bereich: Album-Cover + Track-Info
        self.top_frame = tk.Frame(self.main_frame, bg='#1a1a1a')
        self.top_frame.pack(fill='x', padx=15, pady=(12, 15))
        
        # Album-Cover Container für feste Größe
        self.cover_frame = tk.Frame(
            self.top_frame,
            bg='#1e1e1e',
            width=110,
            height=110
        )
        self.cover_frame.pack(side='left', padx=(0, 15))
        self.cover_frame.pack_propagate(False)  # Verhindert Größenänderung
        
        # Album-Cover Label innerhalb des Containers
        self.cover_label = tk.Label(
            self.cover_frame,
            bg='#1e1e1e',
            relief='flat',
            bd=0
        )
        self.cover_label.pack(expand=True)
        
        # Track-Info Container
        self.info_frame = tk.Frame(self.top_frame, bg='#1a1a1a')
        self.info_frame.pack(side='left', fill='both', expand=True)
        
        # Song-Titel (prominent)
        self.title_label = tk.Label(
            self.info_frame,
            text="",
            font=('Segoe UI', 12, 'bold'),
            fg='#f0f0f0',  # Weicher für Glass-Effekt
            bg='#1e1e1e',
            anchor='w',
            justify='left',
            wraplength=280
        )
        self.title_label.pack(fill='x', pady=(5, 2))
        
        # Künstler
        self.artist_label = tk.Label(
            self.info_frame,
            text="",
            font=('Segoe UI', 10),
            fg='#c0c0c0',  # Heller für bessere Sichtbarkeit
            bg='#1e1e1e',
            anchor='w',
            justify='left',
            wraplength=280
        )
        self.artist_label.pack(fill='x', pady=(0, 5))
        
        # Unterer Bereich: Controls (mehr Platz)
        self.bottom_frame = tk.Frame(self.main_frame, bg='#1a1a1a')
        self.bottom_frame.pack(fill='x', padx=15, pady=(10, 20))
        
        # Media-Controls (zentriert)
        self.controls_frame = tk.Frame(self.bottom_frame, bg='#1a1a1a')
        self.controls_frame.pack()
        
        # Previous-Button (größer)
        self.prev_button = tk.Label(
            self.controls_frame,
            text="⏮",
            font=('Segoe UI', 20),
            fg='#c0c0c0',
            bg='#1e1e1e',
            cursor='hand2',
            padx=10,
            pady=5
        )
        self.prev_button.pack(side='left', padx=8)
        
        # Play/Pause-Button (größer, prominent) - KEINE width/height!
        self.play_button = tk.Label(
            self.controls_frame,
            text="▶",
            font=('Segoe UI', 24),
            fg='#1db954',
            bg='#1e1e1e',
            cursor='hand2',
            padx=15,
            pady=8,
            relief='flat',
            bd=0
        )
        self.play_button.pack(side='left', padx=12)
        
        # Next-Button (größer)
        self.skip_button = tk.Label(
            self.controls_frame,
            text="⏭",
            font=('Segoe UI', 20),
            fg='#c0c0c0',
            bg='#1e1e1e',
            cursor='hand2',
            padx=10,
            pady=5
        )
        self.skip_button.pack(side='left', padx=8)
        
        # Volume-Button (rechts, größer)
        self.volume_button = tk.Label(
            self.controls_frame,
            text="🔊",
            font=('Segoe UI', 18),
            fg='#c0c0c0',
            bg='#1e1e1e',
            cursor='hand2',
            padx=8,
            pady=5
        )
        self.volume_button.pack(side='right', padx=(20, 0))
        
        # Close-Button (oben rechts)
        self.close_button = tk.Label(
            self.main_frame,
            text="✕",
            font=('Segoe UI', 14),
            fg='#666666',
            bg='#1e1e1e',
            cursor='hand2',
            padx=6,
            pady=3
        )
        self.close_button.place(relx=0.95, rely=0.05, anchor='ne')
        
        # Album-Label für Kompatibilität
        self.album_label = None
        
        # Aktuelle Play-State für Button-Update
        self.is_playing = False
        
        # Click-Handler für das gesamte Fenster
        self._bind_click_events()
    
    def _bind_click_events(self):
        """Bindet Click-Events an alle Widgets"""
        # Allgemeine Click-Events (öffnet Spotify)
        general_widgets = [self.cover_frame, self.cover_label, self.title_label, self.artist_label]
        for widget in general_widgets:
            widget.bind('<Button-1>', self._on_click)
        
        # Media-Controls Events
        self.play_button.bind('<Button-1>', self._on_play_click)
        self.skip_button.bind('<Button-1>', self._on_skip_click)
        self.prev_button.bind('<Button-1>', self._on_prev_click)
        self.volume_button.bind('<Button-1>', self._on_volume_click)
        self.close_button.bind('<Button-1>', self._on_close_click)
        
        # Hover-Effekte für Buttons
        self._setup_hover_effects()
    
    def _on_click(self, event):
        """Handler für Klick-Events"""
        if self.on_click_callback:
            self.on_click_callback()
        self.hide()
    
    def _on_play_click(self, event):
        """Handler für Play-Button"""
        if self.on_play_callback:
            self.on_play_callback()
        # Overlay bleibt sichtbar um Feedback zu sehen
    
    def _on_skip_click(self, event):
        """Handler für Skip-Button"""
        if self.on_skip_callback:
            self.on_skip_callback()
    
    def _on_prev_click(self, event):
        """Handler für Previous-Button"""
        if hasattr(self, 'on_prev_callback') and self.on_prev_callback:
            self.on_prev_callback()
    
    def _on_volume_click(self, event):
        """Handler für Volume-Button"""
        print("[CONTROLS] Volume-Button geklickt")
        # TODO: Volume-Control implementieren
    
    def _on_close_click(self, event):
        """Handler für Close-Button"""
        self.hide()
    
    def _setup_hover_effects(self):
        """Setzt Hover-Effekte für Buttons"""
        buttons = [
            (self.play_button, '#1ed760', '#1db954'),
            (self.skip_button, '#ffffff', '#b3b3b3'),
            (self.prev_button, '#ffffff', '#b3b3b3'),
            (self.volume_button, '#ffffff', '#b3b3b3'),
            (self.close_button, '#ff4444', '#666666')
        ]
        
        for button, hover_color, normal_color in buttons:
            button.bind('<Enter>', lambda e, b=button, c=hover_color: b.config(fg=c))
            button.bind('<Leave>', lambda e, b=button, c=normal_color: b.config(fg=c))
    
    def show_track(self, track_info: Dict[str, Any]):
        """Zeigt Track-Informationen im Overlay"""
        # Texte aktualisieren im neuen Layout
        self.title_label.config(text=track_info['name'])      # Song-Titel prominent
        self.artist_label.config(text=track_info['artist'])   # Künstler darunter
        
        # Play-Button-State aktualisieren
        self.is_playing = track_info.get('is_playing', True)
        self._update_play_button()
        
        # Album-Cover laden
        self._load_album_cover(track_info.get('image_url'))
        
        # Fenster anzeigen mit Animation
        self._show_animated()
        
        # Auto-Hide nach 8 Sekunden (längere Anzeige für Web-Player)
        self._schedule_auto_hide(8000)
    
    def _update_play_button(self):
        """Aktualisiert Play-Button basierend auf aktueller Wiedergabe"""
        if self.is_playing:
            self.play_button.config(text="⏸", fg='#1db954')  # Pause-Symbol
        else:
            self.play_button.config(text="▶", fg='#1db954')   # Play-Symbol
    
    def _load_album_cover(self, image_url: Optional[str]):
        """Lädt und zeigt das Album-Cover"""
        if not image_url:
            # Eleganterer Placeholder für fehlendes Cover
            self.cover_label.config(
                text="♫", 
                font=('Segoe UI', 28), 
                fg='#535353',
                bg='#121212'
            )
            return
        
        try:
            # Cover in separatem Thread laden um UI nicht zu blockieren
            threading.Thread(
                target=self._download_and_set_cover,
                args=(image_url,),
                daemon=True
            ).start()
        except Exception as e:
            print(f"[WARNING] Fehler beim Laden des Album-Covers: {e}")
            self.cover_label.config(
                text="♫", 
                font=('Segoe UI', 32), 
                fg='#8b8b8b',
                bg='#2d2d2d'
            )
    
    def _download_and_set_cover(self, image_url: str):
        """Lädt Album-Cover herunter und setzt es (in separatem Thread)"""
        try:
            response = requests.get(image_url, timeout=5)
            response.raise_for_status()
            
            # PIL Image erstellen und auf große Größe resizen (110x110)
            pil_image = Image.open(io.BytesIO(response.content))
            pil_image = pil_image.resize((110, 110), Image.Resampling.LANCZOS)
            
            # In Tkinter PhotoImage konvertieren
            tk_image = ImageTk.PhotoImage(pil_image)
            
            # UI-Update im Hauptthread
            self.root.after(0, lambda: self._set_cover_image(tk_image))
            
        except Exception as e:
            print(f"[WARNING] Fehler beim Download des Album-Covers: {e}")
            # Eleganteres Fallback-Symbol setzen
            self.root.after(0, lambda: self.cover_label.config(
                text="♫", font=('Segoe UI', 28), fg='#535353', bg='#121212'
            ))
    
    def _set_cover_image(self, tk_image):
        """Setzt das Album-Cover-Bild (UI-Thread)"""
        self.cover_label.config(image=tk_image, text="")
        self.cover_label.image = tk_image  # Referenz behalten
    
    def _truncate_text(self, text: str, max_length: int) -> str:
        """Kürzt Text mit Ellipsis wenn zu lang"""
        if len(text) <= max_length:
            return text
        return text[:max_length-3] + "..."
    
    def _show_animated(self):
        """Zeigt das Fenster mit Fade-In Animation"""
        if self.is_visible:
            return
        
        self.is_visible = True
        self.root.deiconify()
        
        # Fade-in Animation
        self._fade_in(0.0)
    
    def _fade_in(self, alpha: float):
        """Fade-In Animation"""
        if alpha < 0.95:
            self.root.attributes('-alpha', alpha)
            self.root.after(20, lambda: self._fade_in(alpha + 0.05))
        else:
            self.root.attributes('-alpha', 0.95)
    
    def _schedule_auto_hide(self, delay_ms=8000):
        """Plant automatisches Ausblenden nach angegebener Zeit"""
        if self.fade_job:
            self.root.after_cancel(self.fade_job)
        
        self.fade_job = self.root.after(delay_ms, self.hide)
    
    def hide(self):
        """Versteckt das Overlay"""
        if not self.is_visible:
            return
        
        self.is_visible = False
        self.root.withdraw()
        
        if self.fade_job:
            self.root.after_cancel(self.fade_job)
            self.fade_job = None


class SystemTrayManager:
    """Verwaltet Windows-Startup und System-Integration"""
    
    @staticmethod
    def add_to_startup():
        """Fügt das Tool zum Windows-Startup hinzu"""
        try:
            # Registry-Pfad für Startup-Programme
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
            
            # Python-Script-Pfad
            script_path = os.path.abspath(__file__)
            python_path = sys.executable
            startup_command = f'"{python_path}" "{script_path}"'
            
            # Registry-Eintrag setzen
            winreg.SetValueEx(key, "SpotifyOverlay", 0, winreg.REG_SZ, startup_command)
            winreg.CloseKey(key)
            
            print("[OK] Tool wurde zum Windows-Startup hinzugefügt")
            return True
            
        except Exception as e:
            print(f"[ERROR] Fehler beim Hinzufügen zum Startup: {e}")
            return False
    
    @staticmethod
    def remove_from_startup():
        """Entfernt das Tool aus dem Windows-Startup"""
        try:
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
            
            winreg.DeleteValue(key, "SpotifyOverlay")
            winreg.CloseKey(key)
            
            print("[OK] Tool wurde aus dem Windows-Startup entfernt")
            return True
            
        except Exception as e:
            print(f"[ERROR] Fehler beim Entfernen aus dem Startup: {e}")
            return False


class SpotifyOverlayApp:
    """Haupt-Anwendungsklasse für das Spotify Overlay Tool"""
    
    def __init__(self):
        # Verstecktes Hauptfenster (für tkinter-Event-Loop)
        self.root = tk.Tk()
        self.root.withdraw()
        self.root.title("Spotify Overlay Tool")
        
        # Komponenten initialisieren
        self.spotify_client = SpotifyClient()
        self.overlay = OverlayWindow(
            on_click_callback=self._on_overlay_click,
            on_play_callback=self._on_play_control,
            on_skip_callback=self._on_skip_control,
            on_prev_callback=self._on_prev_control
        )
        
        # Monitoring-Thread
        self.monitoring = True
        self.monitor_thread = None
        
        # Startup-Integration
        SystemTrayManager.add_to_startup()
    
    def _on_overlay_click(self):
        """Handler wenn auf Overlay geklickt wird - öffnet Spotify"""
        current_track = self.spotify_client.current_track
        if current_track and current_track.get('external_url'):
            webbrowser.open(current_track['external_url'])
            print(f"[MUSIC] Spotify geöffnet für: {current_track['name']}")
    
    def _on_play_control(self):
        """Handler für Play/Pause-Control"""
        if not self.spotify_client.sp:
            print("[WARNING] Spotify nicht verbunden")
            return
        
        try:
            # Aktuelle Wiedergabe-Status prüfen
            current = self.spotify_client.sp.current_playback()
            if current and current.get('is_playing'):
                # Pausieren
                self.spotify_client.sp.pause_playback()
                print("[CONTROLS] Wiedergabe pausiert")
            else:
                # Abspielen
                self.spotify_client.sp.start_playback()
                print("[CONTROLS] Wiedergabe gestartet")
        except Exception as e:
            print(f"[WARNING] Play/Pause Fehler: {e}")
    
    def _on_skip_control(self):
        """Handler für Skip-Control"""
        if not self.spotify_client.sp:
            print("[WARNING] Spotify nicht verbunden")
            return
        
        try:
            # Nächster Track
            self.spotify_client.sp.next_track()
            print("[CONTROLS] Nächster Track")
        except Exception as e:
            print(f"[WARNING] Skip Fehler: {e}")
    
    def _on_prev_control(self):
        """Handler für Previous-Control"""
        if not self.spotify_client.sp:
            print("[WARNING] Spotify nicht verbunden")
            return
        
        try:
            # Vorheriger Track
            self.spotify_client.sp.previous_track()
            print("[CONTROLS] Vorheriger Track")
        except Exception as e:
            print(f"[WARNING] Previous Fehler: {e}")
    
    def start_monitoring(self):
        """Startet das Monitoring der Spotify-Wiedergabe"""
        print("[MUSIC] Spotify Overlay Tool gestartet...")
        print("[INFO] Monitoring läuft - neue Songs werden automatisch angezeigt")
        
        if not SpotifyConfig.is_configured():
            print("\n[SETUP] Setup erforderlich:")
            print("   1. Gehe zu https://developer.spotify.com/dashboard")
            print("   2. Erstelle eine neue App")
            print("   3. Trage Client ID und Secret in spotify_overlay.py ein")
            print("   4. Starte das Tool neu\n")
        
        # Monitoring in separatem Thread
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        # tkinter Event-Loop starten
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            self.stop_monitoring()
    
    def _monitor_loop(self):
        """Haupt-Monitoring-Schleife"""
        while self.monitoring:
            try:
                if self.spotify_client.has_track_changed():
                    track = self.spotify_client.current_track
                    if track:
                        print(f"[MUSIC] Neuer Song: {track['name']} - {track['artist']}")
                        
                        # Overlay im UI-Thread anzeigen
                        self.root.after(0, lambda t=track: self.overlay.show_track(t))
                
                # 2 Sekunden warten vor nächster Prüfung
                time.sleep(2)
                
            except Exception as e:
                print(f"[WARNING] Monitoring-Fehler: {e}")
                time.sleep(5)  # Längere Pause bei Fehlern
    
    def stop_monitoring(self):
        """Stoppt das Monitoring"""
        print("[STOP] Spotify Overlay Tool wird beendet...")
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=2)
        self.root.quit()


def main():
    """Haupt-Funktion"""
    try:
        app = SpotifyOverlayApp()
        app.start_monitoring()
    except Exception as e:
        print(f"[ERROR] Unerwarteter Fehler: {e}")
        input("Drücke Enter zum Beenden...")


if __name__ == "__main__":
    main()