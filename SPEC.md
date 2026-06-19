# 그라운드룰 워크숍 사이트 개발 스펙

> **Claude Code 사용 안내**
> 1. 새 빈 프로젝트 폴더에서 `claude` 실행
> 2. 이 문서(`SPEC.md`)와 함께 `ground-rules-workshop.jsx` 프로토타입 파일을 폴더에 넣어두기
> 3. "SPEC.md를 읽고 프로젝트를 구현해줘. UI/UX는 ground-rules-workshop.jsx 프로토타입을 그대로 따라줘" 라고 요청
> 4. 단계별로 진행되도록 "1단계부터 시작" 식으로 유도

---

## 1. 프로젝트 개요

### 무엇을 만드는가
**MK Summer Camp 2026** 스태프 팀이 캠프 시작 전 **각 팀의 그라운드룰(작업 규칙)을 1시간 안에 함께 만드는** 워크숍 진행용 웹사이트.

### 누가 사용하는가
- **참여자**: 20~24세, 5개 팀에 분산된 총 120명 (대부분 모바일에서 접속)
- **팀장 (퍼실리테이터)**: 각 팀의 리더 1명. **퍼실리테이션 경험 없음** → 사이트가 진행을 코칭해야 함
- **마스터 진행자**: 학생멘토팀에서 직접 진행 (PPT 사용 가능)

### 5개 팀 구성
| 팀 | 인원 | 진행 방식 |
|---|---|---|
| 참가자관리팀 | 20명 | 모바일만 |
| 프로그램팀 | 30명 | 모바일만 |
| 학생멘토팀 | 40명 | 모바일 + PPT 가능 |
| 물품관리/데코팀 | 20명 | 모바일만 |
| 미디어콘텐츠팀 | 10명 | 모바일만 |

### 핵심 제약사항
- ⏱️ **1시간 이내 완료**
- 📱 **모바일 우선 설계** (대부분 핸드폰으로 참여)
- 🗣️ **팀장이 사이트를 보고 그대로 진행 가능해야 함** (스크립트 내장)
- 🌐 **5개 팀이 동시에 독립 세션 진행** (서로 영향 없음)

### 목적
캠프 2주 동안 함께 사역할 팀의 건강한 팀워크를 위한 약속을 함께 만들기.

---

## 2. 기술 스택

```
Frontend:    Next.js 14 (App Router) + TypeScript
Styling:     Tailwind CSS
Icons:       lucide-react
Database:    Supabase (Postgres + Realtime + Auth)
Deployment:  Vercel
Optional:    html2canvas (결과 이미지 저장용)
```

### 패키지
```bash
npm install next@latest react react-dom typescript @types/react
npm install @supabase/supabase-js @supabase/ssr
npm install tailwindcss postcss autoprefixer
npm install lucide-react html2canvas
```

### 환경 변수 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 3. 워크숍 플로우 (총 60분)

| 단계 | 이름 | 소요 | 참여자 액션 | 팀장 액션 |
|---|---|---|---|---|
| 0 | 입장 대기 | 3분 | 코드 입력 → 닉네임 등록 | 참여자 입장 확인 |
| 1 | 가치 선정 | 10분 | 12개 가치 중 3개 투표 + 주관식 | **투표 결과 보고 핵심 가치 3개 직접 선택·확정** |
| 2 | 조별 작성 | 15분 | 4-5명 조에서 그라운드룰 3개 작성 (가치별 예시 클릭 활용) | 조별 진행 현황 모니터 |
| 3 | 조별 발표 | 12분 | 발표 중인 조의 룰 화면으로 확인 | 발표 조 선택 컨트롤 |
| 4 | 최종 투표 | 10분 | 전체 후보 중 3개에 투표 | 실시간 집계 확인 (팀장만) |
| 5 | 최종 확정 | 5분 | 확정 결과 확인 + 저장 | **확정 전 문구 다듬기 → 최종 확정 → 공유** |

---

## 4. 데이터 모델 (Supabase Postgres)

