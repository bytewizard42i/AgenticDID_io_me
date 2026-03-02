# 🚀 AgenticDID Cloud Run - Quick Start

## ✅ SETUP COMPLETE!

You now have **BOTH** deployment methods ready:

### 🤖 Method 1: GitHub Actions (Automated)
**Push to deploy automatically!**

```bash
# 1. Setup GitHub secrets (one time)
#    Go to: https://github.com/bytewizard42i/AgenticDID_io_me_MAIN/settings/secrets/actions
#    Add: GCP_PROJECT_ID and GCP_SA_KEY

# 2. Push the workflow
git add .github/workflows/deploy-cloud-run.yml
git commit -m "Add Cloud Run CI/CD"
git push

# Done! Auto-deploys on every push to main
```

### 🐳 Method 2: Manual Docker Deploy
**Full control, deploy on demand**

```bash
# 1. Setup secrets (one time)
cd /home/js/utils_AgenticDID_io_me/AgenticDID_io_me_REAL-DEAL
./infrastructure/cloud-run/setup-secrets.sh

# 2. Build & push images
./infrastructure/cloud-run/build-and-push.sh

# 3. Deploy to Cloud Run
./infrastructure/cloud-run/deploy-from-registry.sh

# Updates deployed in ~5 minutes
```

---

## 📦 What Was Created

### Files Created:
- ✅ `.github/workflows/deploy-cloud-run.yml` - GitHub Actions CI/CD
- ✅ `infrastructure/cloud-run/build-and-push.sh` - Build Docker images
- ✅ `infrastructure/cloud-run/deploy-from-registry.sh` - Deploy from registry
- ✅ `infrastructure/cloud-run/setup-secrets.sh` - Setup Secret Manager
- ✅ `infrastructure/cloud-run/README.md` - Complete docs

### Services That Will Deploy:
1. **agenticdid-api** (API Gateway) - 512Mi RAM, 1 CPU
2. **agenticdid-agents** (Agent Runtime) - 1Gi RAM, 2 CPU  
3. **agenticdid-midnight** (Midnight Gateway) - 512Mi RAM, 1 CPU

---

## 🎯 Choose Your Path

### For Hackathon (Quick & Dirty):
```bash
# Use existing script (source-based, slower)
./infrastructure/cloud-run/deploy-all.sh
```

### For Production (Professional):
```bash
# Use Docker + GitHub Actions (faster, CI/CD)
# 1. Setup once:
./infrastructure/cloud-run/setup-secrets.sh

# 2. Then either:
#    a) Push to GitHub (auto-deploys)
#    b) Or manually: ./infrastructure/cloud-run/build-and-push.sh
```

---

## 📋 Prerequisites Checklist

Before deploying, make sure you have:

- [ ] Google Cloud account with billing enabled
- [ ] `gcloud` CLI authenticated (`gcloud auth login`)
- [ ] Project created or selected (`gcloud config set project agenticdid`)
- [ ] `.env` file configured (copy from `.env.example`)
- [ ] Anthropic API key in `.env`

---

## 🎉 Next Steps

1. **Pick your deployment method** (GitHub or Manual)
2. **Setup secrets** (run `setup-secrets.sh`)
3. **Deploy!** (push to GitHub or run deploy script)
4. **Get URLs** and add to your hackathon submission

---

## 📚 Full Documentation

See: `infrastructure/cloud-run/README.md`

---

**You're ready to deploy! Pick your method and go! 🚀**
