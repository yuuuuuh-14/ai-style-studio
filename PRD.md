[🌐 EN VERSION](PRD_EN.md)

# PRD: Neural Style Transfer 웹 애플리케이션

## 1. 프로젝트 개요

### 1.1 프로젝트명
**AI Style Studio** — Neural Style Transfer 학습 및 체험 플랫폼

### 1.2 목적
AI 프로젝트 3번째 목표물로, Neural Style Transfer의 원리를 학습하고 직접 체험할 수 있는 웹 애플리케이션을 구축한다.

### 1.3 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| **Backend** | Flask | 3+ |
| **API** | Ariadne GraphQL | 0.23+ |
| **Frontend** | Angular + Webpack | Angular 17(고정) / Webpack 5+ |
| **ML Framework** | Tensorflow | 2.15+ (CPU, SavedModel 포맷 사용) |
| **영상 처리** | Pillow(PIL) | 11+ |
| **상태 관리** | Angular Signals | Angular built-in |
| **스타일링** | Angular Materials | Angular built-in |
| **통신** | GraphQL, SSE | - |
| **인증** | OAuth2 | - |
| **빌드/배포** | Docker Compose(Backend), CI/CD(F+B), Netlify(Frontend) | - |

### 1.4 실행 환경 제약
- **CPU 환경만 지원**
- GPU 미사용
- 개인 노트북 환경
- 웹캠 사용 가능
- 이미지 최대 크기: **400px** (CPU 성능 최적화)
- Python 3.8, Node.js 18

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Angular + Webpack)        │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐ │
│  │ 스타일    │ │ 실시간   │ │ 학습 대시보드     │ │
│  │ 변환 UI  │ │ 웹캠 UI  │ │ (이론/시각화)     │ │
│  └────┬─────┘ └────┬─────┘ └────────┬──────────┘ │
│       │            │                │             │
│       ▼            ▼                ▼             │
│  ┌─────────────────────────────────────────────┐  │
│  │         Angular Services(GraphQL Client)    |  |
|  |                + SSE Listener               │  │
│  └──────────────────┬──────────────────────────┘  │
└─────────────────────┼─────────────────────────────┘
                      │
               GraphQL / SSE
                      │
┌─────────────────────┼─────────────────────────────┐
│                     ▼         Backend (Flask)    │
│  ┌─────────────────────────────────────────────┐  │
│  │              API Router Layer                │  │
│  │  /style-transfer  /webcam  /gallery  /learn  │  │
│  └──────────────────┬──────────────────────────┘  │
│                     │                              │
│  ┌──────────┐ ┌─────┴─────┐ ┌──────────────────┐  │
│  │ Gatys    │ │ Fast      │ │ Gallery /         │  │
│  │ Style    │ │ Style     │ │ History           │  │
│  │ Transfer │ │ Transfer  │ │ Manager           │  │
│  │ (VGG19)  │ │ (OpenCV)  │ │                   │  │
│  └──────────┘ └───────────┘ └──────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │         Tensorflow (CPU) / Pillow(PIL)      │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │     File Storage (uploads/ results/ models/) │  │
│  └─────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 3. 기능 요구사항

### 3.1 기본 스타일 변환 (Gatys 방식)

| 항목 | 상세 |
|------|------|
| **설명** | 사용자가 콘텐츠/스타일 이미지를 업로드하면, VGG19 기반 최적화로 스타일 변환 결과를 생성 |
| **우선순위** | P0 (필수) |

#### 기능 상세

**FR-1.1: 이미지 업로드**
- 콘텐츠 이미지와 스타일 이미지를 각각 업로드
- 지원 포맷: PNG, WEBP
- 업로드 시 자동 리사이즈 (400px)
- 드래그앤드롭 및 파일 선택 모두 지원
- 이미지 프리뷰 표시

**FR-1.2: 하이퍼파라미터 조절**
- Content Weight (α): 슬라이더, 범위 0.1 ~ 100, 기본값 1
- Style Weight (β): 슬라이더, 범위 1e4 ~ 1e8, 로그 스케일, 기본값 1e6
- 반복 횟수 (Steps): 슬라이더, 범위 50 ~ 500, 기본값 300
- 학습률 (Learning Rate): 슬라이더, 범위 0.001 ~ 0.1, 기본값 0.01

