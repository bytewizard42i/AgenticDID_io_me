# 🔮 AgenticDID.io - Demo Spin-Up Guide

**Welcome to Demoland!** This is a fully functional demo of AgenticDID.io running in Docker.

---

## 🚀 **Quick Start (30 seconds)**

### **Prerequisites**
- Docker and Docker Compose installed
- 4GB RAM available
- Ports 5173, 8787, and 6300 free

### **Start the Demo**

```bash
docker-compose up
```

That's it! Wait ~30 seconds for services to start.

---

## 🌐 **Access the Demo**

Once running, visit:

- **Frontend (Web App)**: http://localhost:5173
- **Backend API**: http://localhost:8787
- **Proof Server**: http://localhost:6300

---

## 📦 **What's Included**

This demo includes:

✅ **Frontend** - React + Vite web interface  
✅ **Backend** - Verifier API (port 8787)  
✅ **Midnight Proof Server** - ZK proof generation (v3.0.7)

All services run in isolated Docker containers.

---

## 🎯 **What You Can Do**

### **1. Create a Self-Sovereign DID**
- No KYC required
- No permission needed
- Full control from the start

### **2. Explore Trust Tiers**
- See progressive trust system (Tier 0→4)
- Understand inclusive AND compliant approach

### **3. Test Agent Authorization**
- Delegate credentials to AI agents
- See zero-knowledge proofs in action

### **4. Browse Use Cases**
- Banking, shopping, healthcare scenarios
- Privacy-preserved credential verification

---

## 🛠️ **Commands**

### **Start**
```bash
docker-compose up
```

### **Start in Background**
```bash
docker-compose up -d
```

### **View Logs**
```bash
docker-compose logs -f
```

### **Stop**
```bash
docker-compose down
```

### **Rebuild (if needed)**
```bash
docker-compose up --build
```

---

## 🔍 **Verify Services**

Check that all services are healthy:

```bash
# Check frontend
curl http://localhost:5173

# Check backend API
curl http://localhost:8787/health

# Check proof server
curl http://localhost:6300
```

Expected responses:
- Frontend: HTML page
- Backend: `{"status":"ok"}`
- Proof Server: "We're alive 🎉!"

---

## 🐛 **Troubleshooting**

### **Port Already in Use**
If you see "port already allocated":
```bash
# Find process using port
lsof -i :5173
lsof -i :8787
lsof -i :6300

# Kill the process or change ports in docker-compose.yml
```

### **Services Not Starting**
```bash
# View detailed logs
docker-compose logs

# Restart fresh
docker-compose down
docker-compose up --build
```

### **Proof Server Issues**
The proof server uses v3.0.7 for CPU compatibility. If you have a newer CPU with AVX-512 support, you can use v4.0.0:
```yaml
# In docker-compose.yml, change:
image: "midnightnetwork/proof-server:4.0.0"
```

### **Bun Installation Issues**
If the container fails to build:
```bash
# Clear Docker cache and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

---

## 📊 **Performance**

**Typical startup time**: 20-30 seconds  
**Memory usage**: ~2GB total  
**CPU usage**: Low (idle)

---

## 🎓 **Learning Resources**

Want to understand what's happening under the hood?

- **Architecture**: See `/docs/` folder
- **DID Spec**: See `packages/did-protocol/`
- **Frontend Code**: See `apps/web/`
- **Backend Code**: See `apps/verifier-api/`

---

## 🔐 **Security Note**

This is a **demo environment** running in "undeployed" mode:
- Not connected to live blockchain
- Proofs are generated locally
- No real transactions occur

For production deployment, see the main README.

---

## 🆘 **Need Help?**

**Issues?** Open an issue on GitHub  
**Questions?** Contact johnny5i@proton.me  
**Feedback?** We'd love to hear it!

---

## 🎯 **Next Steps**

After exploring the demo:

1. **Read the Docs** - Understand the architecture
2. **Clone the Repo** - Build your own implementation
3. **Join the Community** - Help shape the future of agentic identity

---

**Built with 🔮 by EnterpriseZK Labs**  
**Powered by Midnight Network**

AgenticDID.io | The Identity Layer for Agentic Commerce
