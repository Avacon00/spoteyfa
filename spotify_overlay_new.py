#!/usr/bin/env python3
"""
Apple Music Style Spotify Overlay für Windows
Moderner Glass-Effekt Player mit zentriertem Layout
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
import winreg
import sys
import webbrowser
import tempfile
from typing import Optional, Dict, Any


class SpotifyConfig:
    """Spotify API Konfiguration"""
    CLIENT_ID = "775fb3995b714b2e91ddd0c4c36861d9"
    CLIENT_SECRET = "2c01cacdc1fe4f9d98f3910627508d4e"
    REDIRECT_URI = "http://127.0.0.1:8888/callback"
    SCOPE = "user-read-currently-playing user-read-playback-state user-modify-playback-state"
    
    @classmethod
    def is_configured(cls) -> bool:
        return bool(cls.CLIENT_ID and cls.CLIENT_SECRET)


class SpotifyClient:
    """Spotify API Client"""
    
    def __init__(self):
        self.sp = None
        self.current_track = None
        self.last_track_id = None
        self._initialize_client()
    
    def _initialize_client(self):
        if not SpotifyConfig.is_configured():
            print("[WARNING] Spotify API-Credentials nicht konfiguriert!")
            return
        
        try:
            cache_dir = tempfile.gettempdir()
            cache_file = os.path.join(cache_dir, "spotify_overlay_cache.json")
            
            self.sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
                client_id=SpotifyConfig.CLIENT_ID,
                client_secret=SpotifyConfig.CLIENT_SECRET,
                redirect_uri=SpotifyConfig.REDIRECT_URI,
                scope=SpotifyConfig.SCOPE,
                cache_path=cache_file,
                open_browser=True,
                show_dialog=False
            ))
            print("[OK] Spotify Client initialisiert")
        except Exception as e:
            print(f"[ERROR] Spotify-Initialisierung: {e}")
            self.sp = None
    
    def get_current_track(self) -> Optional[Dict[str, Any]]:
        if not self.sp:
            return None
        
        try:
            current = self.sp.current_playback()
            if not current or not current.get('is_playing'):
                return None
            
            track = current.get('item')
            if not track:
                return None
            
            return {
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join([artist['name'] for artist in track['artists']]),
                'album': track['album']['name'],
                'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
                'external_url': track['external_urls']['spotify'],
                'is_playing': current.get('is_playing', False),
                'progress_ms': current.get('progress_ms', 0),
                'duration_ms': track.get('duration_ms', 0)
            }
        except Exception as e:
            print(f"[WARNING] Track-Abruf Fehler: {e}")
            return None
    
    def has_track_changed(self) -> bool:
        current = self.get_current_track()
        if not current:
            return False
        
        track_changed = current['id'] != self.last_track_id
        if track_changed:
            self.current_track = current
            self.last_track_id = current['id']
        
        return track_changed


class AppleMusicOverlay:
    """Apple Music Style Overlay mit Glass-Effekt"""
    
    def __init__(self, spotify_client, on_close=None):
        self.spotify_client = spotify_client
        self.on_close = on_close
        self.root = None
        self.is_visible = False
        self.fade_job = None
        self._create_window()
    
    def _create_window(self):
        self.root = tk.Toplevel()
        self.root.withdraw()
        
        # Fenster-Eigenschaften für Glass-Effekt
        self.root.overrideredirect(True)
        self.root.attributes('-alpha', 0.90)  # Mehr Transparenz für Glass
        self.root.attributes('-topmost', True)
        
        # Apple Music Dimensions
        width, height = 380, 450
        screen_width = self.root.winfo_screenwidth()
        x = screen_width - width - 20
        y = 20
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        
        # Windows Glass-Effekt: Mehrschichtige Blur-Simulation
        self.outer_glow = tk.Frame(self.root, bg='#000000', relief='flat', bd=0)
        self.outer_glow.pack(fill='both', expand=True, padx=8, pady=8)
        
        self.glass_layer1 = tk.Frame(self.outer_glow, bg='#0a0a0a', relief='flat', bd=0)
        self.glass_layer1.pack(fill='both', expand=True, padx=3, pady=3)
        
        self.glass_layer2 = tk.Frame(self.glass_layer1, bg='#1a1a1a', relief='ridge', bd=1)
        self.glass_layer2.pack(fill='both', expand=True, padx=2, pady=2)
        
        # Hauptcontainer mit abgerundeten Ecken-Simulation
        self.main_container = tk.Frame(
            self.glass_layer2,
            bg='#1e1e1e',  # Spotify Dark
            relief='flat',
            bd=0
        )
        self.main_container.pack(fill='both', expand=True, padx=6, pady=6)
        
        self._create_apple_music_layout()
        self._bind_events()
    
    def _create_apple_music_layout(self):
        """Apple Music Style Layout erstellen"""
        
        # Close-Button (oben rechts)
        self.close_btn = tk.Label(
            self.main_container,
            text="✕",
            font=('Segoe UI', 16),
            fg='#888888',
            bg='#1e1e1e',
            cursor='hand2',
            padx=10,
            pady=8
        )
        self.close_btn.place(relx=0.95, rely=0.05, anchor='ne')
        
        # Album-Cover (zentriert, groß)
        self.cover_container = tk.Frame(
            self.main_container,
            bg='#1e1e1e',
            width=200,
            height=200
        )
        self.cover_container.pack(pady=(30, 25))
        self.cover_container.pack_propagate(False)
        
        self.cover_label = tk.Label(
            self.cover_container,
            bg='#1e1e1e',
            relief='flat',
            bd=0
        )
        self.cover_label.pack(expand=True)
        
        # Song-Info (zentriert)
        self.info_container = tk.Frame(self.main_container, bg='#1e1e1e')
        self.info_container.pack(fill='x', padx=30, pady=(0, 20))
        
        # Song-Titel
        self.title_label = tk.Label(
            self.info_container,
            text="",
            font=('Segoe UI', 18, 'bold'),
            fg='#ffffff',
            bg='#1e1e1e',
            anchor='center',
            wraplength=320
        )
        self.title_label.pack(fill='x', pady=(0, 8))
        
        # Künstler
        self.artist_label = tk.Label(
            self.info_container,
            text="",
            font=('Segoe UI', 14),
            fg='#b3b3b3',
            bg='#1e1e1e',
            anchor='center',
            wraplength=320
        )
        self.artist_label.pack(fill='x', pady=(0, 6))
        
        # Album
        self.album_label = tk.Label(
            self.info_container,
            text="",
            font=('Segoe UI', 12),
            fg='#888888',
            bg='#1e1e1e',
            anchor='center',
            wraplength=320
        )
        self.album_label.pack(fill='x')
        
        # Progress-Bar
        self.progress_container = tk.Frame(self.main_container, bg='#1e1e1e')
        self.progress_container.pack(fill='x', padx=30, pady=(15, 20))
        
        # Progress-Bar Background
        self.progress_bg = tk.Frame(
            self.progress_container,
            bg='#404040',
            height=4
        )
        self.progress_bg.pack(fill='x', pady=(0, 10))
        
        # Progress-Fill
        self.progress_fill = tk.Frame(
            self.progress_bg,
            bg='#1db954',  # Spotify-Grün
            height=4
        )
        self.progress_fill.place(relwidth=0.0, relheight=1.0)
        
        # Zeit-Info
        self.time_container = tk.Frame(self.progress_container, bg='#1e1e1e')
        self.time_container.pack(fill='x')
        
        self.time_current = tk.Label(
            self.time_container,
            text="0:00",
            font=('Segoe UI', 10),
            fg='#888888',
            bg='#1e1e1e'
        )
        self.time_current.pack(side='left')
        
        self.time_total = tk.Label(
            self.time_container,
            text="0:00",
            font=('Segoe UI', 10),
            fg='#888888',
            bg='#1e1e1e'
        )
        self.time_total.pack(side='right')
        
        # Media-Controls (Apple Music Style)
        self.controls_container = tk.Frame(self.main_container, bg='#1e1e1e')
        self.controls_container.pack(pady=(15, 20))
        
        # Previous-Button
        self.prev_btn = tk.Label(
            self.controls_container,
            text="⏮",
            font=('Segoe UI', 24),
            fg='#ffffff',
            bg='#1e1e1e',
            cursor='hand2',
            padx=15,
            pady=12
        )
        self.prev_btn.pack(side='left', padx=20)
        
        # Play/Pause-Button (Apple Style - runder Button)
        self.play_btn = tk.Label(
            self.controls_container,
            text="▶",
            font=('Segoe UI', 32),
            fg='#ffffff',
            bg='#1db954',  # Spotify-Grün
            cursor='hand2',
            padx=25,
            pady=20,
            relief='raised',
            bd=2
        )
        self.play_btn.pack(side='left', padx=25)
        
        # Next-Button
        self.next_btn = tk.Label(
            self.controls_container,
            text="⏭",
            font=('Segoe UI', 24),
            fg='#ffffff',
            bg='#1e1e1e',
            cursor='hand2',
            padx=15,
            pady=12
        )
        self.next_btn.pack(side='left', padx=20)
        
        # Volume-Container (unten)
        self.volume_container = tk.Frame(self.main_container, bg='#1e1e1e')
        self.volume_container.pack(fill='x', padx=40, pady=(10, 25))
        
        # Volume-Icon
        self.volume_icon = tk.Label(
            self.volume_container,
            text="🔊",
            font=('Segoe UI', 16),
            fg='#888888',
            bg='#1e1e1e'
        )
        self.volume_icon.pack(side='left', padx=(0, 15))
        
        # Volume-Bar
        self.volume_bg = tk.Frame(
            self.volume_container,
            bg='#404040',
            height=4
        )
        self.volume_bg.pack(side='left', fill='x', expand=True, pady=10)
        
        self.volume_fill = tk.Frame(
            self.volume_bg,
            bg='#1db954',
            height=4
        )
        self.volume_fill.place(relwidth=0.65, relheight=1.0)
    
    def _bind_events(self):
        """Event-Handler binden"""
        self.close_btn.bind('<Button-1>', lambda e: self.hide())
        self.play_btn.bind('<Button-1>', self._on_play_click)
        self.prev_btn.bind('<Button-1>', self._on_prev_click)
        self.next_btn.bind('<Button-1>', self._on_next_click)
        
        # Allgemeine Click-Events für Spotify öffnen
        for widget in [self.cover_label, self.title_label, self.artist_label]:
            widget.bind('<Button-1>', self._on_track_click)
        
        # Hover-Effekte
        self._setup_hover_effects()
    
    def _setup_hover_effects(self):
        """Apple Music Style Hover-Effekte"""
        buttons = [
            (self.prev_btn, '#1ed760', '#ffffff'),
            (self.next_btn, '#1ed760', '#ffffff'),
            (self.close_btn, '#ff4444', '#888888')
        ]
        
        for btn, hover_color, normal_color in buttons:
            btn.bind('<Enter>', lambda e, b=btn, c=hover_color: b.config(fg=c))
            btn.bind('<Leave>', lambda e, b=btn, c=normal_color: b.config(fg=c))
        
        # Play-Button Hover (Background-Change)
        self.play_btn.bind('<Enter>', lambda e: self.play_btn.config(bg='#1ed760'))
        self.play_btn.bind('<Leave>', lambda e: self.play_btn.config(bg='#1db954'))
    
    def _on_play_click(self, event):
        """Play/Pause Handler"""
        if not self.spotify_client.sp:
            return
        
        try:
            current = self.spotify_client.sp.current_playback()
            if current and current.get('is_playing'):
                self.spotify_client.sp.pause_playback()
                self.play_btn.config(text="▶")
                print("[CONTROLS] Pausiert")
            else:
                self.spotify_client.sp.start_playback()
                self.play_btn.config(text="⏸")
                print("[CONTROLS] Gestartet")
        except Exception as e:
            print(f"[WARNING] Play/Pause Fehler: {e}")
    
    def _on_prev_click(self, event):
        """Previous Track Handler"""
        if self.spotify_client.sp:
            try:
                self.spotify_client.sp.previous_track()
                print("[CONTROLS] Vorheriger Track")
            except Exception as e:
                print(f"[WARNING] Previous Fehler: {e}")
    
    def _on_next_click(self, event):
        """Next Track Handler"""
        if self.spotify_client.sp:
            try:
                self.spotify_client.sp.next_track()
                print("[CONTROLS] Nächster Track")
            except Exception as e:
                print(f"[WARNING] Next Fehler: {e}")
    
    def _on_track_click(self, event):
        """Track-Info Click - öffnet Spotify"""
        track = self.spotify_client.current_track
        if track and track.get('external_url'):
            webbrowser.open(track['external_url'])
            print(f"[MUSIC] Spotify geöffnet")
    
    def show_track(self, track_info: Dict[str, Any]):
        """Zeigt Track im Apple Music Style"""
        # Track-Info
        self.title_label.config(text=track_info['name'])
        self.artist_label.config(text=track_info['artist'])
        self.album_label.config(text=track_info['album'])
        
        # Play-Button-State
        play_symbol = "⏸" if track_info.get('is_playing') else "▶"
        self.play_btn.config(text=play_symbol)
        
        # Zeitanzeige
        duration = track_info.get('duration_ms', 0)
        progress = track_info.get('progress_ms', 0)
        
        total_min, total_sec = divmod(duration // 1000, 60)
        curr_min, curr_sec = divmod(progress // 1000, 60)
        
        self.time_total.config(text=f"{total_min}:{total_sec:02d}")
        self.time_current.config(text=f"{curr_min}:{curr_sec:02d}")
        
        # Progress-Bar
        if duration > 0:
            progress_percent = progress / duration
            self.progress_fill.place(relwidth=progress_percent, relheight=1.0)
        
        # Album-Cover
        self._load_cover(track_info.get('image_url'))
        
        # Anzeigen
        self._show_animated()
        self._schedule_hide(10000)  # 10 Sekunden für Apple Music Style
    
    def _load_cover(self, image_url):
        """Album-Cover laden (200x200px)"""
        if not image_url:
            self.cover_label.config(
                text="♫",
                font=('Segoe UI', 48),
                fg='#535353',
                bg='#1e1e1e'
            )
            return
        
        def download_cover():
            try:
                response = requests.get(image_url, timeout=5)
                response.raise_for_status()
                
                pil_image = Image.open(io.BytesIO(response.content))
                pil_image = pil_image.resize((200, 200), Image.Resampling.LANCZOS)
                
                tk_image = ImageTk.PhotoImage(pil_image)
                self.root.after(0, lambda: self._set_cover(tk_image))
                
            except Exception as e:
                print(f"[WARNING] Cover-Download Fehler: {e}")
                self.root.after(0, lambda: self.cover_label.config(
                    text="♫", font=('Segoe UI', 48), fg='#535353', bg='#1e1e1e'
                ))
        
        threading.Thread(target=download_cover, daemon=True).start()
    
    def _set_cover(self, tk_image):
        """Cover setzen"""
        self.cover_label.config(image=tk_image, text="")
        self.cover_label.image = tk_image
    
    def _show_animated(self):
        """Fade-In Animation"""
        if self.is_visible:
            return
        
        self.is_visible = True
        self.root.deiconify()
        self._fade_in(0.0)
    
    def _fade_in(self, alpha):
        """Fade-In Effekt"""
        if alpha < 0.90:
            self.root.attributes('-alpha', alpha)
            self.root.after(15, lambda: self._fade_in(alpha + 0.05))
        else:
            self.root.attributes('-alpha', 0.90)
    
    def _schedule_hide(self, delay_ms):
        """Auto-Hide planen"""
        if self.fade_job:
            self.root.after_cancel(self.fade_job)
        self.fade_job = self.root.after(delay_ms, self.hide)
    
    def hide(self):
        """Overlay verstecken"""
        if not self.is_visible:
            return
        self.is_visible = False
        self.root.withdraw()
        if self.fade_job:
            self.root.after_cancel(self.fade_job)


class SpotifyOverlayApp:
    """Hauptanwendung"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.withdraw()
        self.root.title("Apple Music Style Spotify Overlay")
        
        self.spotify_client = SpotifyClient()
        self.overlay = AppleMusicOverlay(self.spotify_client, self.stop_monitoring)
        
        self.monitoring = True
        self.monitor_thread = None
    
    def start_monitoring(self):
        """Monitoring starten"""
        print("[MUSIC] Apple Music Style Overlay gestartet...")
        print("[INFO] Monitoring läuft...")
        
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            self.stop_monitoring()
    
    def _monitor_loop(self):
        """Monitoring-Loop"""
        while self.monitoring:
            try:
                if self.spotify_client.has_track_changed():
                    track = self.spotify_client.current_track
                    if track:
                        print(f"[MUSIC] Neuer Song: {track['name']}")
                        self.root.after(0, lambda t=track: self.overlay.show_track(t))
                
                time.sleep(2)
            except Exception as e:
                print(f"[WARNING] Monitoring-Fehler: {e}")
                time.sleep(5)
    
    def stop_monitoring(self):
        """Monitoring stoppen"""
        print("[STOP] Apple Music Overlay wird beendet...")
        self.monitoring = False
        self.root.quit()


def main():
    """Hauptfunktion"""
    try:
        app = SpotifyOverlayApp()
        app.start_monitoring()
    except Exception as e:
        print(f"[ERROR] Unerwarteter Fehler: {e}")
        input("Enter zum Beenden...")


if __name__ == "__main__":
    main()