**FR-1.3: 변환 실행 및 진행 상태**
- "변환 시작" 버튼 클릭 시 백엔드로 요청 전송
- SSE(Server-Sent Events)를 통한 실시간 진행률 표시
  - 현재 Step / 전체 Step
  - 현재 Loss 값 (Content Loss, Style Loss, Total Loss)
  - 프로그레스 바
- 50 Step마다 중간 결과 이미지 프리뷰 전송
- 변환 중 취소 기능

**FR-1.4: 결과 표시 및 다운로드**
- 원본 / 스타일 / 결과 이미지 3분할 비교 뷰
- 슬라이더로 원본↔결과 오버레이 비교
- 결과 이미지 다운로드 (PNG/WEBP 선택)
- 갤러리에 자동 저장

---

### 3.2 Fast Style Transfer (실시간 변환)

| 항목 | 상세 |
|------|------|
| **설명** | 사전학습된 SavedModel(Tensorflow) 모델을 사용하여 이미지 또는 웹캠 영상에 실시간 스타일 적용 |
| **우선순위** | P0 (필수) |

#### 기능 상세

**FR-2.1: 이미지 Fast Style Transfer**
- 업로드된 이미지에 사전학습 스타일 즉시 적용
- 스타일 프리셋 목록에서 원클릭 선택
  - Starry Night (별이 빛나는 밤)
  - The Scream (절규)
  - Mosaic (모자이크)
  - Candy (캔디)
  - Udnie
  - Rain Princess
- 적용 시간: 1초 이내 (CPU 기준)

**FR-2.2: 웹캠 실시간 스타일 변환**
- 브라우저에서 웹캠 스트림 캡처 (getUserMedia API)
- GraphQL을 통한 프레임 전송 및 SSE을 통한 상태 수신 → 변환 → 반환 파이프라인
- 프레임 크기: 320×240 (CPU 최적화)
- 목표 FPS: 5~10 (CPU 환경)
- 원본/변환 화면 좌우 분할 표시
- 키보드 단축키로 스타일 전환 (1~6 키)
- 스냅샷 촬영 및 저장 기능

**FR-2.3: 스타일 모델 관리**
- 사전학습 모델 목록 조회 API
- 모델 파일 위치: `backend/models/` 디렉토리
- 각 모델의 메타 정보: 이름, 설명, 예시 이미지, 파일 크기

---

### 3.3 학습 대시보드

| 항목 | 상세 |
|------|------|
| **설명** | CNN 구조, 특징 맵, Gram Matrix 등 이론을 시각적으로 학습하는 인터랙티브 페이지 |
| **우선순위** | P1 (권장) |

#### 기능 상세

**FR-3.1: CNN 구조 시각화**
- CNN 레이어 구조를 인터랙티브 다이어그램으로 표시
- 각 레이어 클릭 시 해당 레이어의 역할 설명 팝업
- Content Layer(conv4_2)와 Style Layer(conv1_1~conv5_1) 하이라이트

**FR-3.2: 특징 맵 시각화**
- 이미지를 업로드하면 CNN 각 레이어의 특징 맵을 히트맵으로 표시
- API: `POST /api/learn/feature-maps`
  - 입력: 이미지 파일
  - 출력: 레이어별 특징 맵 이미지 (conv1_1, conv2_1, conv3_1, conv4_1, conv4_2, conv5_1)
- 레이어 드롭다운으로 전환하며 비교

**FR-3.3: Gram Matrix 시각화**
- 선택한 레이어의 Gram Matrix를 히트맵으로 표시
- 콘텐츠 이미지와 스타일 이미지의 Gram Matrix 비교 뷰
- API: `POST /api/learn/gram-matrix`

**FR-3.4: Loss 변화 그래프**
- 스타일 변환 과정에서의 Content/Style/Total Loss 변화를 실시간 차트로 표시
- Recharts 활용 라인 차트
- Step별 로그 데이터 다운로드(CSV)

---

### 3.4 갤러리

| 항목 | 상세 |
|------|------|
| **설명** | 생성된 결과물을 저장/조회/공유하는 갤러리 시스템 |
| **우선순위** | P1 (권장) |

#### 기능 상세

**FR-4.1: 결과물 저장**
- 모든 스타일 변환 결과를 자동 저장
- 저장 정보: 콘텐츠 이미지, 스타일 이미지, 결과 이미지, 하이퍼파라미터, 생성일시, 학생명(선택)

