#!/bin/bash

# setup-and-run.sh - Complete setup and run script for DocuMint AI (Linux/macOS)
# This script sets up the entire application from scratch including dependencies

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js and npm on different systems
install_nodejs() {
    log_info "Installing Node.js and npm..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists apt-get; then
            # Ubuntu/Debian
            log_info "Detected Ubuntu/Debian, installing Node.js via NodeSource repository..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command_exists yum; then
            # CentOS/RHEL/Fedora
            log_info "Detected CentOS/RHEL/Fedora, installing Node.js via NodeSource repository..."
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs npm
        elif command_exists pacman; then
            # Arch Linux
            log_info "Detected Arch Linux, installing Node.js via pacman..."
            sudo pacman -S --noconfirm nodejs npm
        else
            log_error "Unsupported Linux distribution. Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            log_info "Installing Node.js via Homebrew..."
            brew install node
        else
            log_warning "Homebrew not found. Installing Homebrew first..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            brew install node
        fi
    else
        log_error "Unsupported operating system. Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
}

# Function to install uv (Python package manager)
install_uv() {
    log_info "Installing uv (Python package manager)..."
    
    if command_exists curl; then
        curl -LsSf https://astral.sh/uv/install.sh | sh
        # Source the shell profile to make uv available in current session
        export PATH="$HOME/.cargo/bin:$PATH"
    elif command_exists wget; then
        wget -qO- https://astral.sh/uv/install.sh | sh
        export PATH="$HOME/.cargo/bin:$PATH"
    else
        log_error "Neither curl nor wget found. Please install one of them first."
        exit 1
    fi
    
    # Verify installation
    if ! command_exists uv; then
        log_error "uv installation failed. Please install manually from https://github.com/astral-sh/uv"
        exit 1
    fi
}

# Function to install Python if needed
install_python() {
    if ! command_exists python3; then
        log_info "Python 3 not found. Installing Python 3..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y python3 python3-pip python3-venv
            elif command_exists yum; then
                sudo yum install -y python3 python3-pip
            elif command_exists pacman; then
                sudo pacman -S --noconfirm python python-pip
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command_exists brew; then
                brew install python@3.11
            fi
        fi
    fi
}

# Main setup function
main() {
    log_info "Starting DocuMint AI setup and run script for Linux/macOS..."
    log_info "======================================================="
    
    # Get script directory and project root
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    
    log_info "Project root: $PROJECT_ROOT"
    cd "$PROJECT_ROOT"
    
    # Check and install Node.js/npm
    log_info "Checking for Node.js and npm..."
    if ! command_exists node || ! command_exists npm; then
        log_warning "Node.js or npm not found."
        install_nodejs
    else
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        log_success "Node.js found: $NODE_VERSION"
        log_success "npm found: $NPM_VERSION"
    fi
    
    # Check and install Python
    log_info "Checking for Python 3..."
    if ! command_exists python3; then
        log_warning "Python 3 not found."
        install_python
    else
        PYTHON_VERSION=$(python3 --version)
        log_success "Python 3 found: $PYTHON_VERSION"
    fi
    
    # Check and install uv
    log_info "Checking for uv (Python package manager)..."
    if ! command_exists uv; then
        log_warning "uv not found."
        install_uv
    else
        UV_VERSION=$(uv --version)
        log_success "uv found: $UV_VERSION"
    fi
    
    # Install frontend dependencies
    log_info "Installing frontend dependencies..."
    if [ -f "frontend/package.json" ]; then
        cd frontend
        npm install
        cd ..
        log_success "Frontend dependencies installed successfully"
    else
        log_error "frontend/package.json not found"
        exit 1
    fi
    
    # Setup Python virtual environment and install backend dependencies
    log_info "Setting up Python virtual environment..."
    if [ -d "backend" ] && [ -f "backend/requirements.txt" ]; then
        cd backend
        
        # Create virtual environment using uv
        log_info "Creating virtual environment with uv..."
        uv venv
        
        # Activate virtual environment (Linux/macOS)
        log_info "Activating virtual environment..."
        source .venv/bin/activate
        
        # Install dependencies in virtual environment
        log_info "Installing backend dependencies in virtual environment..."
        uv pip install -r requirements.txt
        
        cd ..
        log_success "Backend virtual environment and dependencies installed successfully"
    else
        log_error "Backend directory or requirements.txt not found"
        exit 1
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        log_info "Creating .env.local file..."
        cat > .env.local << EOF
# DocuMint AI Environment Configuration
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
NEXT_PUBLIC_FORCE_MOCK_MODE=false
EOF
        log_success ".env.local created"
    fi
    
    # Create backend .env if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        log_info "Creating backend .env file..."
        cat > backend/.env << EOF
# Backend Environment Configuration
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
EOF
        log_warning "Please update backend/.env with your actual API keys"
    fi
    
    log_success "Setup completed successfully!"
    log_info "======================================================="
    log_info "Starting applications..."
    
    # Start backend server in background
    log_info "Starting backend server on http://localhost:8000..."
    cd backend
    # Activate virtual environment and run server
    source .venv/bin/activate && uv run python main.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend server
    log_info "Starting frontend server on http://localhost:3000..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    log_success "Both servers are starting..."
    log_info "Frontend: http://localhost:3000"
    log_info "Backend:  http://localhost:8000"
    log_info "Backend Health: http://localhost:8000/health"
    log_info ""
    log_info "Press Ctrl+C to stop both servers"
    
    # Function to cleanup on exit
    cleanup() {
        log_info "Stopping servers..."
        kill $BACKEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        log_success "Servers stopped"
        exit 0
    }
    
    # Set trap to cleanup on script exit
    trap cleanup SIGINT SIGTERM
    
    # Wait for both processes
    wait
}

# Run main function
main "$@"