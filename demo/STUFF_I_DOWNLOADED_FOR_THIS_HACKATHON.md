# 🛠️ Stuff I Downloaded for This Hackathon

**Installation Date**: November 7, 2025  
**Environment**: WSL2 (Windows Subsystem for Linux) on Ubuntu 24.04  
**Hackathon**: Google Cloud Run Hackathon

---

## 📊 Quick Summary

### **Already Installed** ✅
- ✅ Bun v1.3.1 (JavaScript runtime)
- ✅ Git v2.43.0 (version control)
- ✅ Docker v28.2.2 (containers)
- ✅ Google Cloud SDK v546.0.0 (deployment)
- ✅ DaVinci Resolve 19 (Windows side - video editing)

### **Will Download When Running `bun install`**
- ~20 direct npm packages
- ~300-500 total packages (including dependencies)
- ~150-200 MB total size

### **May Install Later** (As Needed)
- Google ADK (for "Best of AI Agents" prize)
- OBS Studio or screen recorder (for demo video)
- ScreenToGif (for social media posts)

### **Web Services** (No Installation)
- Google Cloud Console
- AI Studio
- Devpost
- Social media platforms

---

## ✅ Core Development Tools Installed

### **Bun** - Fast JavaScript Runtime
- **Version**: v1.3.1
- **Location**: `/home/js/.bun/bin/bun`
- **Installation**: Already installed (fast JavaScript runtime, replaces Node.js)
- **Purpose**: Running and building TypeScript/JavaScript applications
- **Website**: https://bun.sh/

### **Git** - Version Control
- **Version**: v2.43.0
- **Location**: `/usr/bin/git`
- **Installation**: Already installed (system package)
- **Purpose**: Version control and code management
- **Website**: https://git-scm.com/

### **Docker** - Container Platform
- **Version**: v28.2.2
- **Location**: `/usr/bin/docker`
- **Installation Command**: `sudo apt install -y docker.io`
- **Post-Install**: Added user to docker group with `sudo usermod -aG docker js`
- **Purpose**: Containerization for development and deployment
- **Website**: https://www.docker.com/
- **Note**: Requires Docker Desktop for Windows or systemd enabled in WSL2 to run daemon

---

## ☁️ Google Cloud Tools Installed

### **Google Cloud SDK** - Complete Cloud Platform CLI
- **Version**: v546.0.0
- **Installation Method**: Official installer script
- **Installation Command**: 
  ```bash
  curl https://sdk.cloud.google.com | bash
  ```
- **Location**: `~/google-cloud-sdk/`
- **Path Update**: Added to `~/.bashrc`
- **Purpose**: Deploy to Google Cloud Run, manage cloud resources

### **Components Included**:
1. **gcloud CLI** (v546.0.0) - Main command-line tool
2. **bq** (v2.1.25) - BigQuery command-line tool
3. **gsutil** (v5.35) - Cloud Storage command-line tool
4. **Bundled Python** (v3.13.7) - Python runtime for SDK

---

## 🎬 Video Production Tools Installed

### **DaVinci Resolve 19** - Professional Video Editor
- **Version**: 19 (Free version)
- **Installation Location**: Windows side (not WSL)
- **Installation Date**: November 7, 2025
- **Installation Method**: Downloaded from https://www.blackmagicdesign.com/products/davinciresolve
- **Size**: ~3-4 GB download, ~30 GB installed
- **Purpose**: Create and edit the required 3-minute hackathon demo video
- **Website**: https://www.blackmagicdesign.com/products/davinciresolve

**Features We'll Use**:
- Screen recording editing
- Adding titles and transitions
- Color grading and correction
- Audio mixing and enhancement
- Professional export settings (1080p H.264)
- Timeline editing for the demo script

**Why DaVinci Resolve**:
- Industry-standard professional video editor
- Free version has all features needed for the demo
- Superior color grading capabilities
- Better performance than OBS for editing
- Export directly to YouTube-ready formats

---

## 📋 Installation Summary

| Tool | Version | Size | Installation Method | Location | Status |
|------|---------|------|---------------------|----------|--------|
| Bun | 1.3.1 | - | Pre-installed | WSL2 | ✅ Ready |
| Git | 2.43.0 | - | Pre-installed | WSL2 | ✅ Ready |
| Docker | 28.2.2 | ~77 MB | apt package | WSL2 | ✅ Installed |
| Google Cloud SDK | 546.0.0 | ~500 MB | Official installer | WSL2 | ✅ Installed |
| DaVinci Resolve | 19 | ~3-4 GB | Official installer | Windows | ✅ Installed |

**Total Downloaded (System Tools)**: ~4,077-4,577 MB (~4-4.5 GB)  
**Total Project Dependencies** (when running `bun install`): ~150-200 MB  
**Grand Total**: ~4.2-4.7 GB

