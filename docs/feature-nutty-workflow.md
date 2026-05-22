# feature/nutty 작업 정리

이 문서는 `feature/nutty` 브랜치에서 작업 흐름을 정리하기 위한 개인 작업용 문서입니다.
`origin/develop`에는 직접 반영하지 않고, 필요한 경우에만 Pull Request를 통해 검토 후 병합합니다.

## 현재 작업 원칙

- `develop` 또는 `main` 브랜치에서 직접 파일을 수정하지 않습니다.
- 개인 작업은 `feature/nutty` 브랜치에서만 진행합니다.
- 작업 중인 파일을 실시간으로 공용 브랜치에 올리지 않습니다.
- 기능 구현이나 문서 정리가 완료된 뒤 커밋하고, 필요할 때 `feature/nutty` 브랜치로만 push합니다.
- `origin/develop`에는 직접 push하지 않습니다.

## 기본 진행 순서

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nutty
```

이미 `feature/nutty` 브랜치에 있다면 아래 명령어로 확인합니다.

```bash
git branch
```

`* feature/nutty`처럼 표시되면 정상입니다.

## 작업 중 확인 명령어

변경된 파일을 확인합니다.

```bash
git status
```

현재 브랜치를 확인합니다.

```bash
git branch --show-current
```

## 작업 완료 후 커밋

변경사항을 확인한 뒤 필요한 파일만 추가합니다.

```bash
git status
git add 파일명
git commit -m "docs: 작업 내용 정리"
```

모든 변경사항을 한 번에 추가해야 할 때만 아래 명령어를 사용합니다.

```bash
git add .
```

## GitHub에 올릴 때

개인 브랜치에만 올립니다.

```bash
git push origin feature/nutty
```

그 후 GitHub에서 Pull Request를 생성합니다.

```text
base: develop
compare: feature/nutty
```

## 주의사항

- `git push origin develop`은 사용하지 않습니다.
- `git push origin main`은 사용하지 않습니다.
- 다른 팀원이 작업 중인 파일과 충돌할 수 있으므로, 공용 브랜치 반영은 Pull Request를 통해 진행합니다.
- `.env` 같은 개인 환경변수 파일은 커밋하지 않습니다.
- 새로운 환경변수가 필요하면 실제 값은 `.env`에만 넣고, 예시 형식은 `env.example`에 정리합니다.
