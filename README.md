[🇰🇷 한국어 문서](README_KR.md)

# 🎨 AI Style Studio

> Neural Style Transfer Learning & Experience Platform

AI Style Studio is a web application for learning and hands-on experimentation with Neural Style Transfer. It supports both Gatys-method optimization-based style transfer and real-time Fast Style Transfer using pre-trained models.

---

## ✨ Key Features

### 🖼️ Gatys Style Transfer
- Upload content/style images → Style transfer via VGG19-based optimization
- Adjust Content Weight, Style Weight, Steps, Learning Rate
- Real-time progress and intermediate preview via SSE
- Original / Style / Result 3-panel comparison view

### ⚡ Fast Style Transfer (Real-time)
- Instant style application using pre-trained SavedModel (< 1 sec)
- 6 style presets: Starry Night, The Scream, Mosaic, Candy, Udnie, Rain Princess
- **Live webcam transfer** — 5~10 FPS (320×240, CPU)

### 📊 Learning Dashboard
- VGG19 CNN interactive structure visualization
- Per-layer feature map heatmaps
- Gram Matrix comparison view
- Real-time Content/Style/Total Loss charts

### 🖼️ Gallery
- Auto-save and browse transfer results
- Sort/filter, detail modal, download/delete

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Backend** | Flask 3+ · Ariadne GraphQL · SSE |
| **Frontend** | Angular 17 (Standalone) · Webpack 5 · Angular Material |
| **ML** | Tensorflow 2.15+ (CPU · SavedModel) |
| **Image Processing** | Pillow (PIL) 11+ |
| **State Management** | Angular Signals |
| **Auth** | OAuth2 |
| **Deployment** | Docker Compose (Backend) · Netlify (Frontend) · GitHub Actions CI/CD |

---

## 📁 Project Structure

```
ai-style-studio/
├── docker-compose.yml
├── backend/
│   ├── main.py                  # Flask & GraphQL entry point
│   ├── config.py                # Configuration
│   ├── schema.graphql           # GraphQL schema
│   ├── api/                     # Endpoints (style_transfer, webcam, gallery, learn)
│   ├── services/                # Business logic (gatys, fast, task_manager)
│   ├── models/                  # Pre-trained models (SavedModel)
│   ├── presets/                 # Preset style images (6 types)
│   └── storage/                 # Runtime files (uploads, results, previews)
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/            # Singleton services (API, SSE)
│       │   ├── features/        # Feature modules (style-transfer, webcam, gallery)
│       │   └── shared/          # Shared UI components
│       ├── assets/
│       └── styles.scss
│
└── docs/                        # PRD, setup guide, student guide
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- Docker & Docker Compose

### Run Backend

```bash
# Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download pre-trained models
bash download_models.sh

# Start server
python main.py
```

### Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Docker Compose (Full Stack)

```bash
docker-compose up --build
```

---

## 📡 API

### GraphQL
```
POST http://localhost:8000/graphql
```

**Key Queries/Mutations:**
- `getModels` — List pre-trained models
- `getGallery(page, limit)` — Query gallery
- `startGatysTransfer(input)` — Start Gatys transfer → returns taskId
- `processWebcamFrame(image, modelId)` — Process webcam frame

### SSE
- `GET /api/style-transfer/gatys/{task_id}/status` — Gatys progress streaming
- `GET /sse/webcam` — Webcam real-time events

---

## ⚡ Performance Targets

| Item | Target |
|------|--------|
| Gatys transform (400px, 300 steps) | 5~10 min (CPU) |
| Fast Style Transfer | < 1 sec |
| Webcam real-time transfer | 5~10 FPS (320×240) |
| SSE latency | < 200ms |
| Frontend initial load | < 3 sec |

---

## 🗺️ Roadmap

- [x] **M0** — Project initialization
- [ ] **M1** — Backend core (Gatys/Fast Style Transfer, GraphQL, SSE)
- [ ] **M2** — Frontend core (Style transfer UI, Webcam real-time UI)
- [ ] **M3** — Learning Dashboard + Gallery
- [ ] **M4** — Integration, optimization & deployment

> See [MILESTONE.md](./MILESTONE.md) and [GitHub Milestones](https://github.com/yuuuuuh-14/ai-style-studio/milestones) for details

---

## 📄 Documentation

- [PRD.md](./PRD.md) / [PRD_EN.md](./PRD_EN.md) — Product Requirements Document
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) / [PROJECT_PLAN_EN.md](./PROJECT_PLAN_EN.md) — Development Plan
- [MILESTONE.md](./MILESTONE.md) / [MILESTONE_EN.md](./MILESTONE_EN.md) — Milestones & Issues

---

## 🏗️ Runtime Constraints

- **CPU-only** (no GPU)
- Max image size: **400px**
- Concurrent Gatys tasks: **1**
- Webcam resolution: **320×240**

---

## 📜 License

This project is licensed under the [GNU Lesser General Public License v3.0](./LICENSE).