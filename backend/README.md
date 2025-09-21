# DocuMint Backend API

A FastAPI backend for document analysis and AI-powered insights using Google Gemini API.

## Features

- **User Authentication**: Register, login, and session management
- **Document Upload**: Support for PDF, DOC, DOCX, and image files (≤10MB)
- **OCR Processing**: Google Cloud Vision API for scanned documents
- **AI Analysis**: Google Gemini API for compliance and risk analysis
- **Q&A System**: Answer questions about uploaded documents
- **Session Management**: Organize documents by user sessions

## Quick Start

### 1. Install Dependencies

```bash
cd backend
uv pip install -r requirements.txt
```

### 2. Setup API Credentials

#### Option 1: Using .cheetah folder (Recommended)
The backend is configured to read all credentials from the `.cheetah/` folder:

1. **Gemini API Key:**
   - Replace the content in `.cheetah/gemini-api-key.txt` with your actual API key
   
2. **Google Cloud Vision API:**
   - Replace the content in `.cheetah/gcp-credentials.json` with your actual service account JSON

3. **Secret Key:**
   - Replace the content in `.cheetah/documint-secret-key.txt` with a secure secret key

#### Option 2: Using Environment Variables
Alternatively, you can set environment variables directly:

```bash
export GEMINI_API_KEY=your_actual_api_key_here
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account.json
export SECRET_KEY=your_secure_secret_key_here
```

### 3. Environment Configuration

The `.env` file is configured to use the `.cheetah/` folder for all credentials:

```bash
# Current .env configuration
GEMINI_API_KEY_FILE=.cheetah/gemini-api-key.txt
GOOGLE_APPLICATION_CREDENTIALS=.cheetah/gcp-credentials.json
SECRET_KEY_FILE=.cheetah/documint-secret-key.txt
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Quick Setup Guide

For first-time setup, follow these steps:

1. **Install dependencies:**
   ```bash
   cd backend
   uv pip install -r requirements.txt
   ```

2. **Configure credentials in .cheetah/ folder:**
   ```bash
   # Edit these files with your actual credentials:
   # .cheetah/gemini-api-key.txt        -> Your Gemini API key
   # .cheetah/gcp-credentials.json      -> Your Google Cloud service account JSON
   # .cheetah/documint-secret-key.txt   -> A secure secret key for JWT signing
   ```

3. **Verify configuration:**
   ```bash
   uv run python test_setup.py
   ```

4. **Start the server:**
   ```bash
   uv run python main.py
   ```

### 5. Run the Server

```bash
# Development server
uv run python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Test the Setup

```bash
uv run python test_setup.py
```

## API Endpoints

### Authentication
- `POST /register` - Create new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user info

### Health Check
- `GET /health` - Service health status

### Documents
- `POST /api/v1/upload` - Upload document
- `POST /api/v1/process-document` - Analyze document with AI
- `POST /api/v1/qa` - Ask questions about document
- `GET /api/v1/documents` - List user documents

## Project Structure

```
backend/
├── main.py                  # FastAPI app entry point
├── config.py               # Configuration settings
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── test_setup.py          # Test script
│
├── .cheetah/              # API credentials (secure)
│   ├── gemini-api-key.txt # Gemini API key
│   ├── gcp-credentials.json # Google Cloud service account
│   └── documint-secret-key.txt # JWT secret key
│
├── auth/                   # Authentication module
│   ├── routes.py          # Auth endpoints
│   └── utils.py           # Password hashing, sessions
│
├── documents/             # Document handling
│   ├── routes.py         # Upload and processing endpoints
│   ├── parser.py         # PDF/DOCX parsing
│   └── storage.py        # File storage utilities
│
├── ai/                    # AI integration
│   ├── gemini_client.py  # Gemini API wrapper
│   ├── prompts.py        # AI prompts
│   └── vision_ocr.py     # Google Vision OCR
│
├── utils/                 # Utilities
│   ├── errors.py         # Custom exceptions
│   └── response.py       # API response helpers
│
└── data/                  # User data (auto-created)
    ├── system/
    │   └── users.json    # User registry
    └── {user-id}/
        └── {session-uid}/
            ├── {doc_id}.pdf
            ├── metadata.json
            ├── {doc_id}_ocr.json
            └── analysis.json
```

## Google API Setup

### Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Set `GEMINI_API_KEY` environment variable

### Google Cloud Vision API (Optional for OCR)
1. Create a [Google Cloud Project](https://console.cloud.google.com/)
2. Enable the Vision API
3. Create a service account and download the JSON key file
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file

## Usage Examples

### Register User
```bash
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

### Login
```bash
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

### Upload Document
```bash
curl -X POST "http://localhost:8000/api/v1/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf"
```

### Analyze Document
```bash
curl -X POST "http://localhost:8000/api/v1/process-document" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"doc_id": "your-doc-id"}'
```

### Ask Question
```bash
curl -X POST "http://localhost:8000/api/v1/qa" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"doc_id": "your-doc-id", "query": "What are the key terms?"}'
```

## Development

### Running Tests
```bash
uv run python test_setup.py
```

### API Documentation
Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Security Notes

- **API Credentials**: Stored in `.cheetah/` folder (excluded from git)
- Change the `SECRET_KEY` in `.env` for production
- Use HTTPS in production
- Consider implementing rate limiting
- Never commit `.env` or `.cheetah/` files to version control
- The `.gitignore` file is configured to exclude sensitive files

## File Size and Type Limits

- **Max file size**: 10MB
- **Supported formats**: 
  - Documents: PDF, DOC, DOCX
  - Images: JPG, JPEG, PNG (for OCR)

## Error Handling

The API returns standardized error responses:
```json
{
  "success": false,
  "error": "Error description",
  "message": "User-friendly message"
}
```

Common HTTP status codes:
- `400` - Bad request (validation errors)
- `401` - Unauthorized (login required)
- `404` - Not found
- `413` - File too large
- `500` - Internal server error
- `502` - AI service error
- `503` - Service unavailable (API not configured)