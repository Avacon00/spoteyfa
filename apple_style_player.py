#!/usr/bin/env python3
"""
Apple-Style Spotify Medienplayer
Modernes Glasmorphismus-Design mit Spotify-Integration
"""

import tkinter as tk
from tkinter import ttk
import threading
import time
import requests
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from PIL import Image, ImageTk, ImageFilter
import io
import tempfile
import webbrowser
from typing import Optional, Dict, Any


class SpotifyConfig:
    """Spotify API Configuration"""
    CLIENT_ID = "775fb3995b714b2e91ddd0c4c36861d9"
    CLIENT_SECRET = "2c01cacdc1fe4f9d98f3910627508d4e"
    REDIRECT_URI = "http://127.0.0.1:8888/callback"
    SCOPE = "user-read-currently-playing user-read-playback-state user-modify-playback-state"


class SpotifyClient:
    """Spotify API Client"""
    
    def __init__(self):
        self.sp = None
        self.current_track = None
        self.last_track_id = None
        self._initialize()
    
    def _initialize(self):
        try:
            cache_file = os.path.join(tempfile.gettempdir(), "apple_spotify_cache.json")
            
            self.sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
                client_id=SpotifyConfig.CLIENT_ID,
                client_secret=SpotifyConfig.CLIENT_SECRET,
                redirect_uri=SpotifyConfig.REDIRECT_URI,
                scope=SpotifyConfig.SCOPE,
                cache_path=cache_file,
                open_browser=True,
                show_dialog=False
            ))
            print("✓ Spotify connected")
        except Exception as e:
            print(f"✗ Spotify error: {e}")
            self.sp = None
    
    def get_current_track(self):
        if not self.sp:
            return None
        
        try:
            current = self.sp.current_playback()
            if not current or not current.get('item'):
                return None
            
            track = current['item']
            return {
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join([a['name'] for a in track['artists']]),
                'album': track['album']['name'],
                'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
                'external_url': track['external_urls']['spotify'],
                'is_playing': current.get('is_playing', False),
                'progress_ms': current.get('progress_ms', 0),
                'duration_ms': track.get('duration_ms', 0)
            }
        except Exception as e:
            print(f"Track fetch error: {e}")
            return None
    
    def has_track_changed(self):
        current = self.get_current_track()
        if not current:
            return False
        
        changed = current['id'] != self.last_track_id
        if changed:
            self.current_track = current
            self.last_track_id = current['id']
        
        return changed
    
    def play_pause(self):
        if not self.sp:
            return False
        
        try:
            current = self.sp.current_playback()
            if current and current.get('is_playing'):
                self.sp.pause_playback()
                return False
            else:
                self.sp.start_playback()
                return True
        except Exception as e:
            print(f"Play/Pause error: {e}")
            return None
    
    def next_track(self):
        if self.sp:
            try:
                self.sp.next_track()
            except Exception as e:
                print(f"Next track error: {e}")
    
    def previous_track(self):
        if self.sp:
            try:
                self.sp.previous_track()
            except Exception as e:
                print(f"Previous track error: {e}")


