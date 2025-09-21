# ----------------------------
# Frontend Build Stage
# ----------------------------
FROM node:18-slim AS frontend-builder

# Set working directory
WORKDIR /app/frontend

# Copy only package files first for caching
COPY package*.json ./

# Install all dependencies (dev dependencies needed for Next.js build)
RUN npm ci

# Copy frontend source and config files required for build
COPY src/ ./src
COPY public/ ./public
COPY next.config.js ./
COPY tsconfig.json ./                # required for path aliases
COPY postcss.config.js ./            # Tailwind/PostCSS config
COPY tailwind.config.ts ./           # Tailwind config

# Build frontend
RUN npm run build

# ----------------------------
# Backend Build Stage
# ----------------------------
FROM python:3.11-slim AS backend-builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster Python package management
RUN pip install uv

# Set working directory
WORKDIR /app/backend

# Copy backend requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN uv pip install --system -r requirements.txt

# Copy backend source
COPY backend/ ./backend

# ----------------------------
# Production Stage
# ----------------------------
FROM python:3.11-slim

# Install system dependencies, Node.js, and supervisor
RUN apt-get update && apt-get install -y \
    curl \
    supervisor \
    nginx \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python package management
RUN pip install uv

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy Python dependencies from backend builder
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy built frontend from frontend builder
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/next.config.js ./frontend/
COPY --from=frontend-builder /app/frontend/tsconfig.json ./frontend/
COPY --from=frontend-builder /app/frontend/postcss.config.js ./frontend/
COPY --from=frontend-builder /app/frontend/tailwind.config.ts ./frontend/

# Copy backend source code
COPY backend/ ./backend/

# Copy startup scripts
COPY scripts/ ./scripts/

# Create supervisor and log directories
RUN mkdir -p /etc/supervisor/conf.d /var/log/supervisor /var/log/documint /app/backend/data/system

# Set permissions
RUN chown -R app:app /app \
    && chown -R app:app /var/log/documint \
    && chmod +x /app/scripts/*.sh

# Expose port
EXPOSE 8080

# Switch to non-root user
USER app

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start app via supervisor
CMD ["/app/scripts/start.sh"]
