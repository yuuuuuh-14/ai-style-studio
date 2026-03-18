# AI Style Studio - 사용자 가이드 (User Guide)

본 가이드는 AI Style Studio의 최종 배포 및 운영을 위해 사용자가 직접 수행해야 하는 단계들을 설명합니다.

---

## 🚀 1. 배포 및 인프라 설정 (Cloudflare & Docker)

### 1-1. Cloudflare Pages 설정
1. [Cloudflare 대시보드](https://dash.cloudflare.com/)에 로그인합니다.
2. **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**을 선택합니다.
3. `ai-style-studio` 저장소를 연결합니다.
4. 빌드 설정:
   - **Framework preset**: `None` (Vite 전용 설정 가능 시 선택)
   - **Build command**: `yarn build` (frontend 디렉토리 기준)
   - **Build output directory**: `frontend/build/client`

### 1-2. GitHub Secrets 등록
CI/CD 파이프라인(`deploy.yml`)이 정상 작동하도록 저장소의 **Settings > Secrets and variables > Actions**에 다음 항목을 등록해 주세요.

| Secret Name | Description |
|-------------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 토큰 (Pages 편집 권한 필요) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID |
| `DOCKERHUB_USERNAME` | Docker Hub 사용자 이름 |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token (비밀번호 대신 권장) |

---

## 🛠️ 2. 통합 테스트 실행

구현된 시스템이 정상적으로 작동하는지 로컬에서 다음 스크립트로 검증할 수 있습니다.

```bash
# 권한 부여
chmod +x scripts/test-integration.sh

# 테스트 실행 (백엔드가 8080 포트에서 실행 중이어야 함)
./scripts/test-integration.sh
```

---

## ⚠️ 3. 주의 사항 및 팁

- **TensorFlow 라이브러리**: Docker 외부에서 백엔드를 직접 실행할 경우, `libtensorflow` C 라이브러리가 로컬 시스템에 설치되어 있어야 합니다.
- **포트 충돌**: 백엔드는 기본적으로 `8080`, 프론트엔드(Vite)는 `5173` 포트를 사용합니다. 필요 시 `PORT` 환경 변수로 조정 가능합니다.
- **에러 복구**: 실시간 변환 중 네트워크가 끊기면 프론트엔드가 자동으로 **지수 백오프** 전략을 통해 재연결을 시도합니다.

---

## ✅ 4. 최종 체크리스트 (사용자 확인 사항)
- [ ] GitHub Secrets 등록 완료
- [ ] Cloudflare Pages 프로젝트 생성 완료
- [ ] Docker Hub 레지스트리 준비 완료
- [ ] `scripts/test-integration.sh` 실행 및 성공 여부 확인

> [!TIP]
> 모든 설정이 완료되면 메인 브랜치에 `push` 하는 것만으로 프론트엔드 배포와 백엔드 이미지 빌드가 자동으로 수행됩니다!