---

## 🔧 Configuration Changes Made

### **1. Docker Group Membership**
```bash
sudo usermod -aG docker js
```
- Allows running Docker commands without sudo
- Requires logout/login or `newgrp docker` to take effect

### **2. Bash Profile Update**
The Google Cloud SDK installer modified `~/.bashrc` to add:
- Google Cloud SDK to PATH
- Shell command completion for gcloud
- Backup created at `~/.bashrc.backup`

---

## 📦 Project Dependencies (Downloaded via `bun install`)

These npm packages will be downloaded when running `bun install` in the project:

### **Root Workspace Dependencies**
- **concurrently** (^8.2.2) - Run multiple dev servers simultaneously
- **eslint** (^8.57.0) - JavaScript/TypeScript linter
- **prettier** (^3.2.5) - Code formatter
- **typescript** (^5.3.3) - TypeScript compiler

### **Frontend (React Web App) Dependencies**

#### Production Dependencies:
- **react** (^18.2.0) - React UI library
- **react-dom** (^18.2.0) - React DOM rendering
- **lucide-react** (^0.315.0) - Icon library
- **@agenticdid/sdk** (workspace) - Core AgenticDID protocol

#### Development Dependencies:
- **@types/react** (^18.2.48) - React type definitions
- **@types/react-dom** (^18.2.18) - React DOM type definitions
- **@vitejs/plugin-react** (^4.2.1) - Vite React plugin
- **autoprefixer** (^10.4.17) - CSS autoprefixer
- **postcss** (^8.4.33) - CSS transformer
- **tailwindcss** (^3.4.1) - Utility-first CSS framework
- **vite** (^5.0.12) - Fast build tool and dev server

### **Backend (Verifier API) Dependencies**

#### Production Dependencies:
- **@agenticdid/sdk** (workspace) - Core AgenticDID protocol
- **@agenticdid/midnight-adapter** (workspace) - Midnight Network adapter
- **fastify** (^4.26.0) - Fast web framework
- **@fastify/cors** (^9.0.1) - CORS plugin for Fastify
- **jsonwebtoken** (^9.0.2) - JWT token generation/verification
- **dotenv** (^16.4.1) - Environment variable loader
- **pino** (^8.18.0) - Fast logger
- **pino-pretty** (^10.3.1) - Pretty logger formatter

#### Development Dependencies:
- **@types/node** (^20.11.5) - Node.js type definitions
- **@types/jsonwebtoken** (^9.0.5) - JWT type definitions

### **Estimated Total Dependencies**
- **Direct dependencies**: ~20 packages
- **Including transitive dependencies**: ~300-500 packages
- **Total size on disk**: ~150-200 MB (in node_modules)

### **How to Download Project Dependencies**

From the project root directory:
```bash
cd /home/js/AgenticDID_CloudRun/agentic-did
bun install
```

This command will:
1. Read `package.json` files from all workspaces
2. Download all dependencies from npm registry
3. Install them in `node_modules/` directories
4. Create or update `bun.lock` file
5. Set up workspace symlinks for local packages

**First-time installation**: Takes ~30-60 seconds with fast internet  
**Re-installation** (with cache): Takes ~5-10 seconds

---

## 🔮 Midnight Network Tools (For Phase 2 - Post-Hackathon)

*Not required for Google Cloud Run Hackathon submission, but planned for future:*

- **@meshsdk/midnight-setup** - Midnight SDK setup
- **Lace Wallet** - Midnight Network wallet
- **Compact compiler** - Smart contract compiler

These will be installed during Phase 2 implementation.

---

## 🎨 Optional Tools (Recommended but not required)

### **VS Code** - Code Editor
- **Website**: https://code.visualstudio.com/
- **Status**: Not installed (but recommended)
- **Purpose**: IDE for development
- **Extensions that would be useful**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Docker
  - TypeScript and JavaScript Language Features

### **Google ADK** (Agent Development Kit)
- **Package**: `@google-cloud/agent-development-kit`
- **Status**: Not yet installed
- **Purpose**: Required for "Best of AI Agents" category prize
- **Will install**: When implementing ADK integration (Priority 5 in hackathon roadmap)
- **Documentation**: https://cloud.google.com/agent-development-kit/docs

### **Demo Video Tools**

#### Installed ✅
- **DaVinci Resolve 19** - Professional video editor (Windows side)
  - For editing the final 3-minute demo video
  - Professional-grade color grading and effects
  - High-quality export settings

#### Available for Screen Recording
- **Windows Game Bar** (Windows built-in: Win + G) - Quick screen recording
- **OBS Studio** - https://obsproject.com/ (free, if needed for advanced recording)
- **Loom** - https://www.loom.com/ (browser-based alternative)

