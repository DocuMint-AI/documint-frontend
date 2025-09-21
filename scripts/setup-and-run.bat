@echo off
REM setup-and-run.bat - Complete setup and run script for DocuMint AI (Windows)
REM This script sets up the entire application from scratch including dependencies

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+ with ANSI support)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Logging functions using goto labels
goto :main

:log_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:log_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:log_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:log_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check if command exists
:command_exists
where %~1 >nul 2>&1
goto :eof

REM Function to install Node.js
:install_nodejs
call :log_info "Installing Node.js and npm..."
call :log_info "Downloading Node.js installer..."

REM Download Node.js LTS installer
set "NODE_URL=https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi"
set "NODE_INSTALLER=%TEMP%\node-installer.msi"

REM Use PowerShell to download (more reliable than curl on Windows)
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_INSTALLER%'}"

if not exist "%NODE_INSTALLER%" (
    call :log_error "Failed to download Node.js installer"
    exit /b 1
)

call :log_info "Installing Node.js..."
msiexec /i "%NODE_INSTALLER%" /quiet /norestart

REM Wait for installation to complete
timeout /t 10 /nobreak >nul

REM Clean up installer
del "%NODE_INSTALLER%" 2>nul

REM Refresh environment variables
call :refresh_env

call :log_success "Node.js installation completed"
goto :eof

REM Function to install uv
:install_uv
call :log_info "Installing uv (Python package manager)..."

REM Download and install uv using PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm https://astral.sh/uv/install.ps1 | iex}"

REM Add uv to PATH for current session
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

call :log_success "uv installation completed"
goto :eof

REM Function to install Python
:install_python
call :log_info "Installing Python 3..."

REM Check if winget is available (Windows 10 1809+ / Windows 11)
where winget >nul 2>&1
if !errorlevel! equ 0 (
    call :log_info "Installing Python via winget..."
    winget install Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements
) else (
    call :log_info "winget not available, downloading Python installer..."
    set "PYTHON_URL=https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe"
    set "PYTHON_INSTALLER=%TEMP%\python-installer.exe"
    
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%PYTHON_URL%' -OutFile '%PYTHON_INSTALLER%'}"
    
    if exist "%PYTHON_INSTALLER%" (
        call :log_info "Installing Python..."
        "%PYTHON_INSTALLER%" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
        timeout /t 15 /nobreak >nul
        del "%PYTHON_INSTALLER%" 2>nul
    ) else (
        call :log_error "Failed to download Python installer"
        exit /b 1
    )
)

call :refresh_env
call :log_success "Python installation completed"
goto :eof

REM Function to refresh environment variables
:refresh_env
REM Refresh PATH from registry
for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SYS_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKEY_CURRENT_USER\Environment" /v PATH 2^>nul') do set "USER_PATH=%%b"
set "PATH=%SYS_PATH%;%USER_PATH%"
goto :eof

REM Function to check and install Chocolatey
:install_chocolatey
call :log_info "Installing Chocolatey package manager..."
powershell -Command "& {Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))}"
call :refresh_env
goto :eof

REM Main function
:main
call :log_info "Starting DocuMint AI setup and run script for Windows..."
call :log_info "======================================================"

REM Get script directory and project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

call :log_info "Project root: %CD%"

REM Check and install Node.js/npm
call :log_info "Checking for Node.js and npm..."
call :command_exists node
if !errorlevel! neq 0 (
    call :log_warning "Node.js not found."
    call :install_nodejs
) else (
    for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
    call :log_success "Node.js found: !NODE_VERSION!"
)

