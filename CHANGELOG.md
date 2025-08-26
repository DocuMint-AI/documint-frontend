# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - 2025-08-27

### Added
- Python FastAPI backend replacing Node.js API routes
- Document processing with PyPDF2 and python-docx
- Markdown rendering for chat responses using react-markdown
- Simplified UI layout with grid-based design
- Document viewer as main component
- Insights panel on top right
- Chat panel on bottom right
- Maximize/minimize functionality for panels
- CORS configuration for cross-origin requests
- Health check endpoint for backend monitoring

### Changed
- Backend language from JavaScript/TypeScript to Python
- API endpoints removed `/api` prefix
- UI layout simplified to match wireframe design
- Document context management improved
- Component structure reorganized for better UX

### Fixed
- Build errors resolved
- Component integration issues
- Dependency management for react-markdown

### Technical Details
- FastAPI server on port 8000
- Ollama AI integration (doomgrave/gemma3-tools:12b-it-q2_K)
- Material UI with custom Pixel OS-inspired theme
- Context API for state management

## [0.0.1] - 2025-08-26

### Added
- Initial Next.js 14 application setup
- Material UI integration
- Basic document upload functionality
- Ollama AI integration
- Dark/light mode support
- Landing page and workspace layout
- Document context provider
- Theme context provider