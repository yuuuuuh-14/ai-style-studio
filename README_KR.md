[🌐 EN VERSION](README.md)

# 🎨 AI Style Studio

> Neural Style Transfer 학습 및 체험 플랫폼

AI Style Studio는 Neural Style Transfer의 원리를 학습하고 직접 체험할 수 있는 웹 애플리케이션입니다. Gatys 방식의 최적화 기반 스타일 변환과 사전학습 모델을 활용한 실시간 Fast Style Transfer를 모두 지원합니다.

---

## ✨ 주요 기능

### 🖼️ Gatys Style Transfer
- 콘텐츠/스타일 이미지 업로드 → VGG19 기반 최적화로 스타일 변환
- Content Weight, Style Weight, Steps, Learning Rate 조절
- SSE를 통한 실시간 진행률 및 중간 프리뷰 표시
- 원본 / 스타일 / 결과 3분할 비교 뷰

### ⚡ Fast Style Transfer (실시간)
- 사전학습 SavedModel을 활용한 즉시 스타일 적용 (< 1초)
- 6종 스타일 프리셋: Starry Night, The Scream, Mosaic, Candy, Udnie, Rain Princess
- **웹캠 실시간 변환** — 5~10 FPS (320×240, CPU)

### 📊 학습 대시보드
- VGG19 CNN 구조 인터랙티브 시각화
- 레이어별 특징 맵 히트맵
- Gram Matrix 비교 뷰
- Content/Style/Total Loss 변화 실시간 차트

### 🖼️ 갤러리
- 변환 결과물 자동 저장 및 조회
- 정렬/필터, 상세 모달, 다운로드/삭제

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| **Backend** | Flask 3+ · Ariadne GraphQL · SSE |
| **Frontend** | Angular 17 (Standalone) · Webpack 5 · Angular Material |
| **ML** | Tensorflow 2.15+ (CPU · SavedModel) |
| **영상 처리** | Pillow (PIL) 11+ |
| **상태 관리** | Angular Signals |
| **인증** | OAuth2 |
| **배포** | Docker Compose (Backend) · Netlify (Frontend) · GitHub Actions CI/CD |

---

## 📁 프로젝트 구조

```
ai-style-studio/
├── docker-compose.yml
├── backend/
│   ├── main.py                  # Flask & GraphQL 엔트리포인트
│   ├── config.py                # 설정
│   ├── schema.graphql           # GraphQL 스키마
│   ├── api/                     # 엔드포인트 (style_transfer, webcam, gallery, learn)
│   ├── services/                # 비즈니스 로직 (gatys, fast, task_manager)
│   ├── models/                  # 사전학습 모델 (SavedModel)
│   ├── presets/                 # 프리셋 스타일 이미지 (6종)
│   └── storage/                 # 런타임 파일 (uploads, results, previews)
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/            # 싱글톤 서비스 (API, SSE)
│       │   ├── features/        # 기능 모듈 (style-transfer, webcam, gallery)
│       │   └── shared/          # 공통 UI 컴포넌트
│       ├── assets/
│       └── styles.scss
│
└── docs/                        # PRD, 설치 가이드, 학생용 가이드
```

---

## 🚀 시작하기

### 사전 요구사항
- Python 3.8+
- Node.js 18+
- Docker & Docker Compose

### Backend 실행

```bash
# 가상 환경 생성 및 활성화
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 사전학습 모델 다운로드
bash download_models.sh

# 서버 실행
python main.py
```

### Frontend 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### Docker Compose (전체)

```bash
docker-compose up --build
```

---

## 📡 API

### GraphQL
```
POST http://localhost:8000/graphql
```

**주요 쿼리/뮤테이션:**
- `getModels` — 사전학습 모델 목록 조회
- `getGallery(page, limit)` — 갤러리 조회
- `startGatysTransfer(input)` — Gatys 변환 시작 → taskId 반환
- `processWebcamFrame(image, modelId)` — 웹캠 프레임 처리

### SSE
- `GET /api/style-transfer/gatys/{task_id}/status` — Gatys 진행률 스트리밍
- `GET /sse/webcam` — 웹캠 실시간 이벤트

---

## ⚡ 성능 목표

| 항목 | 목표 |
|------|------|
| Gatys 변환 (400px, 300step) | 5~10분 (CPU) |
| Fast Style Transfer | < 1초 |
| 웹캠 실시간 변환 | 5~10 FPS (320×240) |
| SSE 지연시간 | < 200ms |
| 프론트엔드 초기 로딩 | < 3초 |

---

## 🗺️ 로드맵

- [x] **M0** — 프로젝트 초기 설정
- [ ] **M1** — Backend 핵심 기능 (Gatys/Fast Style Transfer, GraphQL, SSE)
- [ ] **M2** — Frontend 핵심 기능 (스타일 변환 UI, 웹캠 실시간 UI)
- [ ] **M3** — 학습 대시보드 + 갤러리
- [ ] **M4** — 통합·최적화·배포

> 자세한 내용은 [MILESTONE.md](./MILESTONE.md) 및 [GitHub Milestones](https://github.com/yuuuuuh-14/ai-style-studio/milestones) 참조

---

## 📄 문서

- [PRD.md](./PRD.md) — 제품 요구사항 정의서
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — 상세 개발 계획서
- [MILESTONE.md](./MILESTONE.md) — 마일스톤 및 이슈 목록

---

## 🏗️ 실행 환경 제약

- **CPU 환경만 지원** (GPU 미사용)
- 이미지 최대 크기: **400px**
- 동시 Gatys 변환 태스크: **1개**
- 웹캠 해상도: **320×240**

---

## 📜 License

This project is for educational purposes.