```sql
-- 세션 (팀별 워크숍 1개)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 4자리 입장 코드
  team_name TEXT NOT NULL, -- "참가자관리팀" 등
  current_step INT DEFAULT 0, -- 0~5
  core_value_ids TEXT[] DEFAULT '{}', -- 1단계에서 팀장이 확정한 가치 ID들
  final_rules JSONB DEFAULT '[]', -- 5단계 확정된 룰: [{id, text, order}]
  presenting_group INT DEFAULT 1, -- 3단계에서 발표 중인 조
  created_at TIMESTAMPTZ DEFAULT NOW(),
  facilitator_id UUID -- 팀장 식별용
);

-- 참여자
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_number INT, -- 2단계에서 배정됨
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 가치 투표 (1단계: 참여자 → 가치 ID 다중 투표)
CREATE TABLE value_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  value_id TEXT NOT NULL, -- 'v1'~'v12'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, value_id)
);

-- 추가 제안 가치 (1단계 주관식)
CREATE TABLE value_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 그라운드룰 후보 (2단계: 조별 제출)
CREATE TABLE rule_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  group_number INT NOT NULL,
  value_id TEXT, -- 어떤 가치와 연결된지 (선택)
  text TEXT NOT NULL,
  created_by UUID REFERENCES participants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 최종 투표 (4단계)
CREATE TABLE rule_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES rule_candidates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, candidate_id)
);

-- 인덱스
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_participants_session ON participants(session_id);
CREATE INDEX idx_value_votes_session ON value_votes(session_id);
CREATE INDEX idx_rule_candidates_session ON rule_candidates(session_id);
CREATE INDEX idx_rule_votes_session ON rule_votes(session_id);

-- RLS (Row Level Security)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_votes ENABLE ROW LEVEL SECURITY;

-- 모든 작업은 anon key로 가능하게 (인증 없는 워크숍)
-- 실제 운영에서는 더 엄격한 정책 적용 권장
CREATE POLICY "Anyone can read sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON sessions FOR UPDATE USING (true);
-- ... 나머지 테이블에도 동일하게 적용

-- Realtime 활성화 (Supabase 대시보드에서 모든 테이블에 대해 enable)
```

---

## 5. 상수 데이터

`lib/constants.ts`에 다음 상수 정의:

```typescript
export const PRESET_VALUES = [
  { id: 'v1', label: '존중', desc: '서로의 다름을 인정' },
  { id: 'v2', label: '소통', desc: '솔직하고 명확한 대화' },
  { id: 'v3', label: '책임감', desc: '맡은 일에 끝까지 최선' },
  { id: 'v4', label: '배려', desc: '먼저 챙기는 마음' },
  { id: 'v5', label: '성장', desc: '함께 배우고 발전' },
  { id: 'v6', label: '협력', desc: '나보다 우리를 먼저' },
  { id: 'v7', label: '즐거움', desc: '함께하는 기쁨' },
  { id: 'v8', label: '신뢰', desc: '믿고 맡길 수 있는 관계' },
  { id: 'v9', label: '헌신', desc: '아낌없이 섬기는 자세' },
  { id: 'v10', label: '안전', desc: '심리적·신체적 안전감' },
  { id: 'v11', label: '유연성', desc: '변화에 함께 적응' },
  { id: 'v12', label: '감사', desc: '서로에게 감사 표현' },
];

// 가치별 그라운드룰 예시 (2단계에서 참여자에게 제공)
export const VALUE_RULE_EXAMPLES: Record<string, string[]> = {
  v1: ['반대 의견도 끝까지 듣고 말한다', '서로의 일하는 방식을 평가하지 않는다'],
  v2: ['오해 생기면 그날 안에 직접 말한다', '단톡방 공지는 24시간 안에 답한다'],
  v3: ['일정이 늦어질 것 같으면 미리 알린다', '회의 시작 5분 전에 자리에 도착한다'],
  v4: ['피곤해 보이는 팀원에게 먼저 안부 묻는다', '도움이 필요해 보이면 먼저 다가간다'],
  v5: ['실수는 비난 없이 함께 돌아본다', '하루 1개 배운 것을 공유한다'],
  v6: ['내 일이 끝나면 도울 일이 있는지 묻는다', '다른 팀 영역 들어갈 때 양해를 구한다'],
  v7: ['하루 한 번 팀에게 웃긴 얘기 공유', '식사 시간엔 일 얘기 안 하기'],
  v8: ['약속한 것은 꼭 지킨다', '뒤에서 다른 사람 얘기 하지 않는다'],
  v9: ['내가 할 수 있는 한 가지를 매일 한다', '쉬는 시간 일부를 자발적으로 나눈다'],
  v10: ['감정이 격해질 때는 5분 산책 후 대화', '실수에 인격 공격은 하지 않는다'],
  v11: ['계획이 바뀌어도 짜증 내지 않는다', '대안을 함께 제시한다'],
  v12: ['하루 한 번 팀원에게 감사 표현', '도움 받았을 때 즉시 말로 감사 인사'],
};
```