class AppleStylePlayer:
    """Apple-Style Music Player Widget"""
    
    def __init__(self, spotify_client):
        self.spotify = spotify_client
        self.root = None
        self.is_visible = False
        self.is_playing = False
        self.progress_value = 0.35  # Initial 35%
        self.volume_value = 0.65    # Initial 65%
        self.auto_hide_job = None
        self.progress_job = None
        self._create_player()
    
    def _create_player(self):
        """Create Apple-style player window"""
        self.root = tk.Toplevel()
        self.root.withdraw()
        
        # Apple-style window properties
        self.root.overrideredirect(True)
        self.root.attributes('-topmost', True)
        self.root.attributes('-alpha', 0.95)  # Glasmorphismus transparency
        
        # Apple dimensions: 400px width, auto height
        width = 400
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = screen_width - width - 20
        y = 50
        
        # Create glassmorphic layers
        self._create_glass_layers(width, x, y)
        self._create_apple_layout()
        self._bind_events()
    
    def _create_glass_layers(self, width, x, y):
        """Create Apple glassmorphism effect"""
        # Calculate height dynamically
        height = 500  # Apple player height
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        
        # Outer shadow layer
        self.shadow_layer = tk.Frame(
            self.root,
            bg='#000000',  # Shadow
            relief='flat',
            bd=0
        )
        self.shadow_layer.pack(fill='both', expand=True, padx=8, pady=8)
        
        # Glass blur simulation - multiple layers
        self.blur_layer1 = tk.Frame(
            self.shadow_layer,
            bg='#f8f9fa',  # Light glass base
            relief='flat',
            bd=0
        )
        self.blur_layer1.pack(fill='both', expand=True, padx=2, pady=2)
        
        self.blur_layer2 = tk.Frame(
            self.blur_layer1,
            bg='#ffffff',  # White glass
            relief='raised',
            bd=1
        )
        self.blur_layer2.pack(fill='both', expand=True, padx=1, pady=1)
        
        # Main container with Apple styling
        self.main_container = tk.Frame(
            self.blur_layer2,
            bg='#fafbfc',  # Apple white background
            relief='flat',
            bd=0
        )
        self.main_container.pack(fill='both', expand=True, padx=6, pady=6)
    
    def _create_apple_layout(self):
        """Create exact Apple Music layout"""
        
        # Header with close button
        self.header = tk.Frame(self.main_container, bg='#fafbfc', height=40)
        self.header.pack(fill='x', padx=30, pady=(15, 0))
        self.header.pack_propagate(False)
        
        self.close_btn = tk.Label(
            self.header,
            text="✕",
            font=('SF Pro Display', 18),
            fg='#8e8e93',  # Apple tertiary gray
            bg='#fafbfc',
            cursor='hand2',
            padx=8,
            pady=5
        )
        self.close_btn.pack(side='right')
        
        # Album Cover (240x240px, centered)
        self.cover_container = tk.Frame(
            self.main_container,
            bg='#fafbfc',
            width=240,
            height=240
        )
        self.cover_container.pack(pady=(25, 25))
        self.cover_container.pack_propagate(False)
        
        # Apple gradient background for cover
        self.cover_bg = tk.Frame(
            self.cover_container,
            bg='#667eea',  # Gradient start color
            width=240,
            height=240,
            relief='flat',
            bd=0
        )
        self.cover_bg.pack(fill='both', expand=True)
        
        self.cover_label = tk.Label(
            self.cover_bg,
            text="🎵",
            font=('SF Pro Display', 60),
            fg='#ffffff',
            bg='#667eea'
        )
        self.cover_label.pack(expand=True)
        
        # Song Information (Apple typography)
        self.info_container = tk.Frame(self.main_container, bg='#fafbfc')
        self.info_container.pack(fill='x', padx=30, pady=(0, 25))
        
        # Song Title (22px, weight 600)
        self.title_label = tk.Label(
            self.info_container,
            text="Nachtwind",
            font=('SF Pro Display', 22, 'bold'),
            fg='#1d1d1f',  # Apple primary text
            bg='#fafbfc',
            anchor='center',
            wraplength=340
        )
        self.title_label.pack(fill='x', pady=(0, 8))
        
        # Artist (16px)
        self.artist_label = tk.Label(
            self.info_container,
            text="Digital Dreams",
            font=('SF Pro Display', 16),
            fg='#6e6e73',  # Apple secondary text
            bg='#fafbfc',
            anchor='center',
            wraplength=340
        )
        self.artist_label.pack(fill='x', pady=(0, 5))
        
        # Album (14px)
        self.album_label = tk.Label(
            self.info_container,
            text="Elektronische Träume",
            font=('SF Pro Display', 14),
            fg='#8e8e93',  # Apple tertiary text
            bg='#fafbfc',
            anchor='center',
            wraplength=340
        )
        self.album_label.pack(fill='x')
        
        # Progress Section
        self.progress_container = tk.Frame(self.main_container, bg='#fafbfc')
        self.progress_container.pack(fill='x', padx=30, pady=(15, 25))
        
        # Progress Bar (4px height, Apple blue)
        self.progress_bg = tk.Frame(
            self.progress_container,
            bg='#e5e5e7',  # Apple progress background
            height=4
        )
        self.progress_bg.pack(fill='x', pady=(0, 15))
        
        self.progress_fill = tk.Frame(
            self.progress_bg,
            bg='#007aff',  # Apple blue
            height=4
        )
        self.progress_fill.place(relwidth=self.progress_value, relheight=1.0)
        
        # Time Display (13px, Apple gray)
        self.time_container = tk.Frame(self.progress_container, bg='#fafbfc')
        self.time_container.pack(fill='x')
        
        self.time_current = tk.Label(
            self.time_container,
            text="1:42",
            font=('SF Pro Display', 13, 'normal'),
            fg='#8e8e93',
            bg='#fafbfc'
        )
        self.time_current.pack(side='left')
        
        self.time_total = tk.Label(
            self.time_container,
            text="4:18",
            font=('SF Pro Display', 13, 'normal'),
            fg='#8e8e93',
            bg='#fafbfc'
        )
        self.time_total.pack(side='right')
        
        # Media Controls (Apple spacing: 25px gap)
        self.controls_container = tk.Frame(self.main_container, bg='#fafbfc')
        self.controls_container.pack(pady=(15, 20))
        
        # Previous Button (20px icon)
        self.prev_btn = tk.Label(
            self.controls_container,
            text="⏮",
            font=('SF Pro Display', 20),
            fg='#1d1d1f',
            bg='#fafbfc',
            cursor='hand2',
            padx=8,
            pady=8
        )
        self.prev_btn.pack(side='left', padx=(0, 25))
        
        # Play Button (50x50px, Apple blue background)
        self.play_btn = tk.Label(
            self.controls_container,
            text="⏸",  # Start in playing state
            font=('SF Pro Display', 22),
            fg='#ffffff',
            bg='#007aff',  # Apple blue
            cursor='hand2',
            width=4,
            height=2,
            relief='flat',
            bd=0
        )
        self.play_btn.pack(side='left', padx=25)
        
        # Next Button (20px icon)
        self.next_btn = tk.Label(
            self.controls_container,
            text="⏭",
            font=('SF Pro Display', 20),
            fg='#1d1d1f',
            bg='#fafbfc',
            cursor='hand2',
            padx=8,
            pady=8
        )
        self.next_btn.pack(side='left', padx=(25, 0))
        
        # Volume Control (bottom, centered)
        self.volume_container = tk.Frame(self.main_container, bg='#fafbfc')
        self.volume_container.pack(fill='x', padx=40, pady=(10, 25))
        
        # Volume Icon
        self.volume_icon = tk.Label(
            self.volume_container,
            text="🔊",
            font=('SF Pro Display', 16),
            fg='#8e8e93',
            bg='#fafbfc'
        )
        self.volume_icon.pack(side='left', padx=(0, 12))
        
        # Volume Bar (120px width, 4px height)
        self.volume_bg = tk.Frame(
            self.volume_container,
            bg='#e5e5e7',
            height=4,
            width=120
        )
        self.volume_bg.pack(side='left', pady=6)
        self.volume_bg.pack_propagate(False)
        
        self.volume_fill = tk.Frame(
            self.volume_bg,
            bg='#007aff',
            height=4
        )
        self.volume_fill.place(relwidth=self.volume_value, relheight=1.0)
        
        # Start in playing state
        self.is_playing = True
        self._start_progress_animation()
    
    def _bind_events(self):
        """Bind Apple-style interactions"""
        self.close_btn.bind('<Button-1>', lambda e: self.hide())
        self.play_btn.bind('<Button-1>', self._on_play_pause)
        self.prev_btn.bind('<Button-1>', self._on_previous)
        self.next_btn.bind('<Button-1>', self._on_next)
        
        # Cover click opens Spotify
        self.cover_label.bind('<Button-1>', self._on_cover_click)
        self.title_label.bind('<Button-1>', self._on_cover_click)
        self.artist_label.bind('<Button-1>', self._on_cover_click)
        
        # Apple-style smooth hover effects (subtle)
        self._setup_hover_effects()
    
    def _setup_hover_effects(self):
        """Subtle Apple-style hover effects"""
        # Only for interactive elements
        buttons = [
            (self.close_btn, '#ff3b30', '#8e8e93'),  # Apple red hover
            (self.prev_btn, '#007aff', '#1d1d1f'),   # Apple blue hover
            (self.next_btn, '#007aff', '#1d1d1f'),   # Apple blue hover
        ]
        
        for btn, hover_color, normal_color in buttons:
            btn.bind('<Enter>', lambda e, b=btn, c=hover_color: b.config(fg=c))
            btn.bind('<Leave>', lambda e, b=btn, c=normal_color: b.config(fg=c))
        
        # Play button hover (background change)
        self.play_btn.bind('<Enter>', lambda e: self.play_btn.config(bg='#0051d1'))  # Darker blue
        self.play_btn.bind('<Leave>', lambda e: self.play_btn.config(bg='#007aff'))
    
    def _on_play_pause(self, event):
        """Apple-style play/pause toggle"""
        if self.spotify.sp:
            result = self.spotify.play_pause()
            if result is not None:
                self.is_playing = result
        else:
            # Demo mode
            self.is_playing = not self.is_playing
        
        # Update UI with smooth transition
        symbol = "⏸" if self.is_playing else "▶"
        self.play_btn.config(text=symbol)
        
        if self.is_playing:
            self._start_progress_animation()
        else:
            self._stop_progress_animation()
        
        print(f"▶ {'Playing' if self.is_playing else 'Paused'}")
    
    def _on_previous(self, event):
        """Previous track"""
        if self.spotify.sp:
            self.spotify.previous_track()
        print("⏮ Previous track")
    
    def _on_next(self, event):
        """Next track"""
        if self.spotify.sp:
            self.spotify.next_track()
        print("⏭ Next track")
    
    def _on_cover_click(self, event):
        """Open Spotify when clicking cover/title"""
        if self.spotify.current_track and self.spotify.current_track.get('external_url'):
            webbrowser.open(self.spotify.current_track['external_url'])
            print("🎵 Opened in Spotify")
    
    def _start_progress_animation(self):
        """Apple-smooth progress animation"""
        if self.progress_job:
            self.root.after_cancel(self.progress_job)
        self._animate_progress()
    
    def _stop_progress_animation(self):
        """Stop progress animation"""
        if self.progress_job:
            self.root.after_cancel(self.progress_job)
            self.progress_job = None
    
    def _animate_progress(self):
        """Smooth progress bar animation"""
        if self.is_playing and self.progress_value < 1.0:
            self.progress_value += 0.001  # Very smooth increment
            if self.progress_value > 1.0:
                self.progress_value = 0.0  # Loop
            
            # Update progress bar
            self.progress_fill.place(relwidth=self.progress_value, relheight=1.0)
            
            # Update time display
            current_seconds = int(self.progress_value * 258)  # 4:18 = 258 seconds
            current_min, current_sec = divmod(current_seconds, 60)
            self.time_current.config(text=f"{current_min}:{current_sec:02d}")
            
            # Schedule next update
            self.progress_job = self.root.after(100, self._animate_progress)  # 100ms for smoothness
    
    def update_with_spotify_data(self, track_data):
        """Update player with real Spotify data"""
        if not track_data:
            return
        
        # Update track info
        self.title_label.config(text=track_data['name'])
        self.artist_label.config(text=track_data['artist'])
        self.album_label.config(text=track_data['album'])
        
        # Update play state
        self.is_playing = track_data['is_playing']
        symbol = "⏸" if self.is_playing else "▶"
        self.play_btn.config(text=symbol)
        
        # Update time display
        duration_ms = track_data.get('duration_ms', 0)
        progress_ms = track_data.get('progress_ms', 0)
        
        if duration_ms > 0:
            total_min, total_sec = divmod(duration_ms // 1000, 60)
            current_min, current_sec = divmod(progress_ms // 1000, 60)
            
            self.time_total.config(text=f"{total_min}:{total_sec:02d}")
            self.time_current.config(text=f"{current_min}:{current_sec:02d}")
            
            # Update progress
            self.progress_value = progress_ms / duration_ms
            self.progress_fill.place(relwidth=self.progress_value, relheight=1.0)
        
        # Load album cover
        self._load_album_cover(track_data.get('image_url'))
        
        # Manage animations
        if self.is_playing:
            self._start_progress_animation()
        else:
            self._stop_progress_animation()
    
    def _load_album_cover(self, image_url):
        """Load and display album cover"""
        if not image_url:
            return
        
        def download_and_set():
            try:
                response = requests.get(image_url, timeout=5)
                response.raise_for_status()
                
                # Create 240x240 cover image
                pil_image = Image.open(io.BytesIO(response.content))
                pil_image = pil_image.resize((240, 240), Image.Resampling.LANCZOS)
                
                # Apple-style rounded corners effect (simulated)
                tk_image = ImageTk.PhotoImage(pil_image)
                
                self.root.after(0, lambda: self._set_cover_image(tk_image))
                
            except Exception as e:
                print(f"Cover load error: {e}")
        
        threading.Thread(target=download_and_set, daemon=True).start()
    
    def _set_cover_image(self, tk_image):
        """Set cover image"""
        self.cover_label.config(image=tk_image, text="")
        self.cover_label.image = tk_image  # Keep reference
        self.cover_bg.config(bg='#000000')  # Dark bg for real covers
    
    def show(self):
        """Show player with Apple-style fade-in"""
        if self.is_visible:
            return
        
        self.is_visible = True
        self.root.deiconify()
        self._apple_fade_in(0.0)
        
        # Auto-hide after 12 seconds (Apple-style longer display)
        self._schedule_auto_hide(12000)
    
    def _apple_fade_in(self, alpha):
        """Smooth Apple-style fade-in"""
        if alpha < 0.95:
            self.root.attributes('-alpha', alpha)
            self.root.after(20, lambda: self._apple_fade_in(alpha + 0.05))
        else:
            self.root.attributes('-alpha', 0.95)
    
    def _schedule_auto_hide(self, delay_ms):
        """Schedule auto-hide"""
        if self.auto_hide_job:
            self.root.after_cancel(self.auto_hide_job)
        self.auto_hide_job = self.root.after(delay_ms, self.hide)
    
    def hide(self):
        """Hide player with Apple-style fade-out"""
        if not self.is_visible:
            return
        
        self.is_visible = False
        self._apple_fade_out(0.95)
        
        if self.auto_hide_job:
            self.root.after_cancel(self.auto_hide_job)
            self.auto_hide_job = None
    
    def _apple_fade_out(self, alpha):
        """Smooth Apple-style fade-out"""
        if alpha > 0.0:
            self.root.attributes('-alpha', alpha)
            self.root.after(20, lambda: self._apple_fade_out(alpha - 0.05))
        else:
            self.root.withdraw()


class AppleSpotifyApp:
    """Main Application"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.withdraw()
        self.root.title("Apple-Style Spotify Player")
        
        self.spotify = SpotifyClient()
        self.player = AppleStylePlayer(self.spotify)
        
        self.monitoring = True
        self.monitor_thread = None
    
    def start(self):
        """Start the application"""
        print("🍎 Apple-Style Spotify Player")
        print("✨ Glassmorphism design activated")
        
        # Start monitoring thread
        self.monitor_thread = threading.Thread(target=self._monitor_spotify, daemon=True)
        self.monitor_thread.start()
        
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            self.stop()
    
    def _monitor_spotify(self):
        """Monitor Spotify for track changes"""
        while self.monitoring:
            try:
                if self.spotify.has_track_changed():
                    track = self.spotify.current_track
                    if track:
                        print(f"🎵 Now playing: {track['name']} - {track['artist']}")
                        
                        # Update UI in main thread
                        self.root.after(0, lambda t=track: [
                            self.player.update_with_spotify_data(t),
                            self.player.show()
                        ])
                
                time.sleep(2)  # Check every 2 seconds
                
            except Exception as e:
                print(f"Monitor error: {e}")
                time.sleep(5)
    
    def stop(self):
        """Stop the application"""
        print("👋 Stopping Apple-Style Player...")
        self.monitoring = False
        self.root.quit()


def main():
    """Main entry point"""
    try:
        app = AppleSpotifyApp()
        app.start()
    except Exception as e:
        print(f"Application error: {e}")
        input("Press Enter to exit...")


if __name__ == "__main__":
    main()