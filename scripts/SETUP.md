# DocuMint AI Setup Scripts

This folder contains automated setup scripts to get DocuMint AI running from scratch on different operating systems.

## Scripts Available

- **`setup-and-run.sh`** - Linux/macOS setup script
- **`setup-and-run.bat`** - Windows setup script

## What These Scripts Do

1. **Dependency Checks & Installation:**
   - Check for Node.js and npm, install if missing
   - Check for Python 3, install if missing  
   - Check for uv (Python package manager), install if missing

2. **Project Setup:**
   - Install frontend dependencies (`npm install`)
   - Create Python virtual environment (`uv venv`)
   - Activate virtual environment (platform-specific)
   - Install backend dependencies (`uv pip install -r requirements.txt`)
   - Create environment configuration files if missing

3. **Application Launch:**
   - Start backend server on `http://localhost:8000`
   - Start frontend server on `http://localhost:3000`

## Usage

### Linux/macOS

```bash
# Make the script executable
chmod +x scripts/setup-and-run.sh

# Run the setup script
scripts/setup-and-run.sh
```

### Windows

```batch
# Run from Command Prompt or PowerShell
scripts\setup-and-run.bat
```

## Requirements

### Linux/macOS
- `curl` or `wget` (for downloading dependencies)
- `sudo` access (for system package installation)
- Internet connection

### Windows
- PowerShell 5.0+ (included in Windows 10+)
- Administrator privileges may be required for some installations
- Internet connection

## What Gets Installed

### Node.js & npm
- **Linux:** Via NodeSource repository (Ubuntu/Debian), yum (CentOS/RHEL), or pacman (Arch)
- **macOS:** Via Homebrew (installs Homebrew if needed)
- **Windows:** Downloads and installs Node.js LTS from official website

### Python 3
- **Linux:** Via system package manager (apt, yum, pacman)
- **macOS:** Via Homebrew  
- **Windows:** Via winget (Windows 10+) or direct download from python.org

### uv (Python Package Manager)
- **All platforms:** Via official installer script from astral.sh/uv

## Generated Configuration Files

The scripts will create these files if they don't exist:

### `.env.local` (Frontend)
```env
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
NEXT_PUBLIC_FORCE_MOCK_MODE=false
```

### `backend/.env` (Backend)
```env
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

**Important:** You'll need to update the backend `.env` file with your actual API keys.

## Virtual Environment

The scripts automatically create and manage a Python virtual environment using `uv venv`:

- **Location:** `backend/.venv/`
- **Activation:** Automatic during script execution
- **Benefits:** Isolated Python dependencies, no conflicts with system packages

### Manual Virtual Environment Management

If you need to work with the backend manually:

**Linux/macOS:**
```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

**Windows:**
```batch
cd backend
uv venv
.venv\Scripts\activate.bat
uv pip install -r requirements.txt
```

To deactivate the virtual environment:
```bash
deactivate
```

## After Running

Once the scripts complete successfully:

1. **Frontend:** Available at http://localhost:3000
2. **Backend:** Available at http://localhost:8000
3. **Health Check:** http://localhost:8000/health

### Linux/macOS
- Both servers run in the same terminal
- Press `Ctrl+C` to stop both servers

### Windows  
- Each server runs in its own Command Prompt window
- Close the windows to stop the servers

## Troubleshooting

### Script Permission Issues (Linux/macOS)
```bash
chmod +x scripts/setup-and-run.sh
```

### PowerShell Execution Policy (Windows)
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Installation Failures
1. Check your internet connection
2. Ensure you have admin/sudo privileges
3. For Linux, make sure your package manager is up to date:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   
   # CentOS/RHEL
   sudo yum update
   
   # Arch
   sudo pacman -Sy
   ```

### Port Conflicts
If ports 3000 or 8000 are already in use:
1. Stop other services using those ports
2. Or modify the ports in the configuration files

## Manual Installation

If the automated scripts fail, you can install dependencies manually:

1. **Node.js:** Download from https://nodejs.org/
2. **Python 3:** Download from https://python.org/
3. **uv:** Follow instructions at https://github.com/astral-sh/uv

Then run:
```bash
npm install
cd backend && uv venv && source .venv/bin/activate && uv pip install -r requirements.txt
```

Or on Windows:
```batch
npm install
cd backend && uv venv && .venv\Scripts\activate.bat && uv pip install -r requirements.txt
```

## Support

For issues with these setup scripts, please check:
1. The error messages in the terminal output
2. Ensure you have proper permissions
3. Verify your internet connection
4. Check the main project README for additional setup information