# DocuMint AI - Legal Document Analysis Platform

A powerful Next.js 14 application for AI-powered legal document analysis, featuring document upload, intelligent insights, and interactive Q&A capabilities.

## 🚀 Features

- **Document Upload**: Drag & drop or file selection for PDF/DOCX documents
- **AI Analysis**: Intelligent document analysis with risk assessment and compliance scoring
- **Interactive Panels**: Resizable document viewer, insights panel, and Q&A assistant
- **Dark Mode**: Beautiful dark/light theme toggle
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Mock API**: Built-in mock API for development and demonstration
- **Real API Ready**: Prepared for integration with FastAPI backend

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks and context
- **File Handling**: React Dropzone

## 📁 Project Structure

```
frontend/                  # Frontend Next.js application
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── layout.tsx    # Root layout with theme provider
│   │   ├── page.tsx      # Home page (redirects to upload)
│   │   ├── upload/       # Document upload page
│   │   ├── workspace/    # Main analysis workspace
│   │   └── settings/     # Configuration and settings
│   ├── components/       # Reusable React components
│   │   ├── Layout.tsx    # Shared layout component
│   │   ├── ThemeToggle.tsx # Dark/light mode toggle
│   │   ├── DocumentUpload.tsx # File upload component
│   │   ├── ResizableDivider.tsx # Panel resize functionality
│   │   └── panels/       # Analysis panel components
│   │       ├── DocumentPanel.tsx
│   │       ├── InsightsPanel.tsx
│   │       └── QAPanel.tsx
│   ├── context/          # React context providers
│   │   └── ThemeContext.tsx # Theme state management
│   ├── lib/              # Utility functions
│   │   ├── api.ts        # API calls (mock & real)
│   │   └── theme.ts      # Material UI theme configuration
│   └── styles/           # Global styles
│       └── globals.css   # Tailwind CSS imports
├── package.json          # Frontend dependencies
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration

backend/                   # FastAPI Python backend
├── ai/                   # AI processing modules
├── auth/                 # Authentication system
├── documents/            # Document processing
├── utils/                # Utility functions
├── main.py              # FastAPI application entry
└── requirements.txt     # Python dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd documint-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
   Edit `frontend/.env.local` to customize API endpoints and configuration:
   ```env
   NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_BACKEND_UPLOAD_ENDPOINT=/upload
   NEXT_PUBLIC_BACKEND_PROCESS_ENDPOINT=/api/v1/process-document
   NEXT_PUBLIC_BACKEND_QA_ENDPOINT=/api/v1/qa
   NEXT_PUBLIC_BACKEND_OCR_ENDPOINT=/api/v1/ocr
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_SUPPORTED_FORMATS=.pdf,.doc,.docx
   ```

4. **Start the development server**
   ```bash
   cd frontend
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Upload Page (`/upload`)
- Drag and drop PDF or DOCX files
- Or click to browse and select files
- Files are automatically processed and analyzed
- Redirects to workspace after successful upload

### Workspace Page (`/workspace`)
- **Document Panel**: View your uploaded document content
- **AI Insights Panel**: Risk assessment, compliance issues, and suggestions
- **Q&A Panel**: Ask questions about your document and get AI-powered answers
- **Resizable Panels**: Drag dividers to adjust panel sizes
- **Panel Controls**: Expand, minimize, or restore panels

### Settings Page (`/settings`)
- **API Mode**: Switch between mock API (demo) and real FastAPI backend
- **Data Management**: Clear locally stored data and preferences
- **About**: Information about the platform and technologies used

## 🔧 API Configuration

### Environment Variables
The application uses environment variables for configuration. Copy `.env.example` to `.env.local` and customize:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000       # Backend server URL
NEXT_PUBLIC_BACKEND_UPLOAD_ENDPOINT=/upload              # File upload endpoint
NEXT_PUBLIC_BACKEND_PROCESS_ENDPOINT=/api/v1/process-document  # Document processing endpoint
NEXT_PUBLIC_BACKEND_QA_ENDPOINT=/api/v1/qa               # Q&A endpoint
NEXT_PUBLIC_BACKEND_OCR_ENDPOINT=/api/v1/ocr             # OCR text extraction endpoint

# Frontend Configuration
NEXT_PUBLIC_FRONTEND_PORT=3000                           # Frontend development port

# App Configuration  
NEXT_PUBLIC_MAX_FILE_SIZE=10485760                       # Max file size in bytes (10MB)
NEXT_PUBLIC_SUPPORTED_FORMATS=.pdf,.doc,.docx           # Supported file formats
```

### Mock API (Default)
The application includes a built-in mock API that simulates real backend responses:
- Instant responses with sample data
- No external dependencies required
- Perfect for development and testing

### Real FastAPI Backend
To connect to a real backend, enable "Real FastAPI Backend" in settings:
- Requires a running FastAPI server
- Uses environment variables for endpoint configuration
- Expected endpoints (configurable via .env):
  - `POST ${NEXT_PUBLIC_BACKEND_BASE_URL}${NEXT_PUBLIC_BACKEND_UPLOAD_ENDPOINT}` - File upload
  - `POST ${NEXT_PUBLIC_BACKEND_BASE_URL}${NEXT_PUBLIC_BACKEND_PROCESS_ENDPOINT}` - Document analysis
  - `POST ${NEXT_PUBLIC_BACKEND_BASE_URL}${NEXT_PUBLIC_BACKEND_QA_ENDPOINT}` - Question answering
  - `POST ${NEXT_PUBLIC_BACKEND_BASE_URL}${NEXT_PUBLIC_BACKEND_OCR_ENDPOINT}` - OCR text extraction

## 🎨 Theming

The application features a comprehensive dark/light theme system:
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy on the eyes for extended use
- **System Preference**: Automatically detects user's system preference
- **Persistent**: Theme choice is saved in localStorage

## 📱 Responsive Design

Optimized for various screen sizes:
- **Desktop**: Full panel layout with resizable dividers
- **Tablet**: Stacked panels with touch-friendly controls
- **Mobile**: Single-column layout with panel navigation

## 🔒 Data Handling

- **Local Storage**: Documents and analysis results stored locally
- **Privacy**: No data sent to external servers in mock mode
- **Security**: File validation and size limits enforced
- **Cleanup**: Easy data clearing through settings page

## 🚀 Deployment

### Vercel (Recommended)
```bash
cd frontend
npm run build
vercel --prod
```

### Other Platforms
```bash
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js 14 and the React ecosystem
- Icons provided by Lucide React
- Styling powered by Tailwind CSS
- TypeScript for type safety and better developer experience

## 📞 Support

For support, questions, or feature requests, please open an issue on the GitHub repository.

---

**DocuMint AI** - Revolutionizing legal document analysis with AI-powered insights. 🚀