또한 **팀장 가이드 스크립트** (각 단계별 멘트) — 프로토타입의 `FacilitatorGuide` 컴포넌트에 정리되어 있음. 그대로 사용.

---

## 6. 페이지 구조 (Next.js App Router)

```
app/
├── page.tsx                          # 랜딩: 팀장/참여자 선택
├── layout.tsx                        # 전역 레이아웃
├── facilitator/
│   ├── new/page.tsx                  # 새 세션 만들기 (팀명 입력 → 코드 생성)
│   └── [sessionId]/page.tsx          # 팀장 대시보드 (전 단계 컨트롤)
├── join/page.tsx                     # 참여자 입장 (코드 + 닉네임)
├── session/
│   └── [sessionId]/page.tsx          # 참여자 단계별 화면
└── admin/
    └── page.tsx                      # ★ 어드민 대시보드 (PC + 모바일 반응형)
```

### URL 흐름
1. `/` → 랜딩
2. 팀장 클릭 → `/facilitator/new` → 팀명 입력 → 코드 생성 → `/facilitator/{sessionId}` 로 이동
3. 참여자 클릭 → `/join` → 코드+이름 입력 → `/session/{sessionId}` 로 이동
4. 양쪽 모두 `sessions.current_step` 을 구독해서 자동으로 화면 전환
5. **운영자** → `/admin` (별도 입장 코드 또는 비밀번호로 보호) → 모든 5개 팀 실시간 모니터링

---

## 7. 어드민 대시보드 (운영자 페이지) ★

### 목적
**캠프 운영자(예: 학생멘토팀 진행자 = 본인)** 가 5개 팀의 워크숍 진행 상황을 **한 화면에서** 모니터링할 수 있도록.

### URL
`/admin` — 비밀번호 또는 별도 어드민 코드로 접근 제한

### 반응형 요구사항 (필수)
- **PC (≥1280px)**: 팀 카드 3열 그리드, 상세 통계 4열
- **태블릿 (768~1280px)**: 팀 카드 2열, 통계 4열
- **모바일 (<768px)**: 팀 카드 1열, 통계 2열
- 모든 텍스트와 버튼이 양쪽에서 가독성 유지

### 화면 구성

#### 상단 헤더
- 타이틀: "전체 팀 진행 현황" + "MK Summer Camp 2026 · 운영 대시보드" 라벨
- 실시간 인디케이터 (펄스 애니메이션)
- "전체 결과 내보내기" 버튼 (PC에서만 표시, 모바일은 숨김)

#### 통계 요약 카드 (4개)
| 카드 | 표시 내용 |
|---|---|
| 총 참여 | `현재 입장 / 전체 인원` (예: 106/120명) |
| 진행 중 | 1~4단계 진행 중인 팀 수 |
| 확정 완료 | 5단계 확정한 팀 수 (강조 표시) |
| 대기 | 아직 시작 안 한 팀 수 (0단계) |

#### 팀 카드 (5개)
각 카드 구성:
- **상단**: 팀명, 정원, 현재 단계 배지
- **진행바**: 6개 세그먼트 (0~5단계), 현재 단계는 펄스 애니메이션
- **통계 그리드** (2열):
  - 입장: `N/총원 (%)` 
  - 현재 단계 상태: "22/28 응답", "3/4 조 제출", "2조 발표 중" 등 단계별 메시지
- **확정된 룰 미리보기** (5단계 완료 시만): 4개 룰 리스트
- **하단 액션**: "팀 세션 들여다보기" 버튼 → 해당 팀의 팀장 화면을 새 탭에서 열기 (읽기 전용 모드)

### 데이터 소스
**모든 5개 세션을 동시에 구독**해야 함.

```typescript
// /lib/hooks/useAllSessions.ts
function useAllSessions() {
  const [sessions, setSessions] = useState<TeamOverview[]>([]);
  
  useEffect(() => {
    const fetchAll = async () => {
      // sessions, participants, value_votes, rule_candidates, rule_votes를 JOIN
      const { data } = await supabase.rpc('get_all_sessions_overview');
      setSessions(data);
    };
    
    fetchAll();
    
    // 5개 세션 변경 모두 구독
    const channel = supabase
      .channel('admin-all-sessions')
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchAll)
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  return sessions;
}
```

