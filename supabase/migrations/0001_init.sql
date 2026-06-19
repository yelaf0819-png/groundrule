-- ============================================================
-- 그라운드룰 워크숍 초기 스키마
-- 실행 후 Supabase 대시보드 > Database > Replication 에서
-- 모든 테이블의 Realtime 을 활성화해 주세요.
-- ============================================================

-- 세션 (팀별 워크숍 1개)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,               -- 4자리 입장 코드
  team_name TEXT NOT NULL,                 -- "참가자관리팀" 등
  current_step INT DEFAULT 0,              -- 0~5
  core_value_ids TEXT[] DEFAULT '{}',      -- 1단계에서 팀장이 확정한 가치 ID들
  final_rules JSONB DEFAULT '[]',          -- 5단계 확정된 룰: [{id, text, order}]
  presenting_group INT DEFAULT 1,          -- 3단계에서 발표 중인 조
  facilitator_id UUID,                     -- 팀장 식별용
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 참여자
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_number INT,                        -- 2단계에서 배정됨
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 가치 투표 (1단계: 참여자 → 가치 ID 다중 투표, 최대 3개)
CREATE TABLE value_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  value_id TEXT NOT NULL,                  -- 'v1'~'v12'
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
  value_id TEXT,                           -- 어떤 가치와 연결된지 (선택)
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

-- RLS 활성화
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_votes ENABLE ROW LEVEL SECURITY;

-- 인증 없는 워크숍: anon key로 전체 접근 허용
CREATE POLICY "Anyone can read sessions"    ON sessions    FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions"  ON sessions    FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions"  ON sessions    FOR UPDATE USING (true);

CREATE POLICY "Anyone can read participants"   ON participants FOR SELECT USING (true);
CREATE POLICY "Anyone can create participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON participants FOR UPDATE USING (true);

CREATE POLICY "Anyone can read value_votes"    ON value_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can create value_votes"  ON value_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete value_votes"  ON value_votes FOR DELETE USING (true);

CREATE POLICY "Anyone can read value_suggestions"   ON value_suggestions FOR SELECT USING (true);
CREATE POLICY "Anyone can create value_suggestions" ON value_suggestions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read rule_candidates"    ON rule_candidates FOR SELECT USING (true);
CREATE POLICY "Anyone can create rule_candidates"  ON rule_candidates FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read rule_votes"    ON rule_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can create rule_votes"  ON rule_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete rule_votes"  ON rule_votes FOR DELETE USING (true);

-- ============================================================
-- 어드민 대시보드용 RPC 함수
-- ============================================================
CREATE OR REPLACE FUNCTION get_all_sessions_overview()
RETURNS TABLE (
  session_id UUID,
  team_name TEXT,
  current_step INT,
  total_participants INT,
  current_responses INT,
  final_rules JSONB,
  core_value_ids TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.team_name,
    s.current_step,
    (SELECT COUNT(*)::INT FROM participants p WHERE p.session_id = s.id),
    CASE s.current_step
      WHEN 1 THEN (SELECT COUNT(DISTINCT vv.participant_id)::INT FROM value_votes vv WHERE vv.session_id = s.id)
      WHEN 4 THEN (SELECT COUNT(DISTINCT rv.participant_id)::INT FROM rule_votes rv WHERE rv.session_id = s.id)
      ELSE 0
    END,
    s.final_rules,
    s.core_value_ids
  FROM sessions s
  ORDER BY s.created_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- [수동 작업 필요]
-- Supabase 대시보드 > Database > Replication 에서
-- 아래 테이블들의 Realtime Insert/Update/Delete 를 모두 활성화:
--   sessions, participants, value_votes,
--   value_suggestions, rule_candidates, rule_votes
-- ============================================================
