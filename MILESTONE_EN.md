[🇰🇷 한국어 문서](MILESTONE.md)

# AI Style Studio — Milestones

## Milestone 0: Project Initialization
**Duration:** 1 day  
**Goal:** Project structure, development environment, CI/CD foundation

### Issues
1. **Repository initialization and basic documentation** — Create README.md, .gitignore, LICENSE, and other base files
2. **Backend project structure creation** — Flask boilerplate, requirements.txt, config.py, directory structure
3. **Frontend project structure creation** — Angular CLI Standalone + Webpack 5 setup
4. **Docker Compose basic setup** — Backend container configuration, docker-compose.yml
5. **CI/CD pipeline draft** — GitHub Actions workflow (lint, test, build)
6. **Linting/Formatting setup** — Backend (Black, Flake8), Frontend (ESLint, Prettier)

---

## Milestone 1: Backend Core Features
**Duration:** 5 days  
**Goal:** Gatys/Fast Style Transfer, GraphQL API, SSE real-time communication

### Issues
7. **Flask app entry point and Config setup** — main.py, config.py, CORS, file storage path configuration
8. **Ariadne GraphQL schema definition and server integration** — schema.graphql, Query/Mutation resolvers, /graphql endpoint
9. **Image upload/resize utility implementation** — image_processor.py (PNG/WEBP support, 400px resize, base64 encoding/decoding)
10. **VGG19-based Gatys Style Transfer implementation** — gatys_transfer.py, VGG19 loading, Gram Matrix computation, optimization loop
11. **Async Task Manager implementation** — task_manager.py, task creation/status query/cancellation, limit to 1 concurrent task
12. **SSE endpoint implementation** — Gatys progress (step/loss/preview), webcam event stream
13. **Fast Style Transfer service implementation** — fast_transfer.py, SavedModel loading, inference, model caching
14. **Pre-trained model research and download script** — Model research, download_models.sh script creation
15. **Preset style image preparation** — Collect and store 6 masterpiece images (starry_night, the_scream, etc.)
16. **File storage management** — uploads/results/previews directory management, gallery.json CRUD

---

## Milestone 2: Frontend Core Features
**Duration:** 5 days  
**Goal:** Style transfer UI, webcam real-time UI, Angular Material design system

### Issues
17. **Angular Standalone project setup** — app.config.ts, routing (Lazy Loading), Angular Material theme
18. **Core services implementation** — API Service (GraphQL Client), SSE Service, TS model interfaces
19. **Shared components implementation** — Loading Spinner, Image Compare Slider
20. **Style transfer page implementation** — Image Uploader (Drag & Drop), Parameter Panel, Style Store (Signal-based)
21. **Style transfer execution and result display** — SSE real-time progress, 3-panel comparison view, download
22. **Webcam real-time transfer page implementation** — getUserMedia stream capture, GraphQL frame send → SSE receive, side-by-side display
23. **Webcam style selection and snapshot** — Preset selection UI, keyboard shortcuts (1~6), snapshot capture/save

---

## Milestone 3: Learning Dashboard + Gallery
**Duration:** 4 days  
**Goal:** CNN visualization learning features, gallery CRUD

### Issues
24. **CNN (VGG19) interactive structure visualization** — Learn page, layer diagram, click-to-explain popup, Content/Style Layer highlight
25. **Feature map visualization API + UI** — POST /api/learn/feature-maps, per-layer heatmap display
26. **Gram Matrix comparison view API + UI** — POST /api/learn/gram-matrix, content/style comparison heatmap
27. **Real-time Loss chart** — Content/Style/Total Loss line chart, CSV download
28. **Gallery result saving feature** — Auto-save, gallery.json management, GalleryStore
29. **Gallery view UI** — Grid layout (responsive 2~4 columns), sort/filter (latest, by style type), detail modal
30. **Gallery download/delete** — Individual result download (original resolution), delete function

---

## Milestone 4: Integration, Optimization & Deployment
**Duration:** 3 days  
**Goal:** Full integration testing, performance optimization, production deployment

### Issues
31. **Backend ↔ Frontend integration testing** — End-to-end scenario verification (Gatys, Fast, webcam, gallery)
32. **Error handling strategy implementation** — PRD §13 based error handling (400/429/500 errors, SSE reconnect, etc.)
33. **Performance optimization** — Image resize optimization, Webpack bundle size optimization, Lazy Loading verification
34. **Docker Compose final configuration** — Backend production settings, environment variable management, health check
35. **Netlify deployment setup** — Frontend build/deploy pipeline, environment variables, redirect rules
36. **GitHub Actions CI/CD completion** — Test/build/deploy automation workflow
37. **OAuth2 authentication implementation** — User authentication/authorization management
38. **Documentation** — README.md, setup-guide.md, student-guide.md finalization
