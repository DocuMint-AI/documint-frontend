# Google Secret Manager Setup for DocuMint AI

This guide explains how to securely manage secrets for your DocuMint AI application using Google Secret Manager.

## Prerequisites

- Google Cloud CLI (`gcloud`) installed and authenticated
- Google Cloud Project with Secret Manager API enabled
- Appropriate IAM permissions

## 1. Enable Secret Manager API

```bash
gcloud services enable secretmanager.googleapis.com
```

## 2. Create Secrets

### Gemini API Key
```bash
# Create the secret
gcloud secrets create gemini-api-key --replication-policy="automatic"

# Add your Gemini API key value
echo "your-actual-gemini-api-key" | gcloud secrets versions add gemini-api-key --data-file=-
```

### DocuMint Secret Key
```bash
# Create the secret
gcloud secrets create documint-secret-key --replication-policy="automatic"

# Generate and add a secure secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))" | gcloud secrets versions add documint-secret-key --data-file=-
```

### Google Cloud Credentials (if needed)
```bash
# Create the secret
gcloud secrets create gcp-credentials --replication-policy="automatic"

# Add your service account JSON file
gcloud secrets versions add gcp-credentials --data-file=path/to/your/service-account-key.json
```

## 3. Grant Cloud Run Access to Secrets

```bash
# Get your Cloud Run service account (replace PROJECT_ID with your actual project ID)
PROJECT_ID="your-project-id"
SERVICE_ACCOUNT="PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Grant access to each secret
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding documint-secret-key \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gcp-credentials \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
```

## 4. Deploy with Secrets

Your `cloud-run/service.yaml` is already configured to use these secrets. Deploy with:

```bash
# Build and push your container image
docker build -t gcr.io/PROJECT_ID/documint-ai .
docker push gcr.io/PROJECT_ID/documint-ai

# Deploy to Cloud Run using the service.yaml
gcloud run services replace cloud-run/service.yaml --region=asia-south1
```

## 5. Verify Secret Access

After deployment, check your Cloud Run logs to ensure secrets are loaded:

```bash
gcloud logs read --service=documint-ai --region=asia-south1 --limit=50
```

## Local Development

For local development, you can still use the `.env` file approach:

### Backend `.env` file:
```env
# Direct environment variables (preferred)
GEMINI_API_KEY=your-local-gemini-api-key
SECRET_KEY=your-local-secret-key
GOOGLE_APPLICATION_CREDENTIALS=path/to/local/service-account.json

# CORS settings
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Security Best Practices

1. **Never commit secrets to git** - The `.gitignore` excludes `.cheetah/` and `.env` files
2. **Use least privilege** - Only grant necessary permissions to service accounts
3. **Rotate secrets regularly** - Update secret versions periodically
4. **Monitor access** - Enable audit logging for secret access
5. **Use different secrets for different environments** - Separate dev/staging/prod secrets

## Troubleshooting

### Secret not found error:
```bash
# List all secrets
gcloud secrets list

# View secret details
gcloud secrets describe gemini-api-key
```

### Permission denied error:
```bash
# Check IAM bindings
gcloud secrets get-iam-policy gemini-api-key
```

### Service account issues:
```bash
# Find your Cloud Run service account
gcloud run services describe documint-ai --region=asia-south1 --format="value(spec.template.spec.serviceAccountName)"
```

## Alternative: Using Cloud Run Environment Variables

If you prefer not to use Secret Manager, you can set environment variables directly:

```bash
gcloud run deploy documint-ai \
    --image gcr.io/PROJECT_ID/documint-ai \
    --region asia-south1 \
    --set-env-vars "GEMINI_API_KEY=your-key,SECRET_KEY=your-secret" \
    --port 8080
```

**Note:** This approach is less secure as environment variables are visible in the Cloud Run console.