### Postgres RPC 함수 (생성 필요)
```sql
CREATE OR REPLACE FUNCTION get_all_sessions_overview()
RETURNS TABLE (
  session_id UUID,
  team_name TEXT,
  current_step INT,
  total_participants INT,
  joined_count INT,
  current_responses INT,  -- 현재 단계에 대한 응답 수
  final_rules JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.team_name,
    s.current_step,
    -- 정원은 추후 sessions 테이블에 expected_total 컬럼 추가하거나 별도 설정
    20::INT as total_participants,
    (SELECT COUNT(*)::INT FROM participants WHERE session_id = s.id),
    CASE s.current_step
      WHEN 1 THEN (SELECT COUNT(DISTINCT participant_id)::INT FROM value_votes WHERE session_id = s.id)
      WHEN 4 THEN (SELECT COUNT(DISTINCT participant_id)::INT FROM rule_votes WHERE session_id = s.id)
      ELSE 0
    END,
    s.final_rules
  FROM sessions s
  ORDER BY s.created_at;
END;
$$ LANGUAGE plpgsql;
```

### 보안 (간단한 비밀번호 보호)
운영자 페이지는 누구나 접근 가능하면 안 되므로:
```
.env.local:
ADMIN_PASSWORD=캠프_운영자_비밀번호

/app/admin/page.tsx 진입 시 비밀번호 미들웨어 또는 입력 폼 거치게
```

복잡한 인증 대신, 간단한 비밀번호 입력 페이지 → 쿠키에 저장 → /admin 접근 가능 패턴.

### 추가 기능 (선택)
- **자동 새로고침**: Realtime이 끊겨도 30초마다 fetchAll 강제 실행
- **알림**: 한 팀이 5단계 완료 시 운영자에게 시각/음성 알림 (선택)
- **전체 결과 내보내기**: 5개 팀의 최종 그라운드룰을 PDF/PNG/JSON으로 한 번에 다운로드

---

## 8. 단계별 상세 명세

> **모든 UI/UX는 `ground-rules-workshop.jsx` 프로토타입을 따른다.** 아래는 행동 명세.

### 0단계: 입장 대기
**팀장 화면:**
- 6자리 세션 코드를 크게 표시 (참여자가 보고 입력)
- 실시간으로 입장한 참여자 목록 표시 (이름 칩)
- "다음 단계로" 버튼 → `current_step = 1` 로 업데이트

**참여자 화면:**
- "곧 시작합니다" 대기 화면 + 펄스 애니메이션
- `current_step` 이 변경되면 자동으로 다음 화면

### 1단계: 가치 선정 ★개선됨
**참여자 화면:**
- 12개 가치 그리드 (2열)
- 최대 3개 선택 (선택 후 다른 카드 disabled)
- 주관식 입력 "추가하고 싶은 가치"
- 제출 → `value_votes` + `value_suggestions` INSERT → "다른 분 기다리는 중" 화면

**팀장 화면:**
- 실시간 투표 결과 막대 그래프 (응답 수 기준 정렬)
- **각 행을 클릭하면 핵심 가치로 선택** (최대 3개, 체크박스 표시)
- 상단에 현재 선택된 가치명 표시
- "우리 팀의 핵심 가치로 확정" 버튼 → `sessions.core_value_ids` UPDATE
- 확정 후에는 선택 잠김
- 추가 제안 가치 목록 별도 카드로 표시

**핵심 비즈니스 로직:**
- 팀장이 직접 선택한 가치만 `core_value_ids`에 저장 (자동 top 3 X)
- 확정 전에는 다음 단계로 진행 불가

### 2단계: 조별 작성 ★개선됨
**조 자동 배정 로직:**
```typescript
// 참여자를 4-5명씩 조에 균등 배정
function assignGroups(participants: Participant[]) {
  const targetSize = 5;
  const groupCount = Math.ceil(participants.length / targetSize);
  // 셔플 후 균등 분배
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  return shuffled.map((p, i) => ({
    ...p,
    group_number: (i % groupCount) + 1
  }));
}
```
- 팀장이 2단계 진입 시 자동 실행
- 결과를 `participants.group_number`에 UPDATE

**참여자 화면:**
- "당신은 N조 입니다" + 같은 조 멤버 이름 표시
- **우리 팀 핵심 가치와 연결된 예시** (가치별 2개씩, 클릭하면 입력란 자동 채움)
- 좋은/나쁜 룰 예시 (접이식 보조)
- 입력란 3개 (룰 1, 2, 3)
- "조의 의견으로 제출" 버튼 → `rule_candidates` INSERT × 3
  - 마지막 1명이 제출하면 조 전체 제출 처리
  - (단순화: 조원 누구든 제출하면 그 조의 데이터로 반영)

