# 🧪 Local Testing Guide - AgenticDID

## ✅ Pre-flight Checklist

- [x] Docker installed ✓
- [x] Docker Compose installed ✓
- [x] `.env` configured ✓
- [x] Google Cloud project ready ✓

**Your GCP Project**: `propane-avatar-476612-e0` ($300 credits)

---

## 🚀 Step 1: Start All Services

```bash
cd /home/js/utils_AgenticDID_io_me/AgenticDID_io_me_REAL-DEAL

# Start everything
docker-compose up --build
```

This will start:
- 🌐 **Frontend** → http://localhost:5173
- 🔌 **API Gateway** → http://localhost:8787
- 🤖 **Agents Runtime** → http://localhost:3000
- 🌙 **Midnight Gateway** → http://localhost:3001
- 🔊 **TTS Service** → http://localhost:3002

**Wait for**: "Server started successfully!" messages from all services

---

## 🧪 Step 2: Test Each Service

### Test API Gateway
```bash
curl http://localhost:8787/health
# Expected: {"status":"healthy"}
```

### Test Agents Runtime
```bash
curl http://localhost:3000/health
# Expected: {"status":"healthy","checks":{"claude":true}}
```

### Test Midnight Gateway
```bash
curl http://localhost:3001/health
# Expected: {"status":"healthy"}
```

### Test Frontend
Open browser: http://localhost:5173
- Should see AgenticDID UI
- Try selecting a goal (e.g., "Send Money")
- Watch the console logs in Docker

---

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs -f

# Restart a specific service
docker-compose restart api-gateway

# Rebuild from scratch
docker-compose down
docker-compose up --build
```

### Port conflicts
```bash
# Check what's using ports
sudo lsof -i :5173
sudo lsof -i :8787
sudo lsof -i :3000

# Stop conflicting services or change ports in docker-compose.yml
```

### Missing dependencies
```bash
# Check .env file
cat .env | grep -E "ANTHROPIC|GOOGLE"

# Verify Docker images
docker images | grep agenticdid
```

---

## ✅ Step 3: Validate Everything Works

### Run the Full Flow

1. **Open Frontend**: http://localhost:5173
2. **Select Goal**: "Send $50 to Alice"
3. **Watch Console**: See agent execution logs
4. **Check API Logs**: `docker-compose logs -f api-gateway`
5. **Check Agents Logs**: `docker-compose logs -f agents-runtime`

Expected behavior:
- ✅ Comet agent auto-selected
- ✅ Banker agent executes transaction
- ✅ Midnight proof generated
- ✅ Success message displayed

---

## 🎯 When Local Testing Succeeds

**You're ready for Cloud Run!** 🎉

### Next: Update Cloud Run Config

Since your GCP project is `propane-avatar-476612-e0`, update deployment scripts:

```bash
# Set project ID for Cloud Run
export GOOGLE_PROJECT_ID=propane-avatar-476612-e0

# Run setup
./infrastructure/cloud-run/setup-secrets.sh
```

---

## 📊 Performance Baselines

Record these for comparison with Cloud Run:

| Metric | Local | Cloud Run (target) |
|--------|-------|-------------------|
| Cold start | ~2s | ~5s |
| API response | <100ms | <200ms |
| Agent execution | ~3-5s | ~3-5s |
| Memory usage | ~500Mi | 512Mi-1Gi |

---

## 🛑 Stop Services

```bash
# Graceful shutdown
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v

# Remove images (free space)
docker-compose down --rmi all
```

---

## 📝 Checklist Before Cloud Run

- [ ] All services start without errors
- [ ] Health checks pass (all return 200 OK)
- [ ] Frontend loads and displays correctly
- [ ] Agent execution completes successfully
- [ ] Logs show no critical errors
- [ ] API responses are fast (<200ms)

**Once all checked**, you're ready to deploy! 🚀

---

## 🔜 After Local Testing

1. **Stop local services**: `docker-compose down`
2. **Setup Cloud Run secrets**: `./infrastructure/cloud-run/setup-secrets.sh`
3. **Build & push images**: `./infrastructure/cloud-run/build-and-push.sh`
4. **Deploy**: `./infrastructure/cloud-run/deploy-from-registry.sh`

---

**Happy Testing! 🧪**