### **GIF Creation Tools** (For Social Media - Bonus Points)
*For creating demo GIFs for social media posts (+0.4 points):*
- **ScreenToGif** - https://www.screentogif.com/ (Windows, free)
- **Peek** - https://github.com/phw/peek (Linux, free)
- **Gifox** - https://gifox.io/ (Mac, paid)

---

## ⚠️ Post-Installation Setup Required

### **Docker Daemon**
Docker is installed but needs a running daemon. Options:
1. **Install Docker Desktop for Windows** (Recommended)
   - Enable WSL2 integration in settings
2. **Enable systemd in WSL2**
   - Add to `/etc/wsl.conf`:
     ```ini
     [boot]
     systemd=true
     ```
   - Restart WSL: `wsl --shutdown` from PowerShell

### **Google Cloud SDK Initialization**
Run to configure authentication and project:
```bash
gcloud init
```

This will:
- Authenticate with Google account
- Set default project
- Configure default compute region/zone

---

## 🎯 Verification Commands

Test all installed tools:

```bash
# Core tools
bun --version        # Should show: 1.3.1
git --version        # Should show: git version 2.43.0
docker --version     # Should show: Docker version 28.2.2

# Google Cloud tools
gcloud --version     # Should show: Google Cloud SDK 546.0.0
bq --version         # Should show: 2.1.25
gsutil --version     # Should show: 5.35
```

---

## 📦 What These Tools Enable

### **For This Hackathon Project**:
1. **Bun** - Build and run the AgenticDID.io applications
2. **Git** - Version control and collaboration
3. **Docker** - Containerize applications for Cloud Run deployment
4. **gcloud CLI** - Deploy services to Google Cloud Run
5. **gsutil** - Upload static assets to Cloud Storage
6. **bq** - Query and analyze data in BigQuery (if needed)

---

## 🚀 Ready for Development

All tools are now installed and ready for:
- Local development and testing
- Building Docker containers
- Deploying to Google Cloud Run
- Managing cloud resources
- Version control and collaboration

**Next Steps**: 
1. Initialize gcloud: `gcloud init`
2. Set up Docker daemon (Docker Desktop or systemd)
3. Start developing!

---

## 🌐 Web-Based Services (No Installation Required)

These are cloud services accessed via browser:

### **For Development & Deployment**
- **Google Cloud Console** - https://console.cloud.google.com
  - Manage Cloud Run deployments
  - Monitor services
  - View logs and metrics
- **AI Studio** - https://aistudio.google.com
  - Design AI agents (required for "Best of AI Studio" category)
  - Create agent prompts
  - Test agent responses
  - Share agent links

### **For Hackathon Submission**
- **Devpost** - https://devpost.com/
  - Submit hackathon entry
  - Upload demo video
  - Share project links

### **For Bonus Points**
- **Medium** or **dev.to** - Blog post publishing (+0.4 points)
- **LinkedIn** - Social media post (+0.4 points)
- **Twitter/X** - Social media post (+0.4 points)
- **YouTube** or **Vimeo** - Demo video hosting

---

## 🔜 To Be Installed (When Implementing Specific Features)

### **When Deploying to Cloud Run** (Priority 1 - CRITICAL)
Already installed! ✅ gcloud CLI is ready.

Commands we'll run:
```bash
gcloud auth login
gcloud config set project YOUR-PROJECT-ID
gcloud run deploy agenticdid-frontend --source . --region us-central1
gcloud run deploy agenticdid-api --source . --region us-central1
```

### **When Implementing AI Studio Integration** (Priority 4)
- No additional downloads needed
- Will create agents in AI Studio web interface
- Will get shareable links for Devpost submission

### **When Implementing Google ADK** (Priority 5)
Will install:
```bash
npm install @google-cloud/agent-development-kit
```
- **Purpose**: Convert agents to use Google's Agent Development Kit
- **For**: "Best of AI Agents" category prize ($8,000)

### **For Demo Video Creation** (Priority 2 - REQUIRED)
✅ **Already Installed!** DaVinci Resolve 19

Recording options available:
- Windows Game Bar (Win + G) - Already available in Windows
- OBS Studio (if needed for advanced recording features)

### **For Social Media Posts** (Priority 7 - Bonus)
May install:
- ScreenToGif for Windows (free GIF creation tool)

---

## 📚 Documentation Links

- **Bun**: https://bun.sh/docs
- **Git**: https://git-scm.com/doc
- **Docker**: https://docs.docker.com/
- **Google Cloud SDK**: https://cloud.google.com/sdk/docs
- **Cloud Run**: https://cloud.google.com/run/docs
- **gcloud CLI**: https://cloud.google.com/sdk/gcloud

---

**Installation Performed By**: Penny (AI Assistant)  
**For**: John's AgenticDID.io Hackathon Project  
**Environment**: Penelope (ASUS ProArt Laptop - WSL2)
