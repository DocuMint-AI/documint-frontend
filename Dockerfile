# Multi-stage optimized Dockerfile for Documint AI
# FastAPI backend + Next.js frontend in one container

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

WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source files
COPY frontend/ ./

# Set build-time environment variables for production
ENV NEXT_PUBLIC_BACKEND_BASE_URL=""
ENV NODE_ENV=production

# Build Next.js app (with standalone output for production)
RUN npm run build && npm prune --production

# ----------------------------
# Backend Dependencies Stage
# ----------------------------
FROM python:3.11-slim AS backend-deps

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster pip installs
RUN pip install --no-cache-dir uv

WORKDIR /app

COPY backend/requirements.txt ./
RUN uv pip install --system --no-cache-dir -r requirements.txt

# ----------------------------
# Production Stage
# ----------------------------
FROM python:3.11-slim AS production

ENV PYTHONUNBUFFERED=1 \
    PATH="/home/app/.local/bin:$PATH"

# Install Node.js runtime (for serving Next.js)
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g npm@latest

# Create app user
RUN useradd --create-home --shell /bin/bash --uid 1000 app

WORKDIR /app

# Copy backend deps
COPY --from=backend-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-deps /usr/local/bin /usr/local/bin

# Copy frontend build output
COPY --from=frontend-builder /app/.next ./frontend/.next
COPY --from=frontend-builder /app/public ./frontend/public
COPY --from=frontend-builder /app/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/package*.json ./frontend/
COPY --from=frontend-builder /app/next.config.js ./frontend/

# Copy backend source
COPY backend/ ./backend/

# Copy startup scripts
COPY scripts/ ./scripts/

# Create required dirs
RUN mkdir -p \
    /var/log/documint \
    /app/backend/data/system \
    /app/backend/.cheetah \
    && echo '{}' > /app/backend/data/system/users.json

# Set permissions
RUN chown -R app:app /app /var/log/documint && \
    chmod +x /app/scripts/*.sh

USER app

EXPOSE 8080

# Health check (FastAPI must have /health endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["/app/scripts/start.sh"]