[🌐 EN VERSION](PROJECT_PLAN_EN.md)

# AI Style Studio — 개발 계획서 (PROJECT PLAN)

## 1. 프로젝트 개요

**Neural Style Transfer** 기반 학습·체험 웹 플랫폼을 구축한다.
- Backend: Flask + Ariadne GraphQL + SSE + Tensorflow(CPU)
- Frontend: Angular 17 + Webpack 5 + Angular Material + Angular Signals
- 배포: Docker Compose(Backend), Netlify(Frontend), CI/CD

---

## 2. 기술 스택 상세

| 구분 | 기술 | 버전 / 비고 |
|------|------|-------------|
| Backend Framework | Flask | 3+ |
| API | Ariadne GraphQL | 0.23+ |
| Frontend Framework | Angular (Standalone) | 17 (고정) |
| Bundler | Webpack | 5+ |
| ML | Tensorflow | 2.15+ (CPU, SavedModel) |
| Image Processing | Pillow (PIL) | 11+ |
| State Management | Angular Signals | built-in |
| UI Library | Angular Material | built-in |
| 통신 | GraphQL, SSE | - |
| 인증 | OAuth2 | - |
| 컨테이너 | Docker Compose | Backend |
| CI/CD | GitHub Actions | F+B |
| Frontend 배포 | Netlify | - |

---

## 3. 개발 페이즈 및 일정

### Phase 0: 프로젝트 초기 설정 (1일)
- [ ] 저장소 초기화, README, .gitignore
- [ ] Backend 프로젝트 구조 생성 (Flask boilerplate)
- [ ] Frontend 프로젝트 구조 생성 (Angular CLI + Webpack)
- [ ] Docker Compose 기본 세팅
- [ ] CI/CD 파이프라인 초안 (GitHub Actions)
- [ ] Linting / Formatting 설정 (Black, Flake8, ESLint, Prettier)

### Phase 1: Backend 핵심 (5일)
- [ ] Flask 앱 엔트리포인트 + Config 세팅
- [ ] Ariadne GraphQL Schema 정의 및 서버 연동
- [ ] 이미지 업로드/리사이즈 유틸 (`image_processor.py`)
- [ ] VGG19 기반 Gatys Style Transfer 서비스 구현
- [ ] 비동기 Task Manager 구현 (Gatys 장시간 변환)
- [ ] SSE 엔드포인트 (진행률, 중간 결과 프리뷰 전송)
- [ ] Fast Style Transfer 서비스 구현 (SavedModel 로드 + 추론)
- [ ] 사전학습 모델 조사·다운로드 스크립트 작성
- [ ] 프리셋 스타일 이미지 준비 (6종 명화)
- [ ] 파일 스토리지 관리 (uploads/ results/ previews/)

### Phase 2: Frontend 핵심 (5일)
- [ ] Angular 프로젝트 Standalone 구조 세팅
- [ ] 글로벌 스타일 + Angular Material 테마 설정
- [ ] 라우팅 설정 (Lazy Loading: style-transfer, webcam, learn, gallery)
- [ ] Core 서비스: API Service (GraphQL Client), SSE Service
- [ ] Shared 컴포넌트: Loading Spinner, Image Compare Slider
- [ ] **스타일 변환 페이지** (`/style-transfer`)
  - Image Uploader (Drag & Drop)
  - Parameter Panel (슬라이더, 하이퍼파라미터)
  - Style Store (Signal 기반 상태 관리)
  - 변환 실행 → SSE 실시간 진행률 표시
  - 결과 3분할 비교 뷰 + 다운로드
- [ ] **웹캠 실시간 변환 페이지** (`/webcam`)
  - 웹캠 스트림 캡처 (getUserMedia)
  - GraphQL 프레임 전송 → SSE 수신 파이프라인
  - 스타일 프리셋 선택 (키보드 단축키)
  - 스냅샷 촬영/저장

### Phase 3: 학습 대시보드 + 갤러리 (4일)
- [ ] **학습 대시보드** (`/learn`)
  - CNN(VGG19) 구조 인터랙티브 시각화
  - 특징 맵 히트맵 시각화 API + UI
  - Gram Matrix 비교 뷰 API + UI
  - Loss 변화 실시간 차트 (Content/Style/Total)
- [ ] **갤러리** (`/gallery`)
  - 결과물 자동 저장 (gallery.json)
  - 그리드 레이아웃 (반응형 2~4열)
  - 정렬/필터 (최신순, 스타일 유형별)
  - 상세 모달 + 다운로드/삭제

### Phase 4: 통합·최적화·배포 (3일)
- [ ] Backend ↔ Frontend 통합 테스트
- [ ] 에러 처리 전략 적용 (PRD §13 기반)
- [ ] 성능 최적화 (이미지 리사이즈, Webpack 번들 최적화)
- [ ] Docker Compose 최종 설정 (Backend)
- [ ] Netlify 배포 설정 (Frontend)
- [ ] GitHub Actions CI/CD 완성
- [ ] OAuth2 인증 적용
- [ ] README.md / setup-guide.md / student-guide.md 작성

---

## 4. 디렉토리 구조

PRD §5에 정의된 구조를 그대로 따른다.

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
│   ├── models/           # 사전학습 모델 (SavedModel)
│   ├── presets/           # 프리셋 스타일 이미지 (6종)
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

## 5. API 설계 요약

### GraphQL (Ariadne)
- `Query.getModels` — 사전학습 모델 목록
- `Query.getGallery(page, limit)` — 갤러리 조회
- `Query.getVggInfo` — VGG19 정보
- `Mutation.startGatysTransfer(input)` — Gatys 변환 시작 → taskId 반환
- `Mutation.processWebcamFrame(image, modelId)` — 웹캠 프레임 처리

### SSE
- `/sse/webcam` — 웹캠 실시간 스타일 변환
- `/api/style-transfer/gatys/{task_id}/status` — Gatys 진행률 스트리밍

---

## 6. 성능 목표

| 항목 | 목표 |
|------|------|
| Gatys 변환 (400px, 300step) | 5~10분 (CPU) |
| Fast Style Transfer (단일 이미지) | < 1초 |
| 웹캠 실시간 변환 | 5~10 FPS (320×240) |
| SSE 지연시간 | < 200ms |
| 프론트엔드 초기 로딩 | < 3초 |
| 동시 Gatys 변환 태스크 | 1개 |

---

## 7. 에러 처리 전략

| 상황 | 처리 |
|------|------|
| 이미지 포맷 미지원 | 400 + 지원 포맷 안내 |
| 이미지 크기 초과 (10MB) | 400 + 자동 리사이즈 제안 |
| 변환 중 메모리 부족 | SSE error event + 크기 축소 가이드 |
| SSE 연결 끊김 | 자동 재연결 (최대 3회, 지수 백오프) |
| 모델 파일 누락 | 500 + download_models.sh 안내 |
| 동시 변환 요청 | 429 + 재시도 안내 |
| 웹캠 권한 거부 | 프론트 권한 요청 가이드 |

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 방안 |
|--------|------|-----------|
| CPU 환경에서 Gatys 변환 시간 과다 | UX 저하 | 이미지 크기 제한(400px), Step 제한(500), 중간 프리뷰로 보완 |
| 사전학습 모델 크기가 커서 배포 부담 | 저장소 용량 | Git LFS 사용 또는 별도 다운로드 스크립트 |
| Tensorflow CPU 메모리 이슈 | 서버 크래시 | 동시 1개 태스크 제한 + 메모리 모니터링 |
| 웹캠 브라우저 호환성 | 일부 사용자 사용 불가 | Supported Browser 가이드 제공 |