**FR-4.2: 갤러리 조회**
- 그리드 레이아웃 (반응형 2~4열)
- 정렬: 최신순 / 인기순
- 필터: 스타일 유형별 / 날짜별
- 이미지 클릭 시 상세 모달 (원본, 스타일, 결과, 파라미터 표시)

**FR-4.3: 다운로드/삭제**
- 개별 결과물 다운로드 (원본 해상도)
- 본인 결과물 삭제 기능

---

### 3.5 프리셋 스타일 이미지

| 항목 | 상세 |
|------|------|
| **설명** | 대표적인 명화 스타일 이미지를 미리 제공하여 즉시 실습 가능하도록 구성 |
| **우선순위** | P0 (필수) |

#### 기능 상세

**FR-5.1: 기본 제공 스타일**
- 고흐 — 별이 빛나는 밤 (The Starry Night)
- 뭉크 — 절규 (The Scream)
- 칸딘스키 — 구성 VII (Composition VII)
- 호쿠사이 — 가나가와 해변의 큰 파도 (The Great Wave)
- 피카소 — 우는 여인 (Weeping Woman)
- 모네 — 수련 (Water Lilies)

**FR-5.2: 커스텀 스타일 업로드**
- 학생이 자신만의 스타일 이미지를 업로드하여 사용

---

## 4. API 명세

### 4.1 Ariadne GraphQL

```
Base URL: http://localhost:8000/graphql
```

``` graphql
# backend/schema.graphql

type Query {
  getModels: [StyleModel!]!
  getGallery(page: Int, limit: Int): [GalleryItem!]!
  getVggInfo: VGGInfo!
}

type Mutation {
  # Gatys 변환 시작 -> 즉시 taskId 반환
  startGatysTransfer(input: GatysInput!): TaskResponse!
  
  # 웹캠 프레임 1개 처리 (HTTP POST 대응)
  processWebcamFrame(image: String!, modelId: String!): StyledFrame!
}

```

### 4.2 SSE API

```
Endpoint: http://localhost:8000/sse/webcam
```

#### 웹캠 실시간 스타일 변환 프로토콜

**Client → Server(GRAPHQL):**
```json
{
  "image": "<base64_encoded_jpeg>",
  "model_id": "starry_night"
}
```

**Server → Client:**
- sse 채널 기다리기

### 4.3 주요 Request/Response 스키마

#### POST /api/style-transfer/gatys

**Request (multipart/form-data):**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `content_image` | File | O | 콘텐츠 이미지 |
| `style_image` | File | O | 스타일 이미지 |
| `content_weight` | float | X | 콘텐츠 가중치 (기본: 1) |
| `style_weight` | float | X | 스타일 가중치 (기본: 1e6) |
| `num_steps` | int | X | 반복 횟수 (기본: 300) |
| `max_size` | int | X | 최대 이미지 크기 (기본: 400) |
| `learning_rate` | float | X | 학습률 (기본: 0.01) |
| `student_name` | string | X | 학생 이름 |

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "processing",
  "message": "스타일 변환이 시작되었습니다."
}
```

#### GET /api/style-transfer/gatys/{task_id}/status (SSE)

**Event Stream:**
```
event: progress
data: {"step": 50, "total_steps": 300, "content_loss": 12345.6, "style_loss": 0.89, "total_loss": 12346.5, "preview_url": "/api/previews/task_id_step50.jpg"}

event: progress
data: {"step": 100, "total_steps": 300, ...}

event: complete
data: {"result_url": "/api/results/task_id.png", "gallery_id": 42, "elapsed_seconds": 320.5}

