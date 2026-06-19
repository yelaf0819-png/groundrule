// ============================================================
// 프리셋 가치 목록 (12개)
// ============================================================
export const PRESET_VALUES = [
  { id: "v1",  label: "존중",   desc: "서로의 다름을 인정" },
  { id: "v2",  label: "소통",   desc: "솔직하고 명확한 대화" },
  { id: "v3",  label: "책임감", desc: "맡은 일에 끝까지 최선" },
  { id: "v4",  label: "배려",   desc: "먼저 챙기는 마음" },
  { id: "v5",  label: "성장",   desc: "함께 배우고 발전" },
  { id: "v6",  label: "협력",   desc: "나보다 우리를 먼저" },
  { id: "v7",  label: "즐거움", desc: "함께하는 기쁨" },
  { id: "v8",  label: "신뢰",   desc: "믿고 맡길 수 있는 관계" },
  { id: "v9",  label: "헌신",   desc: "아낌없이 섬기는 자세" },
  { id: "v10", label: "안전",   desc: "심리적·신체적 안전감" },
  { id: "v11", label: "유연성", desc: "변화에 함께 적응" },
  { id: "v12", label: "감사",   desc: "서로에게 감사 표현" },
] as const;

export type ValueId = (typeof PRESET_VALUES)[number]["id"];

// ============================================================
// 가치별 그라운드룰 예시 (2단계 참여자 힌트)
// ============================================================
export const VALUE_RULE_EXAMPLES: Record<string, string[]> = {
  v1:  ["반대 의견도 끝까지 듣고 말한다", "서로의 일하는 방식을 평가하지 않는다"],
  v2:  ["오해 생기면 그날 안에 직접 말한다", "단톡방 공지는 24시간 안에 답한다"],
  v3:  ["일정이 늦어질 것 같으면 미리 알린다", "회의 시작 5분 전에 자리에 도착한다"],
  v4:  ["피곤해 보이는 팀원에게 먼저 안부 묻는다", "도움이 필요해 보이면 먼저 다가간다"],
  v5:  ["실수는 비난 없이 함께 돌아본다", "하루 1개 배운 것을 공유한다"],
  v6:  ["내 일이 끝나면 도울 일이 있는지 묻는다", "다른 팀 영역 들어갈 때 양해를 구한다"],
  v7:  ["하루 한 번 팀에게 웃긴 얘기 공유", "식사 시간엔 일 얘기 안 하기"],
  v8:  ["약속한 것은 꼭 지킨다", "뒤에서 다른 사람 얘기 하지 않는다"],
  v9:  ["내가 할 수 있는 한 가지를 매일 한다", "쉬는 시간 일부를 자발적으로 나눈다"],
  v10: ["감정이 격해질 때는 5분 산책 후 대화", "실수에 인격 공격은 하지 않는다"],
  v11: ["계획이 바뀌어도 짜증 내지 않는다", "대안을 함께 제시한다"],
  v12: ["하루 한 번 팀원에게 감사 표현", "도움 받았을 때 즉시 말로 감사 인사"],
};

// ============================================================
// TypeScript 공통 타입
// ============================================================
export interface Session {
  id: string;
  code: string;
  team_name: string;
  current_step: number;
  core_value_ids: string[];
  final_rules: FinalRule[];
  presenting_group: number;
  facilitator_id: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  session_id: string;
  name: string;
  group_number: number | null;
  joined_at: string;
}

export interface ValueVote {
  id: string;
  session_id: string;
  participant_id: string;
  value_id: string;
  created_at: string;
}

export interface ValueSuggestion {
  id: string;
  session_id: string;
  participant_id: string;
  text: string;
  created_at: string;
}

export interface RuleCandidate {
  id: string;
  session_id: string;
  group_number: number;
  value_id: string | null;
  text: string;
  created_by: string | null;
  created_at: string;
}

export interface RuleVote {
  id: string;
  session_id: string;
  participant_id: string;
  candidate_id: string;
  created_at: string;
}

export interface FinalRule {
  id: string;
  text: string;
  order: number;
}

export const MAX_WORKSHOP_STEPS = 5;
export const MAX_VALUE_VOTES = 3;
export const MAX_RULE_VOTES = 3;
export const TARGET_GROUP_SIZE = 5;
