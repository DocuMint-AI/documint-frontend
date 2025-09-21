#!/bin/bash
# Local development script with Docker

set -e

echo "Starting DocuMint AI in development mode with Docker..."

# Build the image
docker build -t documint-ai:dev .

# Run the container with development environment
docker run -it --rm \
  -p 8080:8080 \
  -e NODE_ENV=development \
  -e PORT=8080 \
  -e FRONTEND_PORT=3000 \
  -e BACKEND_PORT=8000 \
  -e NEXT_PUBLIC_APP_NAME="DocuMint AI (Dev)" \
  -e NEXT_PUBLIC_FORCE_MOCK_MODE=false \
  -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
  -e SECRET_KEY="${SECRET_KEY:-dev-secret-key-change-in-production}" \
  -e GOOGLE_CLOUD_CREDENTIALS_JSON="${GOOGLE_CLOUD_CREDENTIALS_JSON}" \
  documint-ai:dev