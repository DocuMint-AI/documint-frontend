"""
Configuration settings for DocuMint Backend
"""

import os
from typing import Optional
from pathlib import Path

class Config:
    # File upload settings
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}
    
    # Data storage paths
    DATA_DIR = "data"
    SYSTEM_DIR = os.path.join(DATA_DIR, "system")
    USERS_FILE = os.path.join(SYSTEM_DIR, "users.json")
    
    # Google API keys (can be set via environment variables or files)
    @property
    def GEMINI_API_KEY(self) -> Optional[str]:
        # First try direct environment variable
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            return api_key
        
        # Then try reading from file specified in environment
        api_key_file = os.getenv("GEMINI_API_KEY_FILE")
        if api_key_file and os.path.exists(api_key_file):
            try:
                with open(api_key_file, 'r') as f:
                    return f.read().strip()
            except Exception:
                pass
        
        return None
    
    GOOGLE_CLOUD_VISION_CREDENTIALS: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    # Security settings
    @property
    def SECRET_KEY(self) -> str:
        # First try direct environment variable
        secret_key = os.getenv("SECRET_KEY")
        if secret_key:
            return secret_key
        
        # Then try reading from file specified in environment
        secret_key_file = os.getenv("SECRET_KEY_FILE")
        if secret_key_file and os.path.exists(secret_key_file):
            try:
                with open(secret_key_file, 'r') as f:
                    return f.read().strip()
            except Exception:
                pass
        
        # Fallback to default (not recommended for production)
        return "your-secret-key-change-in-production"
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    @property
    def ALLOWED_ORIGINS(self):
        origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
        return [origin.strip() for origin in origins_env.split(",")]

# Global config instance
config = Config()