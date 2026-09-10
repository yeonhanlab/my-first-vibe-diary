# forMe

> 무심코 흘려보내는 짧은 시간을, 나를 위한 시간으로 바꿔주는 앱.
> 남의 삶을 구경하는 대신, 내 삶으로 돌아오는 작은 휴식.

**forMe**는 생산성 앱이 아닙니다. SNS·쇼츠·쇼핑 앱을 습관적으로 열게 되는 10~20분의 빈 시간에,
잠깐 멈추고 좋아하는 작은 활동 하나를 골라 휴대폰을 내려놓도록 돕는 감성 휴식 앱입니다.
성공은 "앱에 오래 머무는 것"이 아니라 "앱을 잠깐 쓰고 현실로 돌아가는 것"입니다.

## 시작하기

```bash
pnpm install      # 의존성 설치 (esbuild 빌드 스크립트는 자동 허용됨)
pnpm dev          # 개발 서버 → http://localhost:5173
```

### 그 외 명령어

```bash
pnpm build        # 프로덕션 빌드 → dist/
pnpm preview      # 빌드 결과 로컬 미리보기
```

> pnpm 10+ 는 의존성의 설치 스크립트를 기본으로 차단합니다.
> Vite가 사용하는 `esbuild`의 postinstall 실행을 `pnpm-workspace.yaml`에서 허용해 두었습니다.

## 기술

- **React 18 + Vite 5**
- **react-router-dom v6** — 화면 흐름 라우팅
- **Supabase** (PostgreSQL + 인증) — 프로필·활동·기록을 계정에 저장. 이메일+비밀번호 로그인. `localStorage`는 오프라인 캐시로만 사용. 설정은 [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) 참고.
- **모바일 우선** 디자인
- **PWA 준비** — `public/manifest.webmanifest` 포함. 프로덕션 빌드에서 `public/sw.js`가 있으면 `src/main.jsx`가 자동 등록합니다(아이콘·서비스 워커는 아직 SVG 플레이스홀더 / 미포함).

## 구조

```
src/
  main.jsx              앱 진입점, 라우터/컨텍스트 마운트, (프로덕션) SW 등록
  App.jsx               라우트 정의, 로그인/프로필/세션 가드
  context/AuthContext.jsx  로그인 세션 상태, signUp / signIn / signOut
  context/AppContext.jsx  profile · activities · records (Supabase 읽기/쓰기, 낙관적 업데이트) · 진행 중인 session 상태
  lib/
    supabase.js          Supabase 클라이언트 (환경변수에서 생성)
    storage.js           오프라인 캐시 (사용자별 localStorage) + uid 생성기
    constants.js         기본 활동, 아이콘 세트, 카테고리, 시간, 감정, 마무리 문구
    date.js              달력 날짜 유틸
    image.js             프로필 사진 리사이즈(정사각형 축소)
  components/
    FloatingActivities.jsx  중앙 프로필 + 주변을 떠다니는 활동 비눗방울
    IconPicker.jsx / CategoryChips.jsx / BackButton.jsx
  screens/
    Login.jsx            이메일+비밀번호 로그인 / 회원가입
    Onboarding.jsx       첫 실행 프로필 설정(이름 + 선택 사진)
    Home.jsx             "오늘은 어떻게 기분전환을 해볼까요?" — 활동 랜덤 표시
    AllActivities.jsx    전체 활동 목록 / 편집 진입
    ActivityForm.jsx     활동 추가·편집·삭제
    MoodBefore.jsx       "지금 내 마음은?"
    DurationSelect.jsx   10 / 20 / 30분 / 1시간
    Focus.jsx            집중 타이머 (최소 화면)
    Done.jsx             "잘 쉬었어요." 따뜻한 마무리 문구
    MoodAfter.jsx        "어땠어요?"
    CalendarScreen.jsx   쉼 달력 + 날짜별 기록
    Profile.jsx          프로필 수정
  styles/global.css      디자인 토큰 + 전체 스타일
```

## 사용자 흐름

```
(첫 실행) 온보딩 → 홈
홈에서 활동 선택 → 지금 내 마음은? → 얼마나 써볼까요? → 집중 타이머
   → 잘 쉬었어요 → 어땠어요? → 기록 저장 → 홈
홈 상단에서 → 쉼 달력 / 프로필
```

## 의도적으로 넣지 않은 것

연속 출석(streak), 생산성 점수, 레벨, 랭킹, 친구 경쟁, 과도한 통계·습관 관리,
광고, 결제·구독 유도, 과도한 알림, 무한 스크롤, SNS 피드,
그리고 "휴대폰 그만 보세요" 같은 훈계 문구.

## 데이터

모든 데이터는 이 브라우저에만 남습니다. 서버로 전송되지 않으며, 브라우저 데이터를 지우면 함께 사라집니다.
