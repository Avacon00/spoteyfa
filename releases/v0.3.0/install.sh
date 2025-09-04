#!/bin/bash

# SPOTEYFA v0.3.0 - Cross-Platform Installation Script
# Supports: Linux (Ubuntu, Debian, Fedora, Arch) and macOS

echo "==============================================="
echo "    SPOTEYFA v0.3.0 - Cross-Platform Installer"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Platform detection
OS_TYPE=$(uname -s)
ARCH=$(uname -m)

echo -e "${BLUE}[INFO]${NC} Detected OS: $OS_TYPE ($ARCH)"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js based on OS
install_nodejs() {
    echo -e "${YELLOW}[1/3]${NC} Installing Node.js..."
    
    case $OS_TYPE in
        "Linux")
            if command_exists apt; then
                # Ubuntu/Debian
                echo "Installing Node.js via apt..."
                sudo apt update
                sudo apt install -y nodejs npm
            elif command_exists dnf; then
                # Fedora
                echo "Installing Node.js via dnf..."
                sudo dnf install -y nodejs npm
            elif command_exists pacman; then
                # Arch Linux
                echo "Installing Node.js via pacman..."
                sudo pacman -S --noconfirm nodejs npm
            elif command_exists zypper; then
                # openSUSE
                echo "Installing Node.js via zypper..."
                sudo zypper install -y nodejs npm
            else
                echo -e "${RED}[ERROR]${NC} Unsupported Linux distribution"
                echo "Please install Node.js manually: https://nodejs.org"
                exit 1
            fi
            ;;
        "Darwin")
            # macOS
            if command_exists brew; then
                echo "Installing Node.js via Homebrew..."
                brew install node
            else
                echo -e "${YELLOW}[WARNING]${NC} Homebrew not found"
                echo "Please install Node.js manually from: https://nodejs.org"
                echo "Or install Homebrew first: https://brew.sh"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}[ERROR]${NC} Unsupported operating system: $OS_TYPE"
            exit 1
            ;;
    esac
}

# Check if Node.js is already installed
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}[✓]${NC} Node.js is already installed: $NODE_VERSION"
else
    echo -e "${YELLOW}[!]${NC} Node.js not found, installing..."
    install_nodejs
fi

# Verify Node.js installation
if ! command_exists node; then
    echo -e "${RED}[ERROR]${NC} Node.js installation failed"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/3]${NC} Installing SPOTEYFA dependencies..."

# Install dependencies
if [ -f "package.json" ]; then
    npm install --production
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[✓]${NC} Dependencies installed successfully"
    else
        echo -e "${RED}[ERROR]${NC} Failed to install dependencies"
        exit 1
    fi
else
    echo -e "${RED}[ERROR]${NC} package.json not found"
    exit 1
fi

echo ""
echo -e "${YELLOW}[3/3]${NC} Creating launch script..."

# Create platform-specific launch script
if [ "$OS_TYPE" = "Darwin" ]; then
    # macOS launch script
    cat > start-spoteyfa.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting SPOTEYFA..."
npm start
EOF
else
    # Linux launch script
    cat > start-spoteyfa.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting SPOTEYFA..."
npm start
EOF
fi

chmod +x start-spoteyfa.sh

echo ""
echo "==============================================="
echo -e "${GREEN}    INSTALLATION COMPLETED!${NC}"
echo "==============================================="
echo ""
echo -e "${GREEN}[✓]${NC} SPOTEYFA v0.3.0 is ready to use"
echo ""
echo "To start SPOTEYFA:"
echo -e "${BLUE}  ./start-spoteyfa.sh${NC}"
echo ""
echo "Or manually:"
echo -e "${BLUE}  npm start${NC}"
echo ""
echo "Features:"
echo "  • Apple Glassmorphism Design"
echo "  • Multi-Monitor Support"
echo "  • Focus Mode"
echo "  • International Support (DE/EN)"
echo ""
echo "Enjoy your music! 🎵"