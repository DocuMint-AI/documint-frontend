# DocuMint AI - Docker Image for Cloud Run
# Builds both frontend and backend in a single container

FROM node:18-slim as frontend-builder

# Install basic tools
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory for frontend
WORKDIR /app/frontend

# Copy all files from root (dockerignore will exclude unwanted files)
COPY . .

# Install frontend dependencies
RUN npm ci --only=production

# Build frontend (this will read from environment variables at build time)
RUN npm run build
# Python backend stage
FROM python:3.11-slim as backend-builder

# Install system dependencies for Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster Python package management
RUN pip install uv

# Set working directory for backend
WORKDIR /app/backend

# Copy backend requirements
COPY backend/requirements.txt ./

# Install backend dependencies using uv
RUN uv pip install --system -r requirements.txt

# Production stage
FROM python:3.11-slim

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    supervisor \
    nginx \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python package management
RUN pip install uv

# Create app user for security
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy Python dependencies from backend builder
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy built frontend from frontend builder (adjust paths to match where files were built)
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/next.config.js ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Copy backend source code
COPY backend/ ./backend/

# Copy startup scripts
COPY scripts/ ./scripts/

# Create supervisor configuration inline (since docker/supervisor.conf doesn't exist)
RUN mkdir -p /etc/supervisor/conf.d

# Create necessary directories
RUN mkdir -p /app/backend/data/system \
    && mkdir -p /var/log/supervisor \
    && mkdir -p /var/log/documint

# Set permissions
RUN chown -R app:app /app \
    && chown -R app:app /var/log/documint \
    && chmod +x /app/scripts/*.sh

# Expose ports
EXPOSE 8080

# Switch to app user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start supervisor to manage both services
CMD ["/app/scripts/start.sh"]