call :command_exists npm
if !errorlevel! neq 0 (
    call :log_warning "npm not found after Node.js installation."
    call :refresh_env
    call :command_exists npm
    if !errorlevel! neq 0 (
        call :log_error "npm still not found. Please restart command prompt and try again."
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('npm --version') do set "NPM_VERSION=%%i"
    call :log_success "npm found: !NPM_VERSION!"
)

REM Check and install Python
call :log_info "Checking for Python 3..."
call :command_exists python
if !errorlevel! neq 0 (
    call :log_warning "Python not found."
    call :install_python
) else (
    for /f "tokens=*" %%i in ('python --version') do set "PYTHON_VERSION=%%i"
    call :log_success "Python found: !PYTHON_VERSION!"
)

REM Check and install uv
call :log_info "Checking for uv (Python package manager)..."
call :command_exists uv
if !errorlevel! neq 0 (
    call :log_warning "uv not found."
    call :install_uv
    call :refresh_env
    call :command_exists uv
    if !errorlevel! neq 0 (
        call :log_error "uv installation failed. Please install manually from https://github.com/astral-sh/uv"
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('uv --version') do set "UV_VERSION=%%i"
    call :log_success "uv found: !UV_VERSION!"
)

REM Install frontend dependencies
call :log_info "Installing frontend dependencies..."
if exist "frontend\package.json" (
    cd frontend
    npm install
    cd ..
    if !errorlevel! equ 0 (
        call :log_success "Frontend dependencies installed successfully"
    ) else (
        call :log_error "Failed to install frontend dependencies"
        exit /b 1
    )
) else (
    call :log_error "frontend\package.json not found"
    exit /b 1
)

REM Setup Python virtual environment and install backend dependencies
call :log_info "Setting up Python virtual environment..."
if exist "backend\requirements.txt" (
    cd backend
    
    REM Create virtual environment using uv
    call :log_info "Creating virtual environment with uv..."
    uv venv
    if !errorlevel! neq 0 (
        call :log_error "Failed to create virtual environment"
        cd ..
        exit /b 1
    )
    
    REM Activate virtual environment (Windows)
    call :log_info "Activating virtual environment..."
    call .venv\Scripts\activate.bat
    
    REM Install dependencies in virtual environment
    call :log_info "Installing backend dependencies in virtual environment..."
    uv pip install -r requirements.txt
    if !errorlevel! equ 0 (
        call :log_success "Backend virtual environment and dependencies installed successfully"
    ) else (
        call :log_error "Failed to install backend dependencies"
        cd ..
        exit /b 1
    )
    cd ..
) else (
    call :log_error "Backend directory or requirements.txt not found"
    exit /b 1
)

REM Create .env.local file if it doesn't exist
if not exist ".env.local" (
    call :log_info "Creating .env.local file..."
    (
        echo # DocuMint AI Environment Configuration
        echo NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
        echo NEXT_PUBLIC_FORCE_MOCK_MODE=false
    ) > .env.local
    call :log_success ".env.local created"
)

REM Create backend .env if it doesn't exist
if not exist "backend\.env" (
    call :log_info "Creating backend .env file..."
    (
        echo # Backend Environment Configuration
        echo SECRET_KEY=your-secret-key-here
        echo GEMINI_API_KEY=your-gemini-api-key-here
    ) > backend\.env
    call :log_warning "Please update backend\.env with your actual API keys"
)

call :log_success "Setup completed successfully!"
call :log_info "======================================================"
call :log_info "Starting applications..."

REM Start backend server
call :log_info "Starting backend server on http://localhost:8000..."
cd backend
REM Create a batch file to activate venv and run server
echo @echo off > start_backend.bat
echo call .venv\Scripts\activate.bat >> start_backend.bat
echo uv run python main.py >> start_backend.bat
start "DocuMint Backend" cmd /k "start_backend.bat"
cd ..

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend server
call :log_info "Starting frontend server on http://localhost:3000..."
start "DocuMint Frontend" cmd /k "cd frontend && npm run dev"

call :log_success "Both servers are starting in separate windows..."
call :log_info "Frontend: http://localhost:3000"
call :log_info "Backend:  http://localhost:8000"
call :log_info "Backend Health: http://localhost:8000/health"
call :log_info ""
call :log_info "Both servers are running in separate command prompt windows."
call :log_info "Close those windows to stop the servers."

pause
goto :eof