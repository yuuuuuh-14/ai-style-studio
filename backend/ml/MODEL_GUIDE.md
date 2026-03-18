# AI Style Studio - 모델 준비 가이드

이 문서는 AI Style Studio의 백엔드 ML 엔진이 작동하기 위해 필요한 TensorFlow SavedModel 파일을 다운로드하고 배치하는 방법을 안내합니다.

## 1. 개요

- **Gatys Style Transfer**: 특징 추출을 위해 `Inception-v3` 모델이 필요합니다.
- **Fast Style Transfer**: 사전 학습된 스타일 변환 모델들이 필요합니다.

## 2. Inception-v3 모델 준비 (Gatys 방식용)

1. **다운로드**: [TensorFlow Hub - Inception-v3](https://tfhub.dev/google/imagenet/inception_v3/feature_vector/4) 등에서 SavedModel 형식을 다운로드합니다.
2. **배치**: 다운로드한 모델의 압축을 풀고 아래 경로에 위치시킵니다.
   - 경로: `backend/ml/models/inception-v3/`
   - 이 디렉토리 안에 `saved_model.pb`와 `variables/` 폴더가 있어야 합니다.

## 3. Fast Style Transfer 모델 준비

사전 학습된 Fast Style Transfer 모델들을 준비합니다. (예: Starry Night, The Scream 등)

1. **배치**: 각 모델별로 디렉토리를 만들어 배치합니다.
   - 경로: `backend/ml/models/fast-style-transfer/{model_name}/`
   - 예시: `backend/ml/models/fast-style-transfer/starry-night/saved_model.pb`

## 4. 라이브러리 설치 (macOS 기준)

TensorFlow Go 바인딩을 사용하기 위해서는 `libtensorflow` C 라이브러리가 필요합니다.

```bash
# Homebrew를 통한 설치
brew install libtensorflow
```

설치 후 환경 변수를 확인하세요:
- `LIBRARY_PATH` 및 `LD_LIBRARY_PATH` (또는 macOS의 경우 `DYLD_LIBRARY_PATH`)

## 5. 모델 경로 설정

백엔드 실행 시 `MODEL_PATH` 환경 변수를 통해 기본 모델 경로를 지정할 수 있습니다. 지정하지 않을 경우 코드 내 기본 경로(`./ml/models/inception-v3`)를 사용합니다.

```bash
export MODEL_PATH=./ml/models/inception-v3
go run server.go
```
