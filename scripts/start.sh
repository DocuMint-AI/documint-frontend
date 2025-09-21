#!/bin/bash
set -e

echo "Starting DocuMint AI services..."

# Set default values for Cloud Run
export PORT=${PORT:-8080}
export FRONTEND_PORT=${FRONTEND_PORT:-3000}
export BACKEND_PORT=${BACKEND_PORT:-8000}

# Create environment files from Cloud Run environment variables
echo "Setting up environment configuration..."

# Backend environment setup
cat > /app/backend/.env << EOF
# Backend Configuration from Cloud Run Environment Variables
GEMINI_API_KEY=${GEMINI_API_KEY}
GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS}
SECRET_KEY=${SECRET_KEY}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-http://localhost:3000,https://*.run.app}
EOF

# Frontend environment setup  
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

NEXT_PUBLIC_FRONTEND_PORT=${FRONTEND_PORT}
NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME:-DocuMint AI}
NEXT_PUBLIC_MAX_FILE_SIZE=${NEXT_PUBLIC_MAX_FILE_SIZE:-10485760}
NEXT_PUBLIC_SUPPORTED_FORMATS=${NEXT_PUBLIC_SUPPORTED_FORMATS:-.pdf,.doc,.docx}
NEXT_PUBLIC_FORCE_MOCK_MODE=${NEXT_PUBLIC_FORCE_MOCK_MODE:-false}

NODE_ENV=production
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

# Start frontend service
echo "Starting Next.js frontend on port $FRONTEND_PORT..."
cd /app/frontend
npm start -- --port $FRONTEND_PORT --hostname 0.0.0.0 &
FRONTEND_PID=$!

# Setup nginx reverse proxy to serve both on PORT (for Cloud Run)
echo "Setting up reverse proxy on port $PORT..."
cat > /tmp/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server localhost:$BACKEND_PORT;
    }
    
    upstream frontend {
        server localhost:$FRONTEND_PORT;
    }
    
    server {
        listen $PORT;
        server_name _;
        
        # Health check endpoint
        location /health {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # API endpoints
        location ~ ^/(api|register|login|logout|me|update-password) {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
        }
        
        # Frontend (everything else)
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
EOF

# Start nginx
nginx -c /tmp/nginx.conf -g "daemon off;" &
NGINX_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID $NGINX_PID 2>/dev/null || true
    wait
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

echo "All services started successfully!"
echo "- Backend running on port $BACKEND_PORT"
echo "- Frontend running on port $FRONTEND_PORT"  
echo "- Reverse proxy running on port $PORT"
echo "Ready to receive requests..."

# Wait for any process to exit
wait -n

# If we get here, one of the processes died
echo "A service has stopped unexpectedly"
cleanup
exit 1