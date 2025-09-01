"""
Setup-Script für das Spotify Overlay Tool
Installiert Dependencies und konfiguriert das Tool.
"""

import subprocess
import sys
import os

def install_dependencies():
    """Installiert erforderliche Python-Pakete"""
    print("📦 Installiere Dependencies...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✅ Dependencies erfolgreich installiert")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Fehler bei der Installation: {e}")
        return False

def setup_spotify_credentials():
    """Hilft beim Setup der Spotify API-Credentials"""
    print("\n🔧 Spotify API Setup")
    print("=" * 50)
    print("Für das Tool benötigst du Spotify API-Credentials:")
    print("1. Gehe zu: https://developer.spotify.com/dashboard")
    print("2. Melde dich mit deinem Spotify-Account an")
    print("3. Erstelle eine neue App")
    print("4. Kopiere Client ID und Client Secret")
    print("5. Trage sie in spotify_overlay.py ein (Zeilen 30-31)")
    print("6. Setze Redirect URI auf: http://localhost:8888/callback")
    print("=" * 50)
    
    input("\nDrücke Enter wenn du die Credentials eingetragen hast...")

def main():
    """Haupt-Setup-Funktion"""
    print("🎵 Spotify Overlay Tool - Setup")
    print("=" * 40)
    
    # Dependencies installieren
    if not install_dependencies():
        print("❌ Setup fehlgeschlagen - Dependencies konnten nicht installiert werden")
        return
    
    # Spotify API Setup
    setup_spotify_credentials()
    
    print("\n✅ Setup abgeschlossen!")
    print("🚀 Du kannst das Tool jetzt mit 'python spotify_overlay.py' starten")
    print("💡 Das Tool startet automatisch mit Windows (Registry-Eintrag wird erstellt)")

if __name__ == "__main__":
    main()