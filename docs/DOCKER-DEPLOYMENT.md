# DocuMint AI - Docker Deployment Guide

This guide covers deploying DocuMint AI as a single Docker container to Google Cloud Run.

## 🏗️ Architecture

The Docker container includes:
- **Frontend**: Next.js application (port 3000)
- **Backend**: FastAPI application (port 8000) 
- **Reverse Proxy**: Nginx (port 8080) - serves both frontend and backend
- **Rate Limiting**: Built-in API rate limiting (100 req/min per IP)

## 🚀 Quick Deploy to Cloud Run

### Prerequisites

1. **Google Cloud SDK** installed and authenticated
2. **Docker** installed locally
3. **Required Secrets** (see Environment Variables section)

### Deploy Script

```bash
# Set your Google Cloud project
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Run the deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Deployment

```bash
# 1. Build the image
docker build -t gcr.io/YOUR_PROJECT/documint-ai .

# 2. Push to registry
docker push gcr.io/YOUR_PROJECT/documint-ai

# 3. Deploy to Cloud Run
gcloud run deploy documint-ai \
  --image gcr.io/YOUR_PROJECT/documint-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 1 \
  --set-env-vars="GEMINI_API_KEY=your-key" \
  --set-env-vars="SECRET_KEY=your-secret"
```

## 🔧 Environment Variables

### Required Secrets

These must be set as Cloud Run environment variables or secrets:

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `SECRET_KEY` | JWT signing secret | `your-256-bit-secret` |
| `GOOGLE_CLOUD_CREDENTIALS_JSON` | GCP service account JSON | `{"type":"service_account"...}` |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Cloud Run port |
| `FRONTEND_PORT` | `3000` | Internal frontend port |
| `BACKEND_PORT` | `8000` | Internal backend port |
| `NODE_ENV` | `production` | Node.js environment |
| `NEXT_PUBLIC_FORCE_MOCK_MODE` | `false` | Enable mock mode |
| `ALLOWED_ORIGINS` | `https://*.run.app` | CORS origins |

### Setting Secrets in Cloud Run

```bash
# Option 1: Environment variables (less secure)
gcloud run services update documint-ai \
  --set-env-vars="GEMINI_API_KEY=your-key"

# Option 2: Secret Manager (recommended)
# First create secrets in Secret Manager
gcloud secrets create gemini-api-key --data-file=api-key.txt
gcloud secrets create documint-secret-key --data-file=secret.txt

# Then reference in Cloud Run
gcloud run services update documint-ai \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --set-secrets="SECRET_KEY=documint-secret-key:latest"
```

## 🛡️ Rate Limiting

The backend includes built-in rate limiting:

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| `/register` | 5/min | Prevent spam registration |
| `/login` | 10/min | Prevent brute force |
| `/upload` | 10/min | Limit file uploads |
| `/process-document` | 5/min | Limit AI processing |
| `/qa` | 15/min | Limit Q&A requests |
| `/update-password` | 3/min | Strict password security |

## 🧪 Local Development with Docker

### Development Container

```bash
# Build and run development container
chmod +x scripts/dev-docker.sh
export GEMINI_API_KEY="your-key"
./scripts/dev-docker.sh
```

### Custom Development Setup

```bash
# Build image
docker build -t documint-ai:dev .

# Run with custom environment
docker run -it --rm \
  -p 8080:8080 \
  -e GEMINI_API_KEY="your-key" \
  -e SECRET_KEY="dev-secret" \
  -e NEXT_PUBLIC_FORCE_MOCK_MODE="false" \
  documint-ai:dev
```

## 📁 File Structure

```
/
├── Dockerfile              # Multi-stage build
├── scripts/
│   ├── start.sh            # Container startup script
│   ├── deploy.sh           # Cloud Run deployment
│   └── dev-docker.sh       # Local development
├── cloud-run/
│   └── service.yaml        # Cloud Run service config
└── .dockerignore           # Docker build exclusions
```

## 🔍 Troubleshooting

### Container Startup Issues

```bash
# Check container logs
docker logs <container-id>

# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=documint-ai" --limit 50
```

### Common Issues

1. **Secrets not loading**: Ensure environment variables are set correctly
2. **Port binding**: Cloud Run expects port 8080 (configured in startup script)
3. **Memory limits**: Increase memory if getting OOM errors
4. **Build failures**: Check .dockerignore isn't excluding required files

### Health Checks

The container includes health checks:
- **Backend**: `http://localhost:8000/health`
- **Frontend**: `http://localhost:3000` (Next.js)
- **Proxy**: `http://localhost:8080/health`

## 🚦 Production Considerations

### Scaling Configuration

```yaml
scaling:
  minScale: 1        # Keep warm instances
  maxScale: 10       # Limit max instances
  concurrency: 100   # Requests per instance
```

### Security

- All secrets passed via environment variables (not files)
- Rate limiting prevents abuse
- CORS configured for production domains
- JWT tokens for authentication

### Monitoring

Set up monitoring for:
- Container health checks
- Rate limit violations
- API response times
- Memory and CPU usage

### Cost Optimization

- Use `minScale: 0` for development
- Set appropriate CPU/memory limits
- Monitor usage patterns for optimization

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Google Secret Manager](https://cloud.google.com/secret-manager)
- [FastAPI Rate Limiting](https://slowapi.readthedocs.io/)