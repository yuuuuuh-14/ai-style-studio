[🇰🇷 한국어 문서](PROJECT_PLAN.md)

# AI Style Studio — Project Plan

## 1. Project Overview

Build a web-based learning and experimentation platform based on **Neural Style Transfer**.
- Backend: Go (Golang) + gqlgen(GraphQL) + chi(Router) + TensorFlow Go
- Frontend: Remix (React Router v7) + React + Tailwind CSS + Redux + Vite
- Communication: Real-time architecture based on GraphQL (gqlgen) and SSE (Server-Sent Events)
- Deployment: Docker Compose (Backend), Cloudflare Pages (Frontend), CI/CD

---

## 2. Technology Stack

| Category | Technology | Version / Notes |
|----------|-----------|-----------------|
| Backend Framework | Go (Golang) | 1.21+ |
| API | gqlgen (GraphQL) | 0.17+ |
| Router | chi | 5.0+ |
| Frontend Framework | Remix (React Router v7) | TypeScript |
| Bundler | Vite | 6+ |
| State Management | Redux Toolkit | - |
| UI Library | Tailwind CSS | - |
| Package Manager | Yarn Berry | PnP |
| Communication | GraphQL, SSE | - |
| Authentication | OAuth2 | - |
| Container | Docker Compose | Backend |
| CI/CD | GitHub Actions | F+B |
| Frontend Deployment | Cloudflare Pages | - |

---

## 3. Development Phases & Timeline

### Phase 0: Project Initialization (1 day)
- [x] Repository initialization, README, .gitignore
- [x] Backend project structure (Go module)
- [x] Frontend project structure (Remix + Vite + Yarn Berry PnP)
- [x] Docker Compose basic setup (Draft)
- [x] CI/CD pipeline draft (GitHub Actions)
- [x] Linting / Formatting setup (Go fmt, ESLint, Prettier)

### Phase 1: Backend Core (Go Migration) (5 days)
- [x] Go project initialization and chi router setup
- [x] gqlgen based schema definition & resolver skeleton
- [x] Image upload/resize utility (`utils/image.go`)
- [ ] Inception-v3 based Gatys Style Transfer implementation (Go Native)
- [x] Async Task Manager implementation (`ml/task_manager.go`)
- [x] SSE endpoints (progress streaming channels)
- [ ] Fast Style Transfer service implementation (SavedModel inference)
- [ ] Pre-trained models and presets preparation (6 masterpieces)
- [ ] File storage management (uploads/ results/ previews/)

### Phase 2: Frontend Core (5 days)
- [ ] Remix structure and Tailwind CSS configuration
- [ ] Redux Toolkit store configuration and Slice definition
- [ ] Data Flow: Remix Loaders (Fetch) & Actions (Mutation) integration
- [ ] Routing setup (`app/routes/` based: style-transfer, webcam, learn, gallery)
- [ ] Core services: GraphQL client, SSE event handling
- [ ] Shared components: Tailwind based components
- [ ] **Style Transfer page** (`/style-transfer`)
  - Image Uploader (Tailwind UI)
  - Parameter Panel (Redux integrated)
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
  - CNN (Inception-v3) structure interactive visualization
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
- [ ] Cloudflare Pages deployment configuration (Frontend)
- [ ] GitHub Actions CI/CD completion
- [ ] OAuth2 authentication implementation
- [ ] Documentation: README.md / setup-guide.md / student-guide.md

---

## 4. Directory Structure

Follows the structure defined in PRD §5.

```
ai-style-studio/
├── backend/
│   ├── server.go                # chi & gqlgen entry point
│   ├── graph/                   # GraphQL schema & resolvers
│   ├── ml/                      # ML Engine (TensorFlow Go)
│   ├── utils/                   # Image utilities
│   ├── models/                  # SavedModels
│   └── storage/                 # Runtime uploads/results
│
├── frontend/
│   ├── app/                     # Remix app source
│   ├── vite.config.js           # Vite configuration
│   └── package.json
```

---

## 5. API Design Summary

### GraphQL (Ariadne)
- `Query.getModels` — List pre-trained models
- `Query.getGallery(page, limit)` — Gallery query
- `Query.getInceptionInfo` — Inception-v3 information
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