event: error
data: {"message": "메모리 부족으로 변환에 실패했습니다."}
```

#### POST /api/style-transfer/fast

**Request (multipart/form-data):**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `image` | File | O | 입력 이미지 |
| `model_name` | string | O | 모델명 (예: starry_night) |

**Response:**
```json
{
  "result_url": "/api/results/fast_uuid.jpg",
  "processing_time_ms": 245,
  "model_used": "starry_night"
}
```

---

## 5. 디렉토리 구조

```
neural-style-transfer/
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                     # Flask & GraphQL 앱 엔트리포인트
│   ├── config.py                   # 설정 (경로, 기본값 등)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py               # 라우터 통합
│   │   ├── style_transfer.py       # 스타일 변환 엔드포인트
│   │   ├── webcam.py               # SSE 웹캠 엔드포인트
│   │   ├── gallery.py              # 갤러리 엔드포인트
│   │   ├── learn.py                # 학습 시각화 엔드포인트
│   │   └── presets.py              # 프리셋 스타일 엔드포인트
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gatys_transfer.py       # Gatys 방식 스타일 변환 로직
│   │   ├── fast_transfer.py        # Fast Style Transfer 로직
│   │   ├── feature_extractor.py    # CNN 특징 추출
│   │   ├── image_processor.py      # 이미지 전/후처리 유틸
│   │   └── task_manager.py         # 비동기 태스크 관리
│   │
│   ├── models/                     # 사전학습 모델 파일(savedmodel)
│   │   ├── starry_night/
│   │   ├── the_scream/
│   │   ├── mosaic/
│   │   ├── candy/
│   │   ├── udnie/
│   │   └── rain_princess/
│   │
│   ├── presets/                    # 프리셋 스타일 이미지
│   │   ├── starry_night.png
│   │   ├── the_scream.png
│   │   ├── composition_vii.png
│   │   ├── great_wave.png
│   │   ├── weeping_woman.png
│   │   └── water_lilies.png
│   │
│   └── storage/                    # 런타임 파일 저장
│       ├── uploads/
│       ├── results/
│       ├── previews/
│       └── gallery.json
│
|   frontend/
|       ├── src/
│           ├── app/
│           │   ├── app.config.ts            # Application 설정 (Router, Animations, ProvideHttpClient)
│           │   ├── app.routes.ts            # 라우팅 설정
│           │   ├── app.component.ts         # Root 컴포넌트
│           │   │
│           │   ├── core/                    # 싱글톤 서비스 및 인터셉터
│           │   │   ├── services/
│           │   │   │   ├── api.service.ts
│           │   │   │   └── sse.service.ts   # SSE 연결 관리
│           │   │   └── models/               # TS 인터페이스 정의
│           │   │
│           │   ├── features/                # 주요 기능 모듈 (컴포넌트 + 서비스)
│           │   │   ├── style-transfer/
│           │   │   │   ├── style-transfer.component.ts
│           │   │   │   ├── components/      # 하위 UI 컴포넌트
│           │   │   │   │   ├── image-uploader/
│           │   │   │   │   └── parameter-panel/
│           │   │   │   └── style.store.ts   # Signal 기반 기능별 상태 관리
│           │   │   │
│           │   │   ├── webcam/
│           │   │   │   ├── webcam.component.ts
│           │   │   │   └── webcam.service.ts
│           │   │   │
│           │   │   └── gallery/
│           │   │       ├── gallery.component.ts
│           │   │       └── gallery.store.ts
│           │   │
│           │   └── shared/                  # 공통 UI 컴포넌트 (Material Wrapper)
│           │       └── components/
│           │           ├── loading-spinner/
│           │           └── image-compare/
│           │
│           ├── assets/                      # 정적 파일
│           └── styles.scss                  # 글로벌 스타일 (Angular Material)
|       ├── angular.json
|       ├── package.json
|       └── tsconfig.json
│
└── docs/
    ├── PRD.md                              # 이 문서
    ├── setup-guide.md                      # 설치 가이드
    └── student-guide.md                    # 학생용 실습 가이드
