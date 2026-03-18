# AI Style Studio - 제품 요구사항 정의서 (PRD)

## 1. 프로젝트 개요
AI Style Studio는 사용자가 Neural Style Transfer(Gatys 방식) 및 Fast Style Transfer를 통해 이미지를 변환하고, 그 과정에 담긴 딥러닝 원리(특징 추출, Gram Matrix 등)를 학습할 수 있는 인터랙티브 웹 플랫폼입니다.

## 2. 기술 스택 개요

| 구분 | 기술 | 버전 |
|------|------|------|
| **Backend** | Go (Golang) | 1.21+ |
| **API** | gqlgen (GraphQL) | 0.17+ |
| **Router** | chi | 5.0+ |
| **Frontend** | React Router v7 | TypeScript + Vite |
| **Styling** | Tailwind CSS | v4.0+ |
| **Deploy** | Cloudflare Pages | - |
| **ML Framework** | Tensorflow | 2.15+ |
| **Base Model** | Inception-v3 | - |

## 3. 핵심 아키텍처 (GraphQL + SSE)

- **GraphQL (gqlgen)**: 복잡한 데이터 조회 및 스타일 변환 요청(Mutation)을 처리합니다.
- **SSE (Server-Sent Events)**: 스타일 변환의 실시간 진행률(Step, Loss) 및 중간 결과물을 클라이언트로 스트리밍합니다.

## 4. 기능 요구사항

### 4.1 기본 스타일 변환 (Gatys 방식)
- Inception-v3 기반 최적화 루프 실행.
- 하이퍼파라미터(Content/Style Weight, Steps) 조절 기능.
- SSE를 통한 실시간 진행 현황 모니터링.

### 4.2 실시간 웹캠 변환
- 웹캠 프레임을 서버로 전송하여 사전학습된 모델로 즉시 변환.
- 5~10 FPS 목표 (CPU 환경).

### 4.3 학습 대시보드
- CNN 레이어별 특징 맵(Feature Map) 및 Gram Matrix 시각화.
- 손실 함수(Loss) 변화 실시간 그래프.

## 5. 백엔드 구현 명세 (Go)

### 5.1 GraphQL 리졸버
- `startStyleTransfer`: 작업 ID(UUID)를 생성하고 비동기 ML 작업을 시작합니다.
- `getModels`: 사용 가능한 모델 목록을 반환합니다.

### 5.2 ML 엔진 (TensorFlow Go)
- `libtensorflow`를 사용하여 Inception-v3 모델을 로드합니다.
- Go에서 직접 루프를 돌며 경사하강법을 통해 이미지를 업데이트합니다.

## 6. 프론트엔드 구현 명세 (Remix)

### 6.1 데이터 처리 및 상태 관리
- **Remix Loaders & Actions**: 서버 사이드 데이터 패칭(GraphQL) 및 이미지 업로드/변환 요청(Mutation) 처리를 위한 표준 데이터 흐름을 구현합니다.
- **Redux Toolkit**: 애플리케이션 전역 UI 상태, 스타일 변환 작업의 실시간 진행 현황 및 브라우저 세션 상태를 관리합니다.

### 6.2 컴포넌트 및 디자인 시스템
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크를 사용하여 고도로 정교하고 반응형인 디자인 시스템을 구축합니다. 일관된 컬러 팔레트와 타이포그래피 토큰을 정의하여 사용합니다.
- **React Components**: 재사용 가능한 함수형 컴포넌트와 최신 React 패턴(Hooks)을 사용하여 UI를 구성합니다.
- **Animation**: 하버 효과 및 마이크로 인터랙션을 통해 생동감 있는 사용자 경험을 제공합니다.

## 7. 성능 및 에러 처리
- Gatys 변환: 5~10분 (400px, 300 steps).
- 에러 상황(메모리 부족, 연결 끊김 등)에 대한 실시간 SSE 알림 및 복구 전략.
