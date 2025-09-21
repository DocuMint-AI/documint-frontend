#!/bin/bash
# Build and deploy script for Cloud Run

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"documint-ai"}
SERVICE_NAME=${SERVICE_NAME:-"documint-ai"}
REGION=${REGION:-"us-central1"}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Building and deploying DocuMint AI to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# Push to Google Container Registry
echo "Pushing to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 100 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="PORT=8080" \
  --set-env-vars="FRONTEND_PORT=3000" \
  --set-env-vars="BACKEND_PORT=8000" \
  --set-env-vars="NEXT_PUBLIC_APP_NAME=DocuMint AI" \
  --set-env-vars="NEXT_PUBLIC_FORCE_MOCK_MODE=false" \
  --set-env-vars="NEXT_PUBLIC_MAX_FILE_SIZE=10485760" \
  --set-env-vars="NEXT_PUBLIC_SUPPORTED_FORMATS=.pdf,.doc,.docx"

echo "Deployment completed!"
echo "Your service URL:"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'