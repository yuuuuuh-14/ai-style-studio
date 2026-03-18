[🇰🇷 한국어 문서](MILESTONE.md)

# AI Style Studio — Milestones

## Milestone 0: Project Initialization
**Duration:** 1 day  
**Goal:** Build Go (Golang) based backend architecture, setup GraphQL (gqlgen), setup ML engine foundation

### Issues
- [x] **Repository initialization and basic documentation** — Create README.md, .gitignore, LICENSE, etc.
- [x] **Backend project structure creation** — Go module initialization and directory layout
- [x] **Backend**: High-performance architecture using Go (Golang) + gqlgen(GraphQL) + chi(Router)
- [x] **Frontend**: Modern web stack built with React Router v7 (Vite) + TypeScript + Tailwind CSS + Redux Toolkit
- [x] **Deployment**: Backend containerization via Docker Compose and Frontend deployment setup on Cloudflare Pages
- [x] **CI/CD Pipeline**: Established automated build and testing workflows via GitHub Actions
- [x] **Linting/Formatting**: Integrated code quality tools including Go fmt, ESLint, and Prettier

---

## Milestone 1: Backend Core Features (Go Migration)
**Duration:** 5 days  
**Goal:** Gatys/Fast Style Transfer, GraphQL API, SSE real-time communication

### Issues
- [x] **M0: Project Initialization (Phase 0)**
    - [x] Repository and documentation initialization
    - [x] Go backend project initialization
    - [x] React Router (Remix) frontend initialization (Node v22, Yarn PnP)
    - [x] CI/CD and Docker base setup
    - [x] **M0.1: Frontend Environment Setup (Vite + TS + Tailwind)**
        - [x] Advanced configuration of Vite bundler and build system
        - [x] Strict TypeScript type system and interface definitions
        - [x] High-precision design system using Tailwind CSS utilities
        - [x] Data flow design using Redux Toolkit & React Router v7 Loaders/Actions
        - [x] Technical specification synchronization and Cloudflare Pages deployment environment
- [x] **M1: Backend Core (Go/TensorFlow) (Phase 1)**
    - [x] chi router and gqlgen schema/resolver environment initialization
    - [x] High-performance utility for image upload/resize (`utils/image.go`)
    - [x] Core design for Async Task Manager & SSE streaming channels
    - [x] Deep learning kernel integration using TensorFlow Go bindings
    - [x] Inception-v3 based Gatys Style Transfer optimization loop implementation
    - [x] Fast Style Transfer service (SavedModel inference) and model caching logic
- [x] **Pre-trained Models and Presets Preparation** — Model arrangement guide via `MODEL_GUIDE.md` completed

---

## Milestone 2: Frontend Core Features (Vite/React Development)
**Duration:** 5 days  
**Goal:** Style transfer UI, webcam real-time interface, Tailwind CSS based modern design system

### Issues
- [x] **Frontend Architecture Stabilization** — Project structure based on Vite & React Router v7
- [x] **UI Routing & Layout Setup** — Routing for `app/routes/` and theme system integration (style-transfer, webcam, etc.)
- [x] **Core Services & State Management** — Advanced Redux Toolkit store and API async actions
- [x] **Shared Components Implementation** — Reusable UI elements (Spinner, Slider) using Tailwind CSS
- [x] **Style Transfer Control Page** — Integrated high-speed image uploader and hyperparameter control panel
- [x] **Real-time Progress Visualization** — SSE stream reception and data-binding UI
- [x] **Webcam Real-time Transfer Page** — getUserMedia API integration and frame transmission pipeline

---

## Milestone 3: Learning Dashboard + Gallery
**Duration:** 4 days  
**Goal:** CNN visualization features, gallery CRUD completion

### Issues
- [x] **CNN (Inception-v3) interactive visualization** — Layer diagrams and descriptions
- [x] Inception-v3 structure interactive visualization (SVG + React)
- [x] Layer-wise Feature Map extraction API and visualization UI
- [x] Gram Matrix comparison view (Style similarity analysis tool)
- [x] Real-time Loss change visualization chart (Recharts integration)
- [x] Gallery system implementation (Persistent storage and retrieval) — JSON/DB integration and grid layout

---

## Milestone 4: Integration, Optimization & Deployment
**Duration:** 3 days  
**Goal:** Full integration testing, performance optimization, production deployment

### Issues
- [x] **Backend ↔ Frontend integration testing** — End-to-end scenario verification
- [x] **Error handling strategy implementation** — Reconnection logic and user guide improvements
- [x] **Documentation synchronization** — Updated PRD, Plan, and README with Go/Vite info
- [x] **Final deployment and optimization** — Docker production build and Cloudflare Pages deployment
