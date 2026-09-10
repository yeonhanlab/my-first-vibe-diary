# Supabase 백엔드 붙이기 (5분)

forMe 는 이제 데이터를 브라우저가 아니라 Supabase(호스팅되는 PostgreSQL + 인증)에 저장한다.
아래 4단계를 마치면 `pnpm dev` 로 바로 동작한다.

## 1. 프로젝트 만들기

1. https://supabase.com 에서 로그인 → **New project**
2. 이름/DB 비밀번호/리전(Northeast Asia (Seoul) 권장) 입력 후 생성 (~2분)

## 2. 테이블 만들기

1. 왼쪽 메뉴 **SQL Editor** → **New query**
2. 이 저장소의 [`supabase/schema.sql`](./supabase/schema.sql) 내용을 통째로 붙여넣고 **Run**
3. **Table Editor** 에 `profiles`, `activities`, `records` 세 테이블이 보이면 성공
   (셋 다 자물쇠 아이콘 = RLS 켜짐)

## 3. 인증 방식 설정 (이메일 + 비밀번호)

**Authentication → Sign In / Providers → Email** 에서:

- **Enable Email provider**: 켜짐(기본값)
- **Confirm email**:
  - **끄면** 가입 즉시 로그인됨 → 개발 중 편하다. (권장: 개발 단계)
  - **켜면** 가입 후 메일의 인증 링크를 눌러야 로그인 가능. 앱은 두 경우 모두 처리한다.

## 4. 키를 앱에 넣기

1. **Project Settings → API** 에서 두 값을 복사:
   - `Project URL`
   - `anon` `public` key (secret 아님 — 브라우저에 노출돼도 되는 키. 보호는 RLS가 한다)
2. 프로젝트 루트의 **`.env.local`** 에 붙여넣기:

   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

3. dev 서버 재시작:

   ```bash
   pnpm dev
   ```

## 확인

- `http://localhost:5173` → `/login` 으로 이동됨
- **계정 만들기** → 이메일/비밀번호(6자+) → 온보딩(이름) → 홈
- **Table Editor → activities**: 기본 활동 15개가 그 사용자 `user_id` 로 들어가 있음
- 활동을 추가/삭제하거나 휴식을 마치면 `activities` / `records` 행이 즉시 바뀜
- 다른 브라우저에서 같은 계정으로 로그인하면 같은 데이터가 보임 (기기 동기화)

## 구조가 어떻게 바뀌었나

| 파일 | 역할 |
| --- | --- |
| `src/lib/supabase.js` | Supabase 클라이언트 1개 (환경변수에서 생성) |
| `src/context/AuthContext.jsx` | 로그인 세션 상태 · `signUp` / `signIn` / `signOut` |
| `src/screens/Login.jsx` | 이메일+비밀번호 화면 (로그인/가입 토글) |
| `src/context/AppContext.jsx` | **여기가 마이그레이션된 곳.** `localStorage` 읽기/쓰기 → Supabase `select`/`upsert`/`insert`/`delete`. 화면에는 기존과 똑같은 `useApp()` API를 그대로 노출하고, 저장은 낙관적 업데이트(화면 먼저 → 실패 시 롤백)로 처리 |
| `src/lib/storage.js` | 이제 "오프라인 캐시"만 담당. 앱 재실행 시 서버 응답 전 마지막 화면을 즉시 그려줌 |
| `src/App.jsx` | 라우팅 가드: 미로그인 → `/login`, 로그인했지만 프로필 없음 → `/welcome` |

## Vercel 배포

`vercel.json` 은 이미 포함돼 있다 (SPA 라우팅 — `/profile` 등에서 새로고침해도 404 안 나게 모든 경로를 `index.html` 로 rewrite).

1. **코드를 GitHub 에 push** (Vercel 은 GitHub 연동으로 배포)
2. https://vercel.com → **Add New… → Project** → `my-first-vibe-diary` 저장소 import
3. 설정은 자동 감지된다 (건드릴 필요 없음):
   - Framework Preset: **Vite**
   - Build Command: `pnpm build` · Output: `dist` · Install: `pnpm install` (`pnpm-lock.yaml` 감지)
4. **Environment Variables** 에 두 개 추가 (Production / Preview / Development 모두 체크):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   > `VITE_` 변수는 **빌드 시점에 번들에 박힌다.** anon key 는 공개돼도 되는 키이고 보호는 RLS 가 한다. 값을 바꾸면 **재배포**해야 반영된다.
5. **Deploy**
6. 배포된 도메인(예: `my-first-vibe-diary.vercel.app`)을 복사해 **Supabase → Authentication → URL Configuration**:
   - **Site URL**: `https://my-first-vibe-diary.vercel.app`
   - **Redirect URLs**: `https://my-first-vibe-diary.vercel.app/**` 추가
   - (이메일 인증 메일 / 비밀번호 재설정 링크가 올바른 도메인을 가리키게 하려면 필요. `Confirm email` 을 꺼둔 상태의 순수 비밀번호 로그인만 쓸 거면 없어도 동작은 한다.)

`.env.local` 은 로컬 개발용이고 git 에 올라가지 않는다. Vercel 은 위 4번의 환경변수만 쓴다.

## 다음 단계 (선택)

- **프로필 사진**을 base64로 `profiles.photo` 에 넣는 대신 **Supabase Storage** 버킷으로 옮기면 DB가 가벼워진다.
- **비밀번호 재설정**: `supabase.auth.resetPasswordForEmail()` + 재설정 화면 추가.
