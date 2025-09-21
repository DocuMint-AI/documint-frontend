# Multi-stage optimized Dockerfile for Documint AI
# Fixes build issues and reduces image size

# ----------------------------
# Frontend Build Stage
# ----------------------------
FROM node:20-slim AS frontend-builder

# Install build essentials for native dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force && \
    npm ci --no-audit --no-fund

# Copy source files (order matters for caching)
COPY frontend/next.config.js ./
COPY frontend/tsconfig.json ./
COPY frontend/postcss.config.js ./
COPY frontend/tailwind.config.ts ./
COPY frontend/next-env.d.ts ./
COPY frontend/public/ ./public/
COPY frontend/src/ ./src/

# Build the application
RUN npm run build

# Remove dev dependencies and keep only production files
RUN npm prune --production

# ----------------------------
# Backend Dependencies Stage
# ----------------------------
FROM python:3.11-slim AS backend-deps

# Install system dependencies for Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster package management
RUN pip install --no-cache-dir uv

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY backend/requirements.txt ./
RUN uv pip install --system --no-cache-dir -r requirements.txt

# ----------------------------
# Production Stage
# ----------------------------
FROM python:3.11-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    nginx \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g npm@latest

# Create app user for security
RUN useradd --create-home --shell /bin/bash --uid 1000 app

# Set working directory
WORKDIR /app

# Copy Python dependencies from deps stage
COPY --from=backend-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-deps /usr/local/bin /usr/local/bin

# Copy only production frontend build
COPY --from=frontend-builder /app/.next ./frontend/.next
COPY --from=frontend-builder /app/public ./frontend/public
COPY --from=frontend-builder /app/package*.json ./frontend/
COPY --from=frontend-builder /app/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/next.config.js ./frontend/

# Copy backend source
COPY backend/ ./backend/

# Copy startup scripts
COPY scripts/ ./scripts/

# Create necessary directories with correct permissions
RUN mkdir -p \
    /var/log/documint \
    /app/backend/data/system \
    /app/backend/.cheetah \
    && touch /app/backend/data/system/users.json \
    && echo '{}' > /app/backend/data/system/users.json

# Set ownership and permissions
RUN chown -R app:app /app \
    && chown -R app:app /var/log/documint \
    && chmod +x /app/scripts/*.sh \
    && chmod 755 /app/backend/data \
    && chmod 644 /app/backend/data/system/users.json

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start app via start script
CMD ["/app/scripts/start.sh"]
