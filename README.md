# 🚀 심스픽 (SimSpeak) — React Native Frontend
> **"외우지 마세요, 시뮬레이션하세요." (Don't just learn. Simulate it.)**
> 
> 생성형 AI 기반 가상 캐릭터와의 실시간 대화 환경을 제공하기 위해, 빠르고 정밀한 오디오 스트리밍 핸들링과 인터랙티브 UI/UX를 책임지는 **심스픽 서비스의 클라이언트 프론트엔드**입니다.

---

## 🛠 1. 기술 스택 및 핵심 의존성 (Tech Stack)

* **Framework**: React Native (Expo) / TypeScript (~5.9.2)
* **Audio & Speech Handling**:
  * `expo-av` (^16.0.8): 유저 발화 녹음 및 백엔드 발급 AI 응답 오디오 스트리밍 재생 제어
  * `@react-native-voice/voice` (^3.2.4): 온디바이스 실시간 보이스 트래킹 및 음성 인터랙션 보조
* **State Management**: `zustand` (^5.0.13) — 가볍고 직관적인 아키텍처로 캐릭터별 호감도, 라이프(하트), 실시간 세션 문맥 전역 관리
* **Network & API**: `axios` (^1.16.1) — 가속 백엔드 오케스트레이터 및 비동기 결과 추적 통신
* **UI/UX & Animation**: `react-native-reanimated`, `react-native-gesture-handler`, `@expo/vector-icons` — 호감도 변동 효과 및 캐릭터 미세 반응 연출

---

## 🏗 2. 클라이언트 아키텍처 및 데이터 흐름 (Data Flow)

본 프론트엔드는 유저의 음성 데이터 수집부터 백엔드의 동기/비동기 응답 파이프라인 처리를 유기적으로 연결하도록 설계되었습니다.

* **유저 발화 입력 및 FormData 조립**
  * 유저가 음성 혹은 텍스트로 발화하면 `expo-av`를 통해 오디오를 인코딩합니다.
  * 조립된 데이터는 `axios`를 통해 백엔드의 `/api/chat/message` 엔드포인트로 전송됩니다.
* **Track 1: 즉시 응답 수신 및 스트리밍**
  * 백엔드로부터 실시간 AI 캐릭터 대사 텍스트를 수신하여 화면 말풍선에 즉시 렌더링합니다.
  * 전달받은 ElevenLabs 오디오 URL을 `expo-av` 인프라를 통해 스트리밍 재생합니다.
  * 실시간 호감도 변동 수치를 기반으로 `react-native-reanimated`를 활용해 캐릭터의 미세한 감정 반응 UI 애니메이션을 트리거합니다.
* **Track 2: 사후 데이터 동기화**
  * 백엔드에서 비동기로 처리가 완료된 정밀 문법 교정문 및 음소 단위 발음 평가 지표를 주기적으로 동기화하여 수집합니다.
  * 수집된 에러 리포트 및 평가 데이터는 `zustand` 글로벌 스토어에 반영되어 최종 오답 노트 화면에 바인딩됩니다.

---

## ⚡ 3. 핵심 구현 및 설계 포인트 (Core Implementation)

### 1️⃣ 초저지연 대화 처리를 위한 '오디오 스트리밍 & 동적 UI 매핑'
* **도전 과제**: AI가 정밀 분석한 교육 데이터(문법, 발음 점수)와 대화 오디오가 동시에 넘어올 때까지 기다리면 클라이언트 단에서 심각한 화면 버벅임과 흐름 단절이 발생했습니다.
* **해결 방안**: 백엔드의 '투 트랙(Two-Track) 아키텍처'에 발맞춰, 클라이언트 역시 오디오 및 대사를 먼저 렌더링하는 **즉시 렌더링 루프**와 사후 분석 데이터를 바인딩하는 **비동기 후적재 루프**로 분리했습니다.
* **구현 방식**: `expo-av`를 활용해 원격 스트리밍 오디오를 버퍼링 없이 즉시 재생(`sound.playAsync()`)하고, `zustand` 스토어가 실시간 호감도 델타값(`affinity_delta`)을 감지하여 캐릭터 스킨 및 UI 컴포넌트의 미세한 감정선 표현 애니메이션을 트리거합니다.

### 2️⃣ Zustand 기반 글로벌 상태 최적화 및 세션 보안 관리
* **컴포넌트 독립성 확보**: 세션 정보, 현재 스테이지 진행 상황, 유저의 하트 개수를 가볍고 중앙 집중화된 `zustand` 스토어에 격리하여, 화면 전환 간의 불필요한 리렌더링(Re-rendering) 현상을 제거했습니다.
* **보안 토큰 및 유저 세션 영속성**: `expo-secure-store`를 활용해 게스트 가입 익명인증 키 및 JWT 보안 토큰을 하드웨어 수준에서 암호화하여 격리 보관함으로써, 디바이스가 재부팅되어도 유저의 학습 상태와 연속 일수가 안전하게 보존되도록 구현했습니다.

### 3️⃣ 사용자 포용적 하이브리드 UI/UX 설계 (Inclusive Design)
* **발음 및 외부 환경 유연성 확보**: 주변 소음이 심하거나 유저의 발음이 일시적으로 뭉개져 STT 오류가 발생할 수 있는 상황에 대응하기 위해, 오디오 입력과 동시에 유저가 텍스트 키보드로 발화를 직접 즉각 수정하여 가속 레이어로 재전송할 수 있는 **하이브리드 입력 모드**를 설계 및 반영했습니다.

---

## 📂 4. 주요 컴포넌트 및 상태 레이어 명세

* **`/screens/LobbyScreen`**: 캐릭터들의 계단식 해금 애니메이션 및 호감도 게이지 시각화 인터페이스
* **`/screens/ChatScreen`**: 실시간 가상 대화 룸으로, `expo-av` 녹음 컨트롤러와 실시간 대사 말풍선 컴포넌트 탑재
* **`/screens/ReportScreen`**: 세션 종료 후 원어민 교정 표현(Corrections) 및 5각 레이더 차트로 구현된 CEFR 레벨 분석 리포팅 화면
* **`/store/useChatStore`**: 실시간 세션 매핑, 하트 페널티 트래킹, 실시간 호감도 변동 전역 상태 제어 레이어
*


# 📱 React Native Project

> **MS AI School 최종 프로젝트 프론트엔드 저장소입니다.**
> 서비스 기획부터 구현까지, 팀원들과의 원활한 협업과 일관된 코드 품질을 위해 아래 규칙과 가이드를 반드시 준수해 주세요.

---

## 🛠️ 개발 환경 및 버전 (Prerequisites)

팀원 간 빌드 에러를 방지하기 위해 아래 버전을 통일하여 사용합니다.

* **Node.js**: 추후 결정
* **Package Manager**: `npm`
* **Java SDK**: `OpenJDK 17` (Android 빌드용)

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

## 📱 실행 및 구동 (Running the App)

에뮬레이터 또는 시뮬레이터를 미리 실행시킨 상태에서 아래 명령어를 실행합니다.


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
