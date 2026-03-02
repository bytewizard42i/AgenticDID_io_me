# 🚀 Cloud Run Deployment Guide

Complete guide for deploying AgenticDID to Google Cloud Run with both manual and automated methods.

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and configured
3. **Docker** installed (for manual builds)
4. **GitHub** repository connected (for CI/CD)

## 🎯 Deployment Options

### Option 1: GitHub Actions (Automated CI/CD) ⭐ **RECOMMENDED**

**Best for**: Continuous deployment, team collaboration, production environments

**Setup once, deploy automatically on every push!**

#### Step 1: Setup GitHub Secrets

Go to your repo: `Settings` → `Secrets and variables` → `Actions`

Add these secrets:

```
GCP_PROJECT_ID=agenticdid
GCP_SA_KEY=<your-service-account-json>
```

To get the service account key:
```bash
# Create service account
gcloud iam service-accounts create agenticdid-deployer \
    --display-name="AgenticDID Deployer"

# Grant necessary roles
gcloud projects add-iam-policy-binding agenticdid \
    --member="serviceAccount:agenticdid-deployer@agenticdid.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding agenticdid \
    --member="serviceAccount:agenticdid-deployer@agenticdid.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

# Create key
gcloud iam service-accounts keys create key.json \
    --iam-account=agenticdid-deployer@agenticdid.iam.gserviceaccount.com

# Copy the contents of key.json to GCP_SA_KEY secret
cat key.json
```

#### Step 2: Setup Cloud Secrets

```bash
cd /home/js/utils_AgenticDID_io_me/AgenticDID_io_me_REAL-DEAL
./infrastructure/cloud-run/setup-secrets.sh
```

#### Step 3: Push to GitHub

```bash
git add .github/workflows/deploy-cloud-run.yml
git commit -m "Add Cloud Run deployment workflow"
git push
```

**That's it!** Every push to `main` branch will automatically deploy to Cloud Run.

---

### Option 2: Manual Docker Build & Deploy

**Best for**: Quick tests, local development, one-off deployments

#### Step 1: Setup Google Cloud Project

```bash
# Login
gcloud auth login

# Set project
export GOOGLE_PROJECT_ID=agenticdid
gcloud config set project $GOOGLE_PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

#### Step 2: Setup Secrets

```bash
./infrastructure/cloud-run/setup-secrets.sh
```

#### Step 3: Build and Push Docker Images

```bash
./infrastructure/cloud-run/build-and-push.sh
```

This will:
- Build all service Docker images
- Tag with git commit hash and `latest`
- Push to Google Artifact Registry

#### Step 4: Deploy to Cloud Run

```bash
./infrastructure/cloud-run/deploy-from-registry.sh
```

This deploys all services from the registry.

---

### Option 3: Source-Based Deploy (Legacy)

**Best for**: Prototyping, no Docker required

```bash
./infrastructure/cloud-run/deploy-all.sh
```

This builds and deploys directly from source code (slower but simpler).

---

## 🏗️ Architecture

```
GitHub
  ↓ (push to main)
GitHub Actions Workflow
  ↓
Build Docker Images
  ↓
Push to Artifact Registry
  ↓
Deploy to Cloud Run
  ↓
Live Services!
```

### Services Deployed

| Service | Port | Description | Memory | CPU |
|---------|------|-------------|--------|-----|
| `agenticdid-api` | 8080 | API Gateway | 512Mi | 1 |
| `agenticdid-agents` | 8080 | Agents Runtime | 1Gi | 2 |
| `agenticdid-midnight` | 8080 | Midnight Gateway | 512Mi | 1 |
| `agenticdid-tts` | 8080 | TTS Service | 256Mi | 1 |

---

## 🔐 Required Secrets

Store these in Google Secret Manager (automated by `setup-secrets.sh`):

| Secret Name | Description | Source |
|-------------|-------------|--------|
| `anthropic-key` | Claude API key | Anthropic console |
| `gcp-credentials` | Google Cloud service account JSON | GCP IAM |
| `midnight-rpc-url` | Midnight Network RPC endpoint | Midnight docs |

---

## 🎯 Cost Estimation

Cloud Run pricing (us-central1):

| Resource | Price | Estimated Monthly Cost |
|----------|-------|----------------------|
| 512Mi memory @ 1000 req/day | $0.00001/req | ~$3 |
| 1Gi memory @ 1000 req/day | $0.00002/req | ~$6 |
| Networking | $0.12/GB | ~$5 |
| **Total** | | **~$14/month** |

**Free tier includes:**
- 2 million requests/month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

---

## 📊 Monitoring

### View Logs

```bash
# All services
gcloud run logs read --service agenticdid-api --region us-central1

# Follow logs
gcloud run logs tail --service agenticdid-agents --region us-central1

# Error logs only
gcloud run logs read --service agenticdid-api --region us-central1 --limit 50 --filter 'severity>=ERROR'
```

### View Metrics

Console: https://console.cloud.google.com/run?project=agenticdid

### Get Service URLs

```bash
gcloud run services list --region us-central1
```

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Check Docker
docker --version

# Test build locally
cd backend/api
docker build -t test-api .
```

### Deploy Fails

```bash
# Check permissions
gcloud projects get-iam-policy agenticdid

# Check secrets exist
gcloud secrets list

# Check service account
gcloud iam service-accounts list
```

### Service Won't Start

```bash
# Check logs
gcloud run logs read --service agenticdid-api --limit 100

# Check environment variables
gcloud run services describe agenticdid-api --region us-central1
```

---

## 🎉 Quick Commands

```bash
# Deploy everything from scratch
./infrastructure/cloud-run/setup-secrets.sh && \
./infrastructure/cloud-run/build-and-push.sh && \
./infrastructure/cloud-run/deploy-from-registry.sh

# Update a single service
docker build -t us-central1-docker.pkg.dev/agenticdid/agenticdid/agenticdid-api:latest ./backend/api
docker push us-central1-docker.pkg.dev/agenticdid/agenticdid/agenticdid-api:latest
gcloud run deploy agenticdid-api --image us-central1-docker.pkg.dev/agenticdid/agenticdid/agenticdid-api:latest --region us-central1

# Rollback to previous version
gcloud run services update-traffic agenticdid-api --to-revisions=PREVIOUS=100 --region us-central1

# Delete all services
gcloud run services delete agenticdid-api --region us-central1 --quiet
gcloud run services delete agenticdid-agents --region us-central1 --quiet
gcloud run services delete agenticdid-midnight --region us-central1 --quiet
```

---

## 🏆 For Hackathon Judges

After deployment, your live URLs will be:

- **Frontend**: `https://agenticdid-frontend-[hash].run.app`
- **API**: `https://agenticdid-api-[hash].run.app`
- **Agents**: `https://agenticdid-agents-[hash].run.app`

Include these in your Devpost submission!

---

**Built with ❤️ by AgenticDID Team**
