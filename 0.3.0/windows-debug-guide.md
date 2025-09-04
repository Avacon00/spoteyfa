# 🔍 SPOTEYFA v0.3.0 - Windows Startup Debug Guide

## 🚨 Problem: App startet nicht nach Installation

### **Schritt 1: Event Viewer prüfen**
1. Windows-Taste + R → `eventvwr.msc`
2. Windows Logs → Application
3. Nach Fehlern um die Zeit suchen, als Sie SPOTEYFA gestartet haben
4. Suchen nach "SPOTEYFA", "Electron", oder "Node.js" Fehlern

### **Schritt 2: Task Manager prüfen**
1. Strg + Shift + Esc
2. Nach "SPOTEYFA" oder "Electron" Prozessen suchen
3. Prüfen ob App startet aber sofort beendet wird

### **Schritt 3: Command Line Start (Debug Modus)**
```cmd
# Navigieren zum Installationsverzeichnis (normalerweise):
cd "C:\Users\%USERNAME%\AppData\Local\Programs\SPOTEYFA"

# Oder:
cd "C:\Program Files\SPOTEYFA"

# App mit Debug-Output starten:
SPOTEYFA.exe --enable-logging --log-level=0
```

### **Schritt 4: Dependency Check**
Fehlende Visual C++ Redistributables prüfen:
- Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
- Installieren und SPOTEYFA neu versuchen

### **Schritt 5: Antivirus/Windows Defender**
1. Windows Security → Virus & threat protection
2. Protection history prüfen
3. SPOTEYFA.exe zu Ausnahmen hinzufügen falls blockiert

### **Schritt 6: Manual Path Check**
Installationspfad prüfen:
- Standard: `C:\Users\%USERNAME%\AppData\Local\Programs\SPOTEYFA`
- Alternative: `C:\Program Files\SPOTEYFA`
- Dateien vorhanden: `SPOTEYFA.exe`, `resources\app.asar`

## 📝 Häufigste Lösungen:

### **Lösung 1: Als Administrator installieren**
```cmd
# PowerShell als Admin:
Start-Process "SPOTEYFA Setup 0.3.0.exe" -Verb RunAs
```

### **Lösung 2: Portable Version verwenden**
Falls wir eine portable Version haben, diese versuchen

### **Lösung 3: Clean Installation**
1. Programme → SPOTEYFA deinstallieren
2. Ordner manuell löschen: `%LOCALAPPDATA%\Programs\SPOTEYFA`
3. Registry cleaner oder CCleaner ausführen  
4. Setup als Admin neu installieren

## 🔧 Feedback für Debug:
Bitte teilen Sie mit:
1. **Event Viewer Fehler** (falls vorhanden)
2. **Task Manager Verhalten** (startet/stoppt sofort?)
3. **Command Line Output** (wenn möglich)
4. **Windows Version** (Win 10/11, Build-Nummer)
5. **Antivirus Software** (welches?)

Dies hilft bei der gezielten Problemlösung!