**팀장 화면:**
- 4개 조 카드 그리드, 각 조마다:
  - 조 번호, 멤버 이름
  - 제출 완료/작성 중 상태 (3/3 형식)
  - 제출된 룰 미리보기

### 3단계: 조별 발표
**팀장 화면:**
- 조 번호 버튼들 (1, 2, 3, 4)
- 클릭 시 `sessions.presenting_group` UPDATE
- 선택한 조의 룰들이 카드로 크게 표시

**참여자 화면:**
- 딥 그린 배경의 큰 카드
- `presenting_group`을 구독해서 현재 발표 조의 룰을 실시간 표시
- (선택) 하단 도트 인디케이터로 어느 조인지 표시

### 4단계: 최종 투표
**참여자 화면:**
- 모든 후보 룰 리스트 (조 + 가치 라벨 포함)
- 최대 3개 선택
- "투표 제출" → `rule_votes` INSERT × 3 → 대기 화면

**팀장 화면:**
- **팀장만 보이는 실시간 집계**
- 후보별 득표수 막대 그래프 (정렬됨)
- 상위 4개 강조 표시

### 5단계: 최종 확정 ★개선됨
**팀장 화면 (편집 모드):**
- 상위 4개 룰을 자동으로 가져옴 (편집 가능 상태)
- 각 룰 클릭 → 인라인 textarea로 편집
- "이 룰 삭제" 옵션
- "최종 확정 및 팀원에게 공유" 버튼
  - `sessions.final_rules` UPDATE (편집된 최종 텍스트)
- 확정 후: 축하 카드 표시 + "다시 수정" 옵션

**참여자 화면:**
- `final_rules`가 있으면 즉시 카드 형태로 표시
- 크라운 아이콘 + 그라데이션 배경 + "MK Summer Camp 2026" 라벨
- "결과 저장하기" 버튼 (이미지 다운로드)

---

## 8. 디자인 시스템

### 컬러 (포스터 톤앤매너: Kingdom of God 2026, 에메랄드 그린)
```css
Primary:      emerald-700 (#047857) — 주 버튼, 강조 텍스트
Primary-bg:   emerald-50 (#ECFDF5) — 패널 배경
Primary-accent: emerald-500 (#10B981) — 선택/하이라이트
Dark:         emerald-900 (#064E3B) — 발표 카드 배경
Neutral-bg:   stone-50 (#FAFAF9) — 전체 배경
Neutral-text: stone-900 (#1C1917) — 본문 텍스트
Neutral-mute: stone-500 (#78716C) — 보조 텍스트
Border:       stone-200 (#E7E5E4) — 일반 보더
Warning:      amber-100/700 — "작성 중" 상태
Error:        rose-600 — 삭제 액션
```

### 타이포그래피
- 시스템 폰트 (Pretendard 권장, 없으면 sans-serif)
- 본문: 14~15px
- 헤더: 18~24px
- 라벨: 11~12px

### 컴포넌트 사이즈
- 모바일 터치 타깃: 최소 44px
- 라운드: `rounded-xl` (12px) 기본, 카드는 `rounded-2xl` (16px)
- 카드 패딩: 16~24px

### 상단 시그니처
랜딩에 작은 라벨로:
```
MK SUMMER CAMP 2026
PEACE · JOY · RIGHTEOUSNESS · ROMANS 14:17
```

---

## 9. Realtime 동기화 (Supabase)

### 핵심 패턴
모든 화면이 `sessions.current_step` + 본인 단계의 데이터를 구독.

```typescript
// 예: 팀장이 1단계에서 실시간 가치 투표 결과 수신
import { createClient } from '@supabase/supabase-js';

useEffect(() => {
  const supabase = createClient(URL, KEY);
  
  // 초기 데이터 로드
  fetchVotes();
  
  // 실시간 구독
  const channel = supabase
    .channel(`session-${sessionId}-votes`)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'value_votes',
        filter: `session_id=eq.${sessionId}`
      },
      () => fetchVotes() // 단순히 다시 가져오기
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [sessionId]);
```

### 구독 대상 정리
| 화면 | 구독 테이블 |
|---|---|
| 모든 화면 | `sessions` (current_step, presenting_group, core_value_ids, final_rules) |
| 팀장 0단계 | `participants` (입장 현황) |
| 팀장 1단계 | `value_votes`, `value_suggestions` |
| 팀장 2단계 | `rule_candidates` (조별 제출 현황) |
| 팀장 4단계 | `rule_votes` (실시간 집계) |

