# 📱 React Native Project

> **MS AI School 최종 프로젝트 프론트엔드 저장소입니다.**
> 서비스 기획부터 구현까지, 팀원들과의 원활한 협업과 일관된 코드 품질을 위해 아래 규칙과 가이드를 반드시 준수해 주세요.

---

## 🛠️ 개발 환경 및 버전 (Prerequisites)

팀원 간 빌드 에러를 방지하기 위해 아래 버전을 통일하여 사용합니다.

* **Node.js**: 추후 결정
* **Package Manager**: `npm`
* **Java SDK**: `OpenJDK 17` (Android 빌드용)
* **Expo SDK**: `55`
* **Expo Go**: Expo SDK 55 전용 앱 설치 필요 (아래 참고)

---

## 🚀 시작 가이드 (Getting Started)

저장소를 로컬에 클론하고 에뮬레이터/시뮬레이터로 구동하기까지의 순서입니다.

### 1. 저장소 클론 (Clone)
프로젝트를 진행할 로컬 디렉토리에서 아래 명령어를 실행합니다.
```bash
git clone [https://github.com/3rd-project-ms/your-repository-name.git](https://github.com/3rd-project-ms/your-repository-name.git)
cd your-repository-name
```

---

## 🔒 환경 변수 설정 (.env)

API URL 및 보안 키(Key) 등 민감한 정보는 깃허브에 올리지 않고 로컬 `.env` 파일로 관리합니다.

1. 프로젝트 최상위 경로(Root)에 `.env` 파일을 생성합니다.
2. 아래 예시(`env.example`)를 참고하여 필요한 값을 팀원들과 공유받아 입력합니다.

```text
# [.env 파일 예시]
API_URL=http://your-backend-api-url:8080
AZURE_AI_KEY=your_azure_ai_service_key_here
```

> ⚠️ **주의**: `.env` 파일은 `.gitignore`에 등록되어 있어 깃허브에 커밋되지 않습니다. 새로운 환경변수가 추가되면 반드시 `env.example` 파일에도 형식을 업데이트해 주세요.

---

## 📱 Expo Go 설치 (Expo Go Setup)

이 프로젝트는 **Expo SDK 55**를 사용합니다. 스토어의 최신 Expo Go는 SDK 버전이 맞지 않을 수 있으므로, 아래 방법으로 설치해 주세요.

> ⚠️ **현재 Android만 지원합니다.**

### Android
아래 링크에서 Expo Go APK를 직접 다운로드하여 설치합니다.

```
https://expo.dev/go?sdkVersion=55&platform=android&device=true
```

> 설치 전 기기에서 **"알 수 없는 앱 설치 허용"** 을 활성화해야 합니다.

---

## 📱 실행 및 구동 (Running the App)

에뮬레이터 또는 시뮬레이터를 미리 실행시킨 상태에서 아래 명령어를 실행합니다.

```bash
npm install
npx expo start
```

Expo Go 앱에서 터미널에 표시된 QR 코드를 스캔하면 앱이 실행됩니다.

---

## 📂 폴더 구조 (Directory Structure)


---

## 🤝 협업 규칙 (Convention)

### 1. 네이팅 규칙
* **컴포넌트 파일 및 폴더**: 파스칼 케이스 (PascalCase) ➡️ `LoginButton.tsx`, `ProfileCard.jsx`
* **일반 함수, 변수, 훅**: 카멜 케이스 (camelCase) ➡️ `const [userData, setUserData] = useState()`, `useAuth()`
* **스타일 선언**: `StyleSheet` 유틸리티는 파일 하단에 선언하여 컴포넌트 로직과 완전히 분리합니다.

### 2. Git 브랜치 전략
* `main`: 프로덕션 출시 및 최종 배포 브랜치
* `develop`: 기능 개발 완료 후 병합(Merge)하는 기준 브랜치 
* `feature/자신의 이름`: 각자 맡은 기능을 개발하는 브랜치 (예: `feature/seungeun`)

### 3. 커밋 메시지 규칙 (Commit Message)
* `feat: `: 새로운 기능 추가
* `fix: `: 버그 수정
* `docs: `: README 등 문서 수정
* `style: `: 코드 의미에 영향을 주지 않는 수정 (포맷팅, 세미콜론 누락 등)
* `refactor: `: 코드 리팩토링

---
## 협업 관련 참고 내용 (Convention)
https://www.notion.so/git-34394fb7a17980fa980ee60a2377e97b?source=copy_link