```

---

## 6. 페이지별 UI 와이어프레임

### 6.1 스타일 변환 페이지 (`/style-transfer`)

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 AI Style Studio          [스타일변환] [실시간] [학습] [갤러리] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                  │
│  │                 │    │                 │                  │
│  │   콘텐츠 이미지  │    │   스타일 이미지  │                  │
│  │   (드래그앤드롭)  │    │   (드래그앤드롭)  │                  │
│  │                 │    │                 │                  │
│  └─────────────────┘    └─────────────────┘                  │
│                                                              │
│  프리셋 스타일:                                                │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │별밤  │ │절규  │ │구성7 │ │파도  │ │우는  │ │수련  │           │
│  │     │ │     │ │     │ │     │ │여인  │ │     │           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │
│                                                              │
│  ── 파라미터 설정 ──────────────────────────────────            │
│  Content Weight (α)   ──●──────────────  1.0                 │
│  Style Weight (β)     ────────●────────  1e6                 │
│  반복 횟수 (Steps)     ─────────●───────  300                  │
│  이미지 크기            [200] [300] [●400]                     │
│                                                              │
│                    [ 🎨 변환 시작 ]                             │
│                                                              │
│  ── 진행 상태 ──────────────────────────────────               │
│  Step: 150 / 300  ████████████░░░░░░░░░░ 50%                 │
│  Content Loss: 12,345  Style Loss: 0.89  Total: 12,346       │
│                                                              │
│  ── 결과 ──────────────────────────────────                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │   원본       │ │   스타일     │ │   결과       │          │
│  │              │ │              │ │              │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                              │
│  [📥 다운로드 PNG]  [📥 다운로드 JPG]  [🖼️ 갤러리에 저장]        │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 웹캠 실시간 변환 페이지 (`/webcam`)

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 AI Style Studio          [스타일변환] [●실시간] [학습] [갤러리]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │                      │  │                      │          │
│  │                      │  │                      │          │
│  │    📷 원본 웹캠       │  │    🎨 스타일 적용     │          │
│  │                      │  │                      │          │
│  │                      │  │                      │          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                              │
│  FPS: 8.2  |  Processing: 122ms  |  Resolution: 320×240     │
│                                                              │
│  스타일 선택 (키보드 1~6):                                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │●별밤 │ │ 절규│ │모자  │ │캔디  │ │Udnie│ │Rain │           │
│  │ (1) │ │ (2) │ │ (3) │ │ (4) │ │ (5) │ │ (6) │           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │
│                                                              │
│  [📸 스냅샷 촬영]  [⏸️ 일시정지]  [⏹️ 정지]                     │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 학습 대시보드 (`/learn`)

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 AI Style Studio          [스타일변환] [실시간] [●학습] [갤러리]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [VGG19 구조]  [특징 맵]  [Gram Matrix]  [Loss 그래프]         │
│                                                              │
│  ── VGG19 구조 시각화 ──                                       │
│  ┌────┐   ┌────┐   ┌────┐   ┌────┐   ┌────┐                 │
│  │conv│──▸│conv│──▸│conv│──▸│conv│──▸│conv│                 │
│  │1_1 │   │2_1 │   │3_1 │   │4_1 │   │5_1 │                 │
│  │    │   │    │   │    │   │    │   │    │                 │
│  │Style│  │Style│  │Style│  │Style│  │Style│                 │
│  │Layer│  │Layer│  │Layer│  │  +  │  │Layer│                 │
│  │    │   │    │   │    │   │Conv │   │    │                 │
│  │    │   │    │   │    │   │4_2  │   │    │                 │
│  │    │   │    │   │    │   │Cont.│   │    │                 │
│  └────┘   └────┘   └────┘   └────┘   └────┘                 │
│                                                              │
│  ── 특징 맵 시각화 ──                                          │
│  이미지 업로드: [파일 선택]                                      │
│  레이어 선택: [conv1_1 ▼]                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Channel 1│ │ Channel 2│ │ Channel 3│ │ Channel 4│        │
│  │ (edge)   │ │(texture) │ │ (color)  │ │ (shape)  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  ── Loss 변화 그래프 ──                                        │
│  Loss │  ╲                                                   │
│       │    ╲                                                 │
│       │      ╲____                                           │
│       │           ╲___________                               │
│       └──────────────────────── Step                         │
│       ── Content Loss ── Style Loss ── Total Loss            │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. 백엔드 핵심 구현 명세

### 7.1 Gatys Style Transfer 서비스

```python
# backend/services/gatys_transfer.py 핵심 구조
import tensorflow as tf

class GatysStyleTransfer:
    def __init__(self):
        # VGG19 모델 로드 (ImageNet 가중치)
        vgg = tf.keras.applications.VGG19(include_top=False, weights='imagenet')
        vgg.trainable = False
        
        # 중간 레이어 설정
        self.content_layers = ['block4_conv2']
        self.style_layers = ['block1_conv1', 'block2_conv1', 'block3_conv1', 'block4_conv1', 'block5_conv1']
        self.model = self.get_sub_model(vgg)

    def get_sub_model(self, vgg):
        outputs = [vgg.get_layer(name).output for name in (self.style_layers + self.content_layers)]
        return tf.keras.Model([vgg.input], outputs)

    # Gram Matrix 계산 (TF 버전)
    def gram_matrix(self, input_tensor):
        result = tf.linalg.einsum('bijc,bijd->bcd', input_tensor, input_tensor)
        input_shape = tf.shape(input_tensor)
        num_locations = tf.cast(input_shape[1]*input_shape[2], tf.float32)
        return result / num_locations
        
