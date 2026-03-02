# Media Assets

**Purpose**: Store media assets for AgenticDID Real Protocol documentation and marketing

---

## 📁 Directory Structure

```
media/
├── images/           ← General images
├── screenshots/      ← UI screenshots, demos
├── diagrams/         ← Architecture diagrams, flowcharts
└── videos/           ← Demo videos (NOT tracked in git)
```

---

## 📝 Git Tracking Policy

### ✅ TRACKED (Committed to Git)

**Images** - All common image formats:
- `.png` - Screenshots, diagrams
- `.jpg/.jpeg` - Photos, graphics
- `.gif` - Animations, demos
- `.svg` - Vector graphics, logos
- `.webp` - Modern web images
- `.ico` - Favicons

**Purpose**: Small files suitable for version control

### ❌ NOT TRACKED (Gitignored)

**Videos** - All video formats:
- `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, etc.
- Too large for git
- Use external hosting instead

**Design Files** (optional):
- `.psd` - Photoshop
- `.ai` - Illustrator
- `.sketch`, `.xd`, `.fig` - Design tools
- Comment out in `.gitignore` if needed

---

## 📂 Usage Guidelines

### For Images

**Screenshots**:
```bash
# Save to screenshots/
media/screenshots/api-gateway-health.png
media/screenshots/agent-execution-demo.png
```

**Diagrams**:
```bash
# Save architecture/flow diagrams
media/diagrams/system-architecture.png
media/diagrams/auth-flow.svg
```

**General Images**:
```bash
# Logos, graphics, photos
media/images/agenticdid-logo.svg
media/images/midnight-integration.png
```

### For Videos

**Storage**: Use external hosting (NOT git)
- YouTube
- Vimeo
- Google Drive
- AWS S3
- Cloudflare Stream

**Local Development**:
```bash
# Save locally but won't be committed
media/videos/demo.mp4  # Ignored by git
```

**Documentation Links**:
```markdown
<!-- Link to hosted video in docs -->
[Demo Video](https://youtube.com/watch?v=...)
```

---

## 🎨 Best Practices

### Image Optimization

**Before Committing**:
1. Optimize file size (use tools like TinyPNG, ImageOptim)
2. Use appropriate formats:
   - `.png` for screenshots, diagrams
   - `.jpg` for photos
   - `.svg` for logos, icons
   - `.webp` for web images (smaller)

**Recommended Sizes**:
- Screenshots: Max 1920x1080
- Diagrams: Export at 2x for retina
- Thumbnails: 300x300 or smaller
- Logos: SVG (scalable) or PNG (2x resolution)

### Naming Conventions

**Use descriptive, kebab-case names**:
```
✅ GOOD:
  api-gateway-architecture.png
  claude-integration-flow.svg
  phase1-completion-screenshot.png

❌ BAD:
  IMG_1234.png
  Screen Shot 2025-11-14.png
  diagram1.jpg
```

### File Organization

**Subdirectories** (as needed):
```
media/
├── images/
│   ├── logos/
│   ├── marketing/
│   └── misc/
├── screenshots/
│   ├── frontend/
│   ├── backend/
│   └── admin/
└── diagrams/
    ├── architecture/
    ├── flows/
    └── api/
```

---

## 📊 File Size Limits

**Recommended**:
- Individual image: < 1MB (ideally < 500KB)
- SVG files: < 100KB
- Total repo images: Keep reasonable (< 50MB)

**If larger**:
- Optimize/compress before committing
- Consider external hosting
- Use CDN for production assets

---

## 🔗 External Video Hosting

### Recommended Platforms

**For Demos**:
- **YouTube** - Free, public/unlisted
- **Vimeo** - Better quality, privacy options
- **Loom** - Quick screen recordings

**For Production**:
- **Cloudflare Stream** - CDN-backed, affordable
- **AWS S3 + CloudFront** - Scalable
- **Google Cloud Storage** - Cloud Run integration

### Linking Videos in Docs

```markdown
## Demo Video

Watch the full demo on YouTube:

[![AgenticDID Demo](media/screenshots/demo-thumbnail.png)](https://youtube.com/watch?v=YOUR_VIDEO_ID)

Or view directly: https://youtube.com/watch?v=YOUR_VIDEO_ID
```

---

## 🚀 Adding Media to Docs

### In Markdown

```markdown
<!-- Relative path from docs/ -->
![Architecture Diagram](../media/diagrams/system-architecture.png)

<!-- In README at root -->
![Logo](./media/images/agenticdid-logo.svg)
```

### In Code/HTML

```html
<!-- Public URL after deployment -->
<img src="/media/images/logo.svg" alt="AgenticDID" />
```

---

## 📝 Examples

### Architecture Diagrams

Future additions:
- System architecture overview
- Data flow diagrams
- Service interaction maps
- Deployment architecture

### Screenshots

Future additions:
- API Gateway health check
- Agent execution demo
- Frontend UI screenshots
- Admin dashboard

### Marketing Images

Future additions:
- Logo variations
- Social media graphics
- Presentation slides
- Hackathon materials

---

## ⚠️ Important Notes

**Security**:
- ❌ Never commit sensitive data in images
- ❌ No API keys, passwords, or credentials visible
- ❌ Redact private information from screenshots

**Copyright**:
- ✅ Only commit assets you have rights to
- ✅ Credit third-party images if required
- ✅ Use Creative Commons or custom graphics

**Git LFS** (if needed):
```bash
# For very large files (not recommended for most cases)
git lfs track "*.psd"
git lfs track "*.ai"
```

---

## 🛠️ Tools

**Image Optimization**:
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG optimization
- [Squoosh](https://squoosh.app/) - Modern image compression

**Screenshots**:
- macOS: Cmd+Shift+4
- Windows: Win+Shift+S
- Linux: Spectacle, Flameshot

**Diagrams**:
- [draw.io](https://draw.io) - Free diagrams
- [Excalidraw](https://excalidraw.com) - Sketchy diagrams
- [Mermaid](https://mermaid.js.org) - Code-based diagrams

---

**Last Updated**: Nov 14, 2025  
**Status**: Ready for media assets
