# Daylog - 개인 생활 데이터 트래커

## 프로젝트 개요
하루 5가지 생활 데이터(지출/수면/운동/기분/식단)를 기록하고
시각화로 패턴을 파악하는 개인용 트래커 앱.

**목표:** 입력은 쉽게, 시각화는 예쁘게, 인사이트는 자동으로

---

## 기술 스택
- **프레임워크:** Next.js 14 (App Router)
- **DB / Auth:** Supabase
- **스타일링:** Tailwind CSS + shadcn/ui
- **차트:** Recharts
- **배포:** Vercel
- **언어:** TypeScript

---

## 디렉토리 구조
```
daylog/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/
│   │   ├── dashboard/page.tsx      # 메인 대시보드
│   │   ├── log/page.tsx            # 오늘 데이터 입력
│   │   ├── stats/page.tsx          # 통계 & 차트
│   │   └── insight/page.tsx        # 상관관계 분석
│   ├── layout.tsx
│   └── page.tsx                    # 루트 → /dashboard 리다이렉트
├── components/
│   ├── ui/                         # shadcn/ui 컴포넌트
│   ├── charts/
│   │   ├── SpendingChart.tsx       # 지출 바차트
│   │   ├── SleepChart.tsx          # 수면 라인차트
│   │   ├── MoodChart.tsx           # 기분 트렌드
│   │   └── ExerciseHeatmap.tsx     # 운동 히트맵
│   ├── forms/
│   │   ├── SpendingForm.tsx
│   │   ├── SleepForm.tsx
│   │   ├── ExerciseForm.tsx
│   │   ├── MoodForm.tsx
│   │   └── MealForm.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── SummaryCard.tsx         # 오늘 요약 카드
│       └── InsightBadge.tsx        # 자동 인사이트 뱃지
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils.ts
│   └── insights.ts                 # 상관관계 분석 로직
├── types/
│   └── index.ts                    # 전체 타입 정의
└── CLAUDE.md
```

---

## 데이터 모델 (Supabase)

```sql
-- 사용자 프로필
create table profiles (
  id uuid references auth.users primary key,
  email text,
  created_at timestamptz default now()
);

-- 지출
create table spending (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  date date not null,
  category text check (category in ('식비', '교통', '쇼핑', '문화', '기타')),
  amount integer not null,
  memo text,
  created_at timestamptz default now()
);

-- 수면
create table sleep (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  date date not null,
  bedtime time not null,
  wake_time time not null,
  duration_minutes integer,  -- 자동 계산
  created_at timestamptz default now()
);

-- 운동
create table exercise (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  date date not null,
  type text not null,
  duration_minutes integer not null,
  created_at timestamptz default now()
);

-- 기분
create table mood (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  date date not null,
  score integer check (score between 1 and 10),
  memo text,
  created_at timestamptz default now()
);

-- 식단
create table meal (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  date date not null,
  breakfast text,
  lunch text,
  dinner text,
  created_at timestamptz default now()
);
```

---

## 핵심 화면 & UI 원칙

### 입력 UX 원칙
- 타이핑 최소화 → 버튼, 슬라이더, 토글 우선
- 하루 전체 입력 3분 이내 목표
- 오늘 입력했으면 체크 표시로 완료 확인 가능

### 대시보드 구성
1. **상단:** 오늘 날짜 + 5개 항목 입력 완료 여부 (아이콘 + 체크)
2. **중단:** 이번 주 요약 카드 (지출 합계 / 평균 수면 / 운동 횟수 / 평균 기분)
3. **하단:** 인사이트 뱃지 ("이번 주 운동 3회 달성! 🎉")

### 차트 스펙
| 차트 | 타입 | 기간 |
|------|------|------|
| 지출 | 바차트 (카테고리별 색상) | 이번 달 |
| 수면 | 라인차트 | 최근 30일 |
| 기분 | 라인차트 + 점 | 최근 30일 |
| 운동 | 히트맵 (잔디) | 최근 3개월 |
| 식단 | 캘린더 뷰 | 이번 달 |

### 인사이트 분석 예시
- 수면 7시간 이상인 날 vs 미만인 날 기분 평균 비교
- 운동한 날 vs 안 한 날 기분 평균 비교
- 지출이 많은 요일 패턴
- 이번 달 지출 카테고리 TOP 3

---

## 디자인 시스템
- **모드:** 다크모드 기본, 라이트모드 토글 지원
- **색상 팔레트:**
  - 지출 💸 → `#F87171` (레드)
  - 수면 😴 → `#818CF8` (인디고)
  - 운동 💪 → `#34D399` (그린)
  - 기분 😊 → `#FBBF24` (옐로)
  - 식단 🍚 → `#FB923C` (오렌지)
- **폰트:** Pretendard (한국어 최적화)
- **모바일 퍼스트:** 기준 너비 390px (iPhone 14)

---

## 개발 우선순위

### Phase 1 (MVP)
- [ ] Supabase Auth 로그인/회원가입
- [ ] 5개 데이터 입력 폼
- [ ] 대시보드 기본 카드
- [ ] 지출 + 기분 차트

### Phase 2 - 시각화 강화
- [ ] 전체 차트 완성
- [ ] 인사이트 자동 분석
- [ ] 운동 히트맵

### Phase 3 - 완성도
- [ ] 다크/라이트 모드
- [ ] PWA 설정 (홈화면 추가 가능)
- [ ] 데이터 CSV 내보내기
- [ ] 앱스토어 출품 준비

---

## 코딩 규칙
- 컴포넌트는 항상 TypeScript + 명시적 타입
- 서버/클라이언트 컴포넌트 명확히 구분 (`'use client'` 상단 명시)
- Supabase 쿼리는 `lib/supabase/` 에서만
- 차트 컴포넌트는 `'use client'` 필수 (Recharts는 CSR only)
- 에러 처리 항상 포함 (try/catch + 사용자 친화적 메시지)
- 모든 날짜는 `date-fns` 라이브러리 사용

---

## 시작하기
```bash
npx create-next-app@latest daylog --typescript --tailwind --app
cd daylog
npx shadcn-ui@latest init
npm install @supabase/ssr @supabase/supabase-js recharts date-fns
```

to-do
변경 시 기존 -> 변경 후로 변경점 보이기
