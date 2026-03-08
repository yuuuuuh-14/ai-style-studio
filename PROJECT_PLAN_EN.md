[🇰🇷 한국어 문서](PROJECT_PLAN.md)

# AI Style Studio — Project Plan

## 1. Project Overview

Build a web-based learning and experimentation platform based on **Neural Style Transfer**.
- Backend: Flask + Ariadne GraphQL + SSE + Tensorflow (CPU)
- Frontend: Angular 17 + Webpack 5 + Angular Material + Angular Signals
- Deployment: Docker Compose (Backend), Netlify (Frontend), CI/CD

---

## 2. Technology Stack

| Category | Technology | Version / Notes |
|----------|-----------|-----------------|
| Backend Framework | Flask | 3+ |
| API | Ariadne GraphQL | 0.23+ |
| Frontend Framework | Angular (Standalone) | 17 (fixed) |
| Bundler | Webpack | 5+ |
| ML | Tensorflow | 2.15+ (CPU, SavedModel) |
| Image Processing | Pillow (PIL) | 11+ |
| State Management | Angular Signals | built-in |
| UI Library | Angular Material | built-in |
| Communication | GraphQL, SSE | - |
| Authentication | OAuth2 | - |
| Container | Docker Compose | Backend |
| CI/CD | GitHub Actions | F+B |
| Frontend Deployment | Netlify | - |

---

## 3. Development Phases & Timeline

### Phase 0: Project Initialization (1 day)
- [ ] Repository initialization, README, .gitignore
- [ ] Backend project structure (Flask boilerplate)
- [ ] Frontend project structure (Angular CLI + Webpack)
- [ ] Docker Compose basic setup
- [ ] CI/CD pipeline draft (GitHub Actions)
- [ ] Linting / Formatting setup (Black, Flake8, ESLint, Prettier)

### Phase 1: Backend Core (5 days)
- [ ] Flask app entry point + Config setup
- [ ] Ariadne GraphQL schema definition & server integration
- [ ] Image upload/resize utility (`image_processor.py`)
- [ ] VGG19-based Gatys Style Transfer service implementation
- [ ] Async Task Manager implementation (long-running Gatys transforms)
- [ ] SSE endpoints (progress, intermediate preview delivery)
- [ ] Fast Style Transfer service implementation (SavedModel load + inference)
- [ ] Pre-trained model research & download script
- [ ] Preset style images preparation (6 masterpieces)
- [ ] File storage management (uploads/ results/ previews/)

### Phase 2: Frontend Core (5 days)
- [ ] Angular project Standalone structure setup
- [ ] Global styles + Angular Material theme configuration
- [ ] Routing setup (Lazy Loading: style-transfer, webcam, learn, gallery)
- [ ] Core services: API Service (GraphQL Client), SSE Service
- [ ] Shared components: Loading Spinner, Image Compare Slider
- [ ] **Style Transfer page** (`/style-transfer`)
  - Image Uploader (Drag & Drop)
  - Parameter Panel (sliders, hyperparameters)
  - Style Store (Signal-based state management)
  - Transform execution → SSE real-time progress display
  - Result 3-panel comparison view + download
- [ ] **Webcam Real-time Transfer page** (`/webcam`)
  - Webcam stream capture (getUserMedia)
  - GraphQL frame transmission → SSE receive pipeline
  - Style preset selection (keyboard shortcuts)
  - Snapshot capture/save

### Phase 3: Learning Dashboard + Gallery (4 days)
- [ ] **Learning Dashboard** (`/learn`)
  - CNN (VGG19) structure interactive visualization
  - Feature map heatmap visualization API + UI
  - Gram Matrix comparison view API + UI
  - Real-time Loss chart (Content/Style/Total)
- [ ] **Gallery** (`/gallery`)
  - Auto-save results (gallery.json)
  - Grid layout (responsive 2~4 columns)
  - Sort/filter (latest, by style type)
  - Detail modal + download/delete

### Phase 4: Integration, Optimization & Deployment (3 days)
- [ ] Backend ↔ Frontend integration testing
- [ ] Error handling strategy implementation (based on PRD §13)
- [ ] Performance optimization (image resize, Webpack bundle optimization)
- [ ] Docker Compose final configuration (Backend)
- [ ] Netlify deployment setup (Frontend)
- [ ] GitHub Actions CI/CD completion
- [ ] OAuth2 authentication implementation
- [ ] Documentation: README.md / setup-guide.md / student-guide.md

---

## 4. Directory Structure

Follows the structure defined in PRD §5.

```
ai-style-studio/
├── docker-compose.yml
├── README.md
├── PROJECT_PLAN.md
├── MILESTONE.md
├── PRD.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   ├── schema.graphql
│   ├── api/
│   ├── services/
│   ├── models/           # Pre-trained models (SavedModel)
│   ├── presets/           # Preset style images (6 types)
│   └── storage/
│
├── frontend/
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── core/
│       │   ├── features/
│       │   └── shared/
│       ├── assets/
│       └── styles.scss
│
└── docs/
```

---

## 5. API Design Summary

### GraphQL (Ariadne)
- `Query.getModels` — List pre-trained models
- `Query.getGallery(page, limit)` — Gallery query
- `Query.getVggInfo` — VGG19 information
- `Mutation.startGatysTransfer(input)` — Start Gatys transfer → return taskId
- `Mutation.processWebcamFrame(image, modelId)` — Process webcam frame

### SSE
- `/sse/webcam` — Webcam real-time style transfer
- `/api/style-transfer/gatys/{task_id}/status` — Gatys progress streaming

---

## 6. Performance Targets

| Item | Target |
|------|--------|
| Gatys transform (400px, 300 steps) | 5~10 min (CPU) |
| Fast Style Transfer (single image) | < 1 sec |
| Webcam real-time transform | 5~10 FPS (320×240) |
| SSE latency | < 200ms |
| Frontend initial load | < 3 sec |
| Concurrent Gatys tasks | 1 |

---

## 7. Error Handling Strategy

| Scenario | Handling |
|----------|----------|
| Unsupported image format | 400 + supported format info |
| Image size exceeds 10MB | 400 + auto-resize suggestion |
| Out of memory during transform | SSE error event + size reduction guide |
| SSE connection lost | Auto-reconnect (max 3 attempts, exponential backoff) |
| Model file missing | 500 + download_models.sh guide |
| Concurrent transform request | 429 + "retry after completion" message |
| Webcam permission denied | Permission request guide on frontend |

---

## 8. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Excessive Gatys transform time on CPU | UX degradation | Image size limit (400px), step limit (500), intermediate previews |
| Large pre-trained model file sizes | Storage burden | Git LFS or separate download script |
| Tensorflow CPU memory issues | Server crash | Limit to 1 concurrent task + memory monitoring |
| Webcam browser compatibility | Some users unable to use | Provide supported browser guide |