```

### 7.2 Fast Style Transfer 서비스

```python
# backend/services/fast_transfer.py 핵심 구조
import tensorflow as tf
import numpy as np
from PIL import Image
import io

class FastStyleTransfer:
    def __init__(self):
        # CPU 최적화 설정
        tf.config.set_visible_devices([], 'GPU')
        self.models = {}  # 스타일별 모델 캐싱

    def load_model(self, model_path):
        # SavedModel 형식 로드
        return tf.saved_model.load(model_path)

    def transform(self, pil_image: Image, model_id: str):
        # 1. Pillow: 전처리 (400px 제한 및 정규화)
        img = pil_image.convert('RGB')
        img = img.resize((400, 400))
        img_array = np.array(img).astype(np.float32)
        img_array = img_array[np.newaxis, ...] / 255.0  # [1, 400, 400, 3]

        # 2. TensorFlow: 모델 추론
        if model_id not in self.models:
            self.models[model_id] = self.load_model(f'models/{model_id}')
        
        stylized_tensors = self.models[model_id](tf.constant(img_array))
        
        # 3. Pillow: 후처리 (다시 이미지 객체로)
        output = stylized_tensors[0].numpy()
        output = np.uint8(np.clip(output * 255, 0, 255))
        return Image.fromarray(output)
```

### 7.3 비동기 태스크 관리

```python
# backend/services/task_manager.py

class TaskManager:
    """Gatys 방식의 장시간 변환 작업을 비동기로 관리"""

    tasks: dict[str, TaskInfo] = {}

    async def create_task(self, params) -> str:
        """새 변환 태스크 생성, task_id 반환"""
        ...

    async def cancel_task(self, task_id: str):
        """진행 중인 태스크 취소"""
        ...

    def get_status(self, task_id: str) -> TaskStatus:
        """태스크 상태 조회"""
        ...
```

### 7.4 SSE 웹캠 핸들러

```python
# backend/api/sse.py

from flask import Blueprint, Response, request, jsonify
from services.fast_transfer import FastStyleTransfer
from services.image_processor import decode_base64_to_pil, encode_pil_to_base64
import time
import json

webcam_bp = Blueprint('webcam', __name__)

# 전역 모델 인스턴스 (TensorFlow 모델 로드)
fast_transformer = FastStyleTransfer()

@webcam_bp.route('/stream', methods=['POST'])
def receive_frame():
    """
    클라이언트로부터 프레임을 받아 처리 후 결과를 SSE로 보낼 준비를 하거나
    즉시 반환하는 엔드포인트 (SSE용 Generator와 연동 가능)
    """
    data = request.json
    frame_data = data.get('data')
    model_id = data.get('model', 'starry_night')
    
    # 1. Pillow를 이용한 이미지 로드 및 전처리
    pil_img = decode_base64_to_pil(frame_data)
    
    # 2. TensorFlow 모델 인퍼런스
    start_time = time.time()
    styled_pil = fast_transformer.transform(pil_img, model_id)
    elapsed = (time.time() - start_time) * 1000
    
    # 3. 결과 반환 (Base64)
    result_base64 = encode_pil_to_base64(styled_pil)
    
    return jsonify({
        "status": "success",
        "data": result_base64,
        "processing_time_ms": round(elapsed, 1)
    })

@webcam_bp.route('/events')
def sse_events():
    """Gatys 변환 진행률 등을 위한 SSE 채널"""
    def event_stream():
        # TaskManager 등에서 진행 상태를 가져와 yield
        while True:
            # 예시 데이터
            # yield f"data: {json.dumps({'progress': 50})}\n\n"
            time.sleep(1)
            
    return Response(event_stream(), mimetype="text/event-stream")
    
```

---

## 8. 프론트엔드 핵심 구현 명세

### 8.1 상태 관리 (Signal Store Service)
``` typescript
# src/app/core/services/sse.service.ts (8.1절 앞부분에 추가)
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseService {
  constructor(private zone: NgZone) {}

  /**
   * 서버로부터 실시간 이벤트를 구독합니다.
   * @param url SSE 엔드포인트 (예: /api/stream-status)
   */
  observe(url: string): Observable<any> {
    return new Observable(observer => {
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        // Angular의 Change Detection이 감지하도록 NgZone 내부에서 실행
        this.zone.run(() => {
          observer.next(JSON.parse(event.data));
        });
      };

      eventSource.onerror = (error) => {
        this.zone.run(() => observer.error(error));
      };

      return () => eventSource.close(); // 구독 해제 시 연결 종료
    });
  }
}

