[🌐 EN VERSION](MILESTONE_EN.md)

# AI Style Studio — 마일스톤 (MILESTONES)

## Milestone 0: 프로젝트 초기 설정
**기간:** 1일  
**목표:** 프로젝트 구조, 개발 환경, CI/CD 기반 구축

### Issues
1. **저장소 초기화 및 기본 문서 작성** — README.md, .gitignore, LICENSE 등 기본 파일 생성
2. **Backend 프로젝트 구조 생성** — Flask boilerplate, requirements.txt, config.py, 디렉토리 구조
3. **Frontend 프로젝트 구조 생성** — Angular CLI Standalone + Webpack 5 설정
4. **Docker Compose 기본 세팅** — Backend 컨테이너 설정, docker-compose.yml
5. **CI/CD 파이프라인 초안** — GitHub Actions 워크플로우 (lint, test, build)
6. **Linting/Formatting 설정** — Backend(Black, Flake8), Frontend(ESLint, Prettier)

---

## Milestone 1: Backend 핵심 기능
**기간:** 5일  
**목표:** Gatys/Fast Style Transfer, GraphQL API, SSE 실시간 통신 구현

### Issues
7. **Flask 앱 엔트리포인트 및 Config 구성** — main.py, config.py, CORS, 파일 스토리지 경로 설정
8. **Ariadne GraphQL 스키마 정의 및 서버 연동** — schema.graphql, Query/Mutation resolver, /graphql 엔드포인트
9. **이미지 업로드/리사이즈 유틸 구현** — image_processor.py (PNG/WEBP 지원, 400px 리사이즈, base64 인코딩/디코딩)
10. **VGG19 기반 Gatys Style Transfer 구현** — gatys_transfer.py, VGG19 로드, Gram Matrix, 최적화 루프
11. **비동기 Task Manager 구현** — task_manager.py, 태스크 생성/상태 조회/취소, 동시 1개 제한
12. **SSE 엔드포인트 구현** — Gatys 진행률(step/loss/preview), 웹캠 이벤트 스트림
13. **Fast Style Transfer 서비스 구현** — fast_transfer.py, SavedModel 로드, 추론, 모델 캐싱
14. **사전학습 모델 조사 및 다운로드 스크립트** — 모델 조사, download_models.sh 작성
15. **프리셋 스타일 이미지 준비** — 6종 명화 이미지 수집·저장 (starry_night, the_scream 등)
16. **파일 스토리지 관리** — uploads/results/previews 디렉토리, gallery.json CRUD

---

## Milestone 2: Frontend 핵심 기능
**기간:** 5일  
**목표:** 스타일 변환 UI, 웹캠 실시간 UI, Angular Material 기반 디자인 시스템 구축

### Issues
17. **Angular Standalone 프로젝트 세팅** — app.config.ts, 라우팅, Angular Material 테마
18. **Core 서비스 구현** — API Service (GraphQL Client), SSE Service, TS 모델 인터페이스
19. **Shared 컴포넌트 구현** — Loading Spinner, Image Compare Slider
20. **스타일 변환 페이지 구현** — Image Uploader (Drag&Drop), Parameter Panel, Style Store (Signal)
21. **스타일 변환 실행 및 결과 표시** — SSE 실시간 진행률, 3분할 비교 뷰, 다운로드
22. **웹캠 실시간 변환 페이지 구현** — getUserMedia, 프레임 전송/수신, 원본/변환 좌우 분할
23. **웹캠 스타일 선택 및 스냅샷** — 프리셋 선택 UI, 키보드 단축키(1~6), 스냅샷 촬영/저장

---

## Milestone 3: 학습 대시보드 + 갤러리
**기간:** 4일  
**목표:** CNN 시각화 학습 기능, 갤러리 CRUD 완성

### Issues
24. **CNN(VGG19) 구조 인터랙티브 시각화** — Learn 페이지, 레이어 다이어그램, 클릭 설명 팝업
25. **특징 맵 시각화 API + UI** — /api/learn/feature-maps, 레이어별 히트맵 표시
26. **Gram Matrix 비교 뷰 API + UI** — /api/learn/gram-matrix, 콘텐츠/스타일 비교 히트맵
27. **Loss 변화 실시간 차트** — Content/Style/Total Loss 라인 차트, CSV 다운로드
28. **갤러리 결과물 저장 기능** — 자동 저장, gallery.json 관리, GalleryStore
29. **갤러리 조회 UI** — 그리드 레이아웃, 정렬/필터, 상세 모달
30. **갤러리 다운로드/삭제** — 개별 다운로드, 삭제 기능

---

## Milestone 4: 통합·최적화·배포
**기간:** 3일  
**목표:** 전체 통합 테스트, 성능 최적화, 프로덕션 배포

### Issues
31. **Backend ↔ Frontend 통합 테스트** — End-to-end 시나리오 검증
32. **에러 처리 전략 적용** — PRD §13 기반 에러 핸들링 전체 적용
33. **성능 최적화** — 이미지 리사이즈 최적화, Webpack 번들 사이즈 최적화
34. **Docker Compose 최종 설정** — Backend 프로덕션 설정, 환경 변수 관리
35. **Netlify 배포 설정** — Frontend 빌드·배포 파이프라인
36. **GitHub Actions CI/CD 완성** — 테스트/빌드/배포 자동화 워크플로우
37. **OAuth2 인증 적용** — 사용자 인증/권한 관리
38. **문서 작성** — README.md, setup-guide.md, student-guide.md 최종 정리
