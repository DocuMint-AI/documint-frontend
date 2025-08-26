# DocuMint

A modern legal document analysis application built with Next.js and Material UI, powered by AI for intelligent document insights.

## Features

- **Document Upload**: Support for PDF and DOCX files
- **AI Analysis**: Powered by Ollama for document insights and chat
- **Clean UI**: Simplified layout with document viewer, insights panel, and chat
- **Markdown Support**: Rich formatting for AI responses
- **Dark/Light Mode**: Toggle between themes
- **Real-time Chat**: Interactive Q&A about uploaded documents

## Tech Stack

- **Frontend**: Next.js 14, React, Material UI
- **Backend**: Python FastAPI
- **AI**: Ollama (doomgrave/gemma3-tools:12b-it-q2_K)
- **Document Processing**: PyPDF2, python-docx
- **Styling**: Material UI with custom Pixel OS-inspired theme

## Setup

### Prerequisites

- Node.js 18+
- Python 3.8+
- Ollama with doomgrave/gemma3-tools:12b-it-q2_K model

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install fastapi uvicorn python-multipart aiofiles httpx PyPDF2 python-docx pydantic
```

3. Start the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Ollama Setup

1. Install Ollama
2. Pull the required model:
```bash
ollama pull doomgrave/gemma3-tools:12b-it-q2_K
```

3. Start Ollama service (usually runs on http://localhost:11434)

## Usage

1. Navigate to `http://localhost:3000/workspace`
2. Upload a PDF or DOCX legal document
3. View the document in the main panel
4. Get AI-generated insights in the top-right panel
5. Chat with the AI about the document in the bottom-right panel
6. Use maximize buttons to expand panels for better viewing

## API Endpoints

- `POST /upload` - Upload and process document
- `POST /chat` - Chat with AI about document
- `POST /insights` - Generate document insights
- `GET /health` - Health check

## Development

```bash
# Build for production
npm run build

# Run linting
npm run lint
```
