#!/bin/bash
set -e

echo "Starting DocuMint AI services..."

# Set default values for Cloud Run
export PORT=${PORT:-8080}
export BACKEND_PORT=${BACKEND_PORT:-8000}

# Create environment files from Cloud Run environment variables
echo "Setting up environment configuration..."

# Backend environment setup
cat > /app/backend/.env << EOF
# Backend Configuration from Cloud Run Environment Variables
GEMINI_API_KEY=${GEMINI_API_KEY}
GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS}
SECRET_KEY=${SECRET_KEY}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-http://localhost:${PORT},https://*.run.app}
EOF

# Frontend environment setup - Frontend will run on the main PORT
cat > /app/frontend/.env.local << EOF
# Frontend Configuration from Cloud Run Environment Variables
NEXT_PUBLIC_BACKEND_PROTOCOL=${NEXT_PUBLIC_BACKEND_PROTOCOL:-http}
NEXT_PUBLIC_BACKEND_HOST=${NEXT_PUBLIC_BACKEND_HOST:-localhost}
NEXT_PUBLIC_BACKEND_PORT=${BACKEND_PORT}
NEXT_PUBLIC_BACKEND_BASE_URL=${NEXT_PUBLIC_BACKEND_BASE_URL:-http://localhost:${BACKEND_PORT}}

NEXT_PUBLIC_AUTH_REGISTER_ENDPOINT=${NEXT_PUBLIC_AUTH_REGISTER_ENDPOINT:-/register}
NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT=${NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT:-/login}
NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT=${NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT:-/logout}
NEXT_PUBLIC_AUTH_ME_ENDPOINT=${NEXT_PUBLIC_AUTH_ME_ENDPOINT:-/me}
NEXT_PUBLIC_AUTH_UPDATE_PASSWORD_ENDPOINT=${NEXT_PUBLIC_AUTH_UPDATE_PASSWORD_ENDPOINT:-/update-password}

NEXT_PUBLIC_BACKEND_UPLOAD_ENDPOINT=${NEXT_PUBLIC_BACKEND_UPLOAD_ENDPOINT:-/api/v1/upload}
NEXT_PUBLIC_BACKEND_PROCESS_ENDPOINT=${NEXT_PUBLIC_BACKEND_PROCESS_ENDPOINT:-/api/v1/process-document}
NEXT_PUBLIC_BACKEND_QA_ENDPOINT=${NEXT_PUBLIC_BACKEND_QA_ENDPOINT:-/api/v1/qa}
NEXT_PUBLIC_BACKEND_DOCUMENTS_ENDPOINT=${NEXT_PUBLIC_BACKEND_DOCUMENTS_ENDPOINT:-/api/v1/documents}
NEXT_PUBLIC_BACKEND_HEALTH_ENDPOINT=${NEXT_PUBLIC_BACKEND_HEALTH_ENDPOINT:-/health}

NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME:-DocuMint AI}
NEXT_PUBLIC_MAX_FILE_SIZE=${NEXT_PUBLIC_MAX_FILE_SIZE:-10485760}
NEXT_PUBLIC_SUPPORTED_FORMATS=${NEXT_PUBLIC_SUPPORTED_FORMATS:-.pdf,.doc,.docx}
NEXT_PUBLIC_FORCE_MOCK_MODE=${NEXT_PUBLIC_FORCE_MOCK_MODE:-false}

NODE_ENV=production
PORT=${PORT}
EOF

# Write Google Cloud credentials if provided
if [ ! -z "$GOOGLE_CLOUD_CREDENTIALS_JSON" ]; then
    echo "Setting up Google Cloud credentials..."
    echo "$GOOGLE_CLOUD_CREDENTIALS_JSON" > /app/backend/.cheetah/gcp-credentials.json
    export GOOGLE_APPLICATION_CREDENTIALS="/app/backend/.cheetah/gcp-credentials.json"
fi

# Write Gemini API key if provided
if [ ! -z "$GEMINI_API_KEY" ]; then
    echo "$GEMINI_API_KEY" > /app/backend/.cheetah/gemini-api-key.txt
fi

# Write secret key if provided
if [ ! -z "$SECRET_KEY" ]; then
    echo "$SECRET_KEY" > /app/backend/.cheetah/documint-secret-key.txt
fi

# Create data directories
mkdir -p /app/backend/data/system

# Start backend service
echo "Starting FastAPI backend on port $BACKEND_PORT..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --workers 1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
        echo "Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Backend failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

# Start frontend service on the main PORT (8080 for Cloud Run)
echo "Starting Next.js frontend on port $PORT..."
cd /app/frontend
npm start -- --port $PORT --hostname 0.0.0.0 &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

echo "All services started successfully!"
echo "- Backend running on port $BACKEND_PORT" 
echo "- Frontend running on port $PORT"
echo "Ready to receive requests on port $PORT..."

# Wait for any process to exit
wait -n

# If we get here, one of the processes died
echo "A service has stopped unexpectedly"
cleanup
exit 1