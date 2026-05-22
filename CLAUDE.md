# CLAUDE.md

## 프로젝트 개요

**LinguaFlirt** — AI 캐릭터와 영어 대화를 연습하고 발음·표현을 교정받는 React Native 앱.

## 기술 스택

- **Framework**: React Native 0.83 + Expo SDK 55
- **라우팅**: expo-router v4 (파일 기반)
- **상태 관리**: Zustand
- **HTTP**: Axios (`services/api.ts`)
- **언어**: TypeScript 5.9

## 폴더 구조

```
app/                    # 화면 (expo-router 파일 라우팅)
  (auth)/               # 로그인·회원가입 (인증 그룹)
  (main)/               # 홈·채팅·퀴즈 등 메인 그룹
  report/               # 리포트 화면 그룹
    _layout.tsx         # Stack 네비게이터 (headerShown: false)
    index.tsx           # 리포트 메인 요약
    pronunciation.tsx   # 발음 정밀 진단
    pronunciation-detail.tsx  # 발음 상세 보기
  index.tsx             # 진입점 → /report 로 Redirect

components/
  common/               # 공용 UI 컴포넌트
  affection/            # 호감도 관련
  character/            # 캐릭터 카드·성별 선택
  chat/                 # 채팅 말풍선·입력바·마이크

services/               # API 호출 레이어
store/                  # Zustand 스토어
constants/theme.ts      # 디자인 토큰
docs/wireframe.png      # UI 와이어프레임 참고 이미지
```

## 공용 컴포넌트 (`components/common/`)

| 컴포넌트 | 용도 |
|---|---|
| `ScoreCard` | 점수 카드 (label + value + unit) |
| `ProgressBar` | 진행 바 (progress 0~1, change %) |
| `CorrectionItem` | 취소선 원문 → 교정 표현 |
| `PrimaryButton` | 버튼 (variant: filled \| outline) |
| `ChartPlaceholder` | 차트 자리 표시 회색 박스 |
| `PronunciationTable` | 발음 분석 결과 표 |
| `SectionCard` | 제목+내용 카드 컨테이너 |
| `NavArrow` | 이전/다음 화살표 네비게이션 |

## Path Alias

`@/` → 프로젝트 루트 (tsconfig.json에 설정됨)

```ts
import PrimaryButton from '@/components/common/PrimaryButton';
```

## 네비게이션 규칙

- 뒤로가기: `router.back()`
- 화면 이동: `router.push('/경로')`
- 네이티브 헤더 비활성화, 각 화면에서 커스텀 헤더 직접 구현
- 인증 그룹 `(auth)`, 메인 그룹 `(main)`은 각각 `_layout.tsx` 필요

## 개발 서버 실행

```bash
npx expo start
```
