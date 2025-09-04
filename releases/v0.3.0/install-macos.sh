#!/bin/bash

# SPOTEYFA v0.3.0 - macOS Optimized Installation Script

echo "==============================================="
echo "    SPOTEYFA v0.3.0 - macOS Installer"
echo "==============================================="
echo ""

# macOS-specific styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🍎 Welcome to SPOTEYFA for macOS${NC}"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This installer is designed for macOS${NC}"
    echo "For other platforms, use install.sh"
    exit 1
fi

# Check for Homebrew
if ! command -v brew >/dev/null 2>&1; then
    echo -e "${YELLOW}🍺 Homebrew not found${NC}"
    echo "Installing Homebrew (required for Node.js)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

# Install Node.js via Homebrew
if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing Node.js via Homebrew...${NC}"
    brew install node
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js already installed: $NODE_VERSION${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}📋 Installing SPOTEYFA dependencies...${NC}"
npm install --production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Create macOS-specific launch script with app bundle support
echo ""
echo -e "${YELLOW}🚀 Creating macOS launch script...${NC}"

cat > start-spoteyfa-macos.command << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🎵 Starting SPOTEYFA for macOS..."

# Set macOS-specific environment
export ELECTRON_ENABLE_STACK_DUMPING=1
export ELECTRON_ENABLE_LOGGING=1

# Start with macOS optimizations
npm start

# Keep terminal open on error
if [ $? -ne 0 ]; then
    echo ""
    echo "Press any key to close..."
    read -n 1
fi
EOF

chmod +x start-spoteyfa-macos.command

# Create desktop shortcut
DESKTOP_DIR="$HOME/Desktop"
if [ -d "$DESKTOP_DIR" ]; then
    cp start-spoteyfa-macos.command "$DESKTOP_DIR/SPOTEYFA.command"
    echo -e "${GREEN}🖥️  Desktop shortcut created${NC}"
fi

# Create Applications shortcut (if possible)
APPS_DIR="/Applications"
USER_APPS_DIR="$HOME/Applications"

if [ -d "$USER_APPS_DIR" ]; then
    cp start-spoteyfa-macos.command "$USER_APPS_DIR/SPOTEYFA.command"
    echo -e "${GREEN}📱 Applications shortcut created${NC}"
fi

echo ""
echo "==============================================="
echo -e "${GREEN}${BOLD}    🎉 INSTALLATION COMPLETED!${NC}"
echo "==============================================="
echo ""
echo -e "${GREEN}✅ SPOTEYFA v0.3.0 is ready for macOS${NC}"
echo ""
echo -e "${BLUE}🚀 To start SPOTEYFA:${NC}"
echo "   • Double-click: SPOTEYFA.command on Desktop"
echo "   • Or run: ./start-spoteyfa-macos.command"
echo "   • Or terminal: npm start"
echo ""
echo -e "${BLUE}🍎 macOS Features:${NC}"
echo "   • Native macOS integration"
echo "   • Retina display support"
echo "   • Touch Bar support (if available)"
echo "   • macOS keyboard shortcuts"
echo "   • Dark Mode compatibility"
echo ""
echo -e "${YELLOW}⚠️  First Run:${NC}"
echo "   • Allow microphone access (for Spotify)"
echo "   • Allow network connections"
echo "   • Set up Spotify API in the wizard"
echo ""
echo -e "${GREEN}🎵 Enjoy beautiful music on macOS!${NC}"