# src/app/features/style-transfer/style.store.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StyleStore {
  // 상태(State) 정의
  readonly contentImage = signal<File | null>(null);
  readonly styleImage = signal<File | null>(null);
  readonly isProcessing = signal<boolean>(false);
  
  readonly params = signal({
    contentWeight: 1,
    styleWeight: 1e6,
    numSteps: 300,
    maxSize: 400
  });

  // 파생 상태(Computed)
  readonly canStart = computed(() => 
    this.contentImage() !== null && this.styleImage() !== null && !this.isProcessing()
  );

  // 액션(Actions)
  updateParams(newParams: Partial<{contentWeight: number, styleWeight: number, numSteps: number}>) {
    this.params.update(p => ({ ...p, ...newParams }));
  }

  reset() {
    this.contentImage.set(null);
    this.isProcessing.set(false);
  }
}
```

### 8.2 라우팅 구조 (Standalone)
``` typescript
# src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'style-transfer', pathMatch: 'full' },
  { 
    path: 'style-transfer', 
    loadComponent: () => import('./features/style-transfer/style-transfer.component').then(m => m.StyleTransferComponent) 
  },
  { 
    path: 'webcam', 
    loadComponent: () => import('./features/webcam/webcam.component').then(m => m.WebcamComponent) 
  },
  { 
    path: 'learn', 
    loadComponent: () => import('./features/learn/learn.component').then(m => m.LearnComponent) 
  },
  { 
    path: 'gallery', 
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent) 
  }
];

```

### 8.3 컴포넌트 예시 (Signal 사용)
``` typescript
# src/app/features/style-transfer/style-transfer.component.ts
import { Component, inject } from '@angular/core';
import { StyleStore } from './style.store';
import { MatSliderModule } from '@angular/material/slider'; // Angular Material

@Component({
  standalone: true,
  imports: [MatSliderModule],
  template: `
    <div class="container">
      @if (store.isProcessing()) {
        <app-loading-spinner />
      }

      <mat-slider min="0.1" max="100">
        <input matSliderThumb [value]="store.params().contentWeight" 
               (valueChange)="onWeightChange($event)">
      </mat-slider>
      
      <button [disabled]="!store.canStart()" (click)="start()">변환 시작</button>
    </div>
  `
})
export class StyleTransferComponent {
  protected readonly store = inject(StyleStore);

  onWeightChange(value: number) {
    this.store.updateParams({ contentWeight: value });
  }

  start() {
    // API 호출 로직
  }
}

```
---

## 9. 성능 요구사항

| 항목 | 목표 | 비고 |
|------|------|------|
| Gatys 변환 (400px, 300step) | 5~10분 | CPU only |
| Gatys 변환 (200px, 200step) | 1~3분 | 빠른 테스트용 |
| Fast Style Transfer (단일 이미지) | < 1초 | Pillow DNN |
| 웹캠 실시간 변환 FPS | 5~10 FPS | 320×240 해상도 |
| SSE 지연시간 | < 200ms | 프레임 왕복 |
| 프론트엔드 초기 로딩 | < 3초 | Webpack 번들 최적화 |
| 이미지 업로드 최대 크기 | 10MB | 서버 리사이즈 |
| 동시 Gatys 변환 태스크 | 1개 | CPU 리소스 제한 |

---
## . 사전학습 모델 준비

Fast Style Transfer에 사용할 모델은 여러개를 조사하여 사용자에게 질문한다.

---

## 13. 에러 처리 전략

| 상황 | 처리 방식 |
|------|-----------|
| 이미지 포맷 미지원 | 400 에러 + 지원 포맷 안내 메시지 |
| 이미지 크기 초과 (10MB) | 400 에러 + 자동 리사이즈 제안 |
| 변환 중 메모리 부족 | SSE error 이벤트 + 이미지 크기 축소 가이드 |
| SSE 연결 끊김 | 자동 재연결 (최대 3회, 지수 백오프) |
| 모델 파일 누락 | 500 에러 + download_models.sh 실행 안내 |
| 동시 변환 요청 | 429 에러 + "이전 변환 완료 후 재시도" 안내 |
| 웹캠 권한 거부 | 프론트에서 권한 요청 가이드 표시 |

---