---

## 10. 핵심 비즈니스 로직

### 세션 코드 생성
```typescript
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
// 충돌 시 재생성 (DB UNIQUE 제약)
```

### 단계 전환 권한
- **팀장만** `current_step`을 변경 가능
- UI에서 1단계는 `core_value_ids`가 비어있으면 다음 단계 진행 불가
- 5단계는 `final_rules`가 비어있으면 확정 화면 안 보임

### 투표 집계
```typescript
// 가치 투표 집계 (1단계 팀장 화면)
const counts = PRESET_VALUES.map(v => ({
  ...v,
  count: votes.filter(vt => vt.value_id === v.id).length
}));
counts.sort((a, b) => b.count - a.count);

// 룰 투표 집계 (4단계 팀장 화면)
const ruleCounts = candidates.map(c => ({
  ...c,
  count: ruleVotes.filter(v => v.candidate_id === c.id).length
}));
ruleCounts.sort((a, b) => b.count - a.count);
```

### 응답 진척도 표시
```
"18/20 응답" = value_votes에서 distinct participant_id 수 / 전체 participant 수
```

### 결과 이미지 저장 (5단계 참여자)
```typescript
import html2canvas from 'html2canvas';

const saveAsImage = async () => {
  const node = document.getElementById('result-card');
  const canvas = await html2canvas(node, { backgroundColor: null });
  const link = document.createElement('a');
  link.download = `groundrules-${teamName}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
```

---

## 11. 구현 우선순위 (마일스톤)

### 🏗️ M1 — 기반 구축 (1일)
- [ ] Next.js + Tailwind 프로젝트 생성
- [ ] Supabase 프로젝트 + 스키마 적용
- [ ] 기본 라우팅 (랜딩, 팀장/참여자 입장 페이지)
- [ ] 세션 생성/입장 동작

### 🎯 M2 — 핵심 플로우 (2~3일)
- [ ] 0단계: 입장 대기 + 실시간 참여자 표시
- [ ] 1단계: 가치 투표 → 팀장이 직접 핵심 가치 선택·확정
- [ ] 2단계: 조 자동 배정 + 가치 예시 클릭으로 입력
- [ ] 3단계: 조별 발표 컨트롤
- [ ] 4단계: 최종 투표
- [ ] 5단계: 팀장이 문구 다듬어 최종 확정

### ✨ M3 — 다듬기 (1~2일)
- [ ] 디자인 토큰 정리 + 포스터 톤앤매너 매칭
- [ ] 팀장 가이드 스크립트 전체 단계 적용
- [ ] 결과 이미지 다운로드
- [ ] 모바일 UX 점검 (터치, 키보드 등)
- [ ] 에러 처리 (네트워크 오류 등)

### 🚀 M4 — 배포 & 리허설 (1일)
- [ ] Vercel 배포
- [ ] 실제 팀으로 리허설 진행
- [ ] 버그 수정

---

## 12. 참고 파일

- `ground-rules-workshop.jsx` — 전체 UI/UX 프로토타입 (이 파일과 함께 제공됨)
  - 모든 화면 디자인의 시각적 레퍼런스
  - 텍스트, 컬러, 레이아웃 그대로 차용
  - React 단일 파일로 작성되어 있어 컴포넌트 분리만 하면 됨

### 컴포넌트 분리 가이드
프로토타입을 Next.js로 옮길 때:
```
components/
├── landing/Landing.tsx
├── facilitator/
│   ├── FacilitatorView.tsx
│   ├── FacilitatorGuide.tsx
│   ├── FacStep0.tsx ~ FacStep5.tsx
│   └── CelebrationCard.tsx
└── participant/
    ├── ParticipantView.tsx
    └── PartStep0.tsx ~ PartStep5.tsx
```

**데모용 `DemoNav` 컴포넌트는 제거**하고, 실제 라우팅으로 대체.

---

## 13. 마무리 체크리스트

배포 직전 확인:
- [ ] 5명 정도로 처음부터 끝까지 시연 가능
- [ ] 모바일 사파리/크롬에서 모든 입력 정상 동작
- [ ] 네트워크 끊어졌다 다시 연결 시 데이터 보존
- [ ] 팀장 가이드 스크립트가 모든 단계에 보임
- [ ] 5개 팀이 동시에 별도 세션으로 진행 가능
- [ ] 결과 이미지 저장 시 폰트/색상 깨지지 않음
- [ ] 캠프 포스터(에메랄드 그린) 톤과 일관성 유지
