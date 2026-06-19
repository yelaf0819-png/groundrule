import React, { useState, useEffect } from 'react';
import { 
  Users, User, ChevronRight, Clock, CheckCircle2, Heart, 
  Sparkles, MessageCircle, Vote, Trophy, ArrowRight, 
  Plus, Eye, RefreshCw, BookOpen, Lightbulb, Send,
  PanelLeftOpen, PanelLeftClose, Smartphone, Monitor, Edit2,
  Crown, LayoutDashboard, ExternalLink, Activity
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// 데이터: 가치 옵션 (캠프 컨텍스트에 맞춤)
// ─────────────────────────────────────────────────────────
const PRESET_VALUES = [
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

// 가치별 그라운드룰 예시 (참여자가 클릭하면 입력란에 자동 채워짐)
const VALUE_RULE_EXAMPLES = {
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

// 좋은 그라운드룰 예시
const RULE_EXAMPLES = {
  good: [
    '회의 시작 5분 전에는 자리에 도착한다',
    '불편한 점은 그날 안에 직접 말한다',
    '회의 중에는 휴대폰을 뒤집어 놓는다',
    '도움이 필요할 땐 먼저 손을 든다',
  ],
  bad: [
    '서로 존중한다 → 너무 추상적',
    '소통을 잘 한다 → 행동이 안 보임',
    '책임감 있게 일한다 → 측정 불가',
  ]
};

// 데모용 목업 데이터
const MOCK_PARTICIPANTS = [
  '지윤', '서준', '하은', '도현', '예린', '민준', 
  '소율', '시우', '채원', '준우', '나은', '윤호',
  '다인', '태민', '수아', '건우', '리아', '재현',
  '유진', '현우'
];

const MOCK_VALUE_VOTES = {
  v1: 14, v2: 18, v3: 12, v4: 16, v5: 8, v6: 10,
  v7: 6, v8: 11, v9: 9, v10: 4, v11: 3, v12: 5,
};

// 팀장이 확정한 핵심 가치 (데모용; 실제로는 1단계에서 선택됨)
const SELECTED_CORE_VALUES = ['v2', 'v4', 'v3']; // 소통, 배려, 책임감

const MOCK_RULE_CANDIDATES = [
  { id: 'r1', group: 1, value: 'v2', text: '오해 생기면 그날 안에 직접 만나서 푼다' },
  { id: 'r2', group: 1, value: 'v4', text: '도움이 필요해 보이면 먼저 다가가서 묻는다' },
  { id: 'r3', group: 2, value: 'v2', text: '단톡방 공지는 24시간 안에 확인·답장한다' },
  { id: 'r4', group: 2, value: 'v3', text: '맡은 일이 늦어질 것 같으면 미리 알린다' },
  { id: 'r5', group: 3, value: 'v1', text: '다른 의견도 끝까지 듣고 말한다' },
  { id: 'r6', group: 3, value: 'v4', text: '피곤해 보이는 팀원에게 먼저 안부를 묻는다' },
  { id: 'r7', group: 4, value: 'v6', text: '내 일 끝나면 다른 사람 도울 일이 있는지 묻는다' },
  { id: 'r8', group: 4, value: 'v3', text: '회의 시작 5분 전에는 자리에 도착한다' },
];

const MOCK_RULE_VOTES = {
  r1: 12, r2: 8, r3: 15, r4: 18, r5: 10, r6: 14, r7: 6, r8: 16,
};

// 어드민 페이지용 5개 팀 데이터 (실제로는 모든 sessions 조회)
const MOCK_ADMIN_TEAMS = [
  { 
    id: 1, name: '참가자관리팀', total: 20, joined: 18, step: 2, 
    stepInfo: '3/4 조 제출', finalRules: null 
  },
  { 
    id: 2, name: '프로그램팀', total: 30, joined: 28, step: 1, 
    stepInfo: '22/28 응답', finalRules: null 
  },
  { 
    id: 3, name: '학생멘토팀', total: 40, joined: 38, step: 3, 
    stepInfo: '2조 발표 중', finalRules: null 
  },
  { 
    id: 4, name: '물품관리/데코팀', total: 20, joined: 12, step: 0, 
    stepInfo: '대기 중', finalRules: null 
  },
  { 
    id: 5, name: '미디어콘텐츠팀', total: 10, joined: 10, step: 5, 
    stepInfo: '확정 완료', 
    finalRules: [
      '단톡방 공지는 24시간 안에 확인·답장한다',
      '맡은 일이 늦어질 것 같으면 미리 알린다',
      '회의 시작 5분 전에는 자리에 도착한다',
      '피곤해 보이는 팀원에게 먼저 안부를 묻는다'
    ]
  },
];

// ─────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('landing');
  const [step, setStep] = useState(0);
  const [showDemoNav, setShowDemoNav] = useState(true);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {showDemoNav && (
        <DemoNav 
          view={view} 
          setView={setView} 
          step={step} 
          setStep={setStep}
          onClose={() => setShowDemoNav(false)}
        />
      )}
      
      {!showDemoNav && (
        <button 
          onClick={() => setShowDemoNav(true)}
          className="fixed top-4 right-4 z-50 bg-white border border-stone-200 rounded-full p-2 shadow-sm hover:shadow-md"
        >
          <Eye size={16} className="text-stone-600" />
        </button>
      )}

      <div className={showDemoNav ? 'pt-32' : 'pt-0'}>
        {view === 'landing' && <Landing setView={setView} />}
        {view === 'facilitator' && <FacilitatorView step={step} setStep={setStep} />}
        {view === 'participant' && <ParticipantView step={step} />}
        {view === 'admin' && <AdminView />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 데모용 네비게이션
// ─────────────────────────────────────────────────────────
function DemoNav({ view, setView, step, setStep, onClose }) {
  const steps = ['입장', '가치선정', '조별작성', '조별발표', '투표', '최종확정'];
  
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-stone-500 font-medium">
            🛠️ 데모 네비게이션 (실제 배포 시 제거)
          </div>
          <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600">
            숨기기
          </button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            <button 
              onClick={() => setView('landing')}
              className={`px-3 py-1.5 text-xs rounded-md ${view === 'landing' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
            >
              랜딩
            </button>
            <button 
              onClick={() => setView('facilitator')}
              className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 ${view === 'facilitator' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
            >
              <Monitor size={12} /> 팀장 화면
            </button>
            <button 
              onClick={() => setView('participant')}
              className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 ${view === 'participant' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
            >
              <Smartphone size={12} /> 팀원 화면
            </button>
            <button 
              onClick={() => setView('admin')}
              className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 ${view === 'admin' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
            >
              <LayoutDashboard size={12} /> 어드민
            </button>
          </div>
          <div className="w-px h-5 bg-stone-200" />
          <div className="flex gap-1 flex-wrap">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`px-2.5 py-1.5 text-xs rounded-md ${step === i ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                {i}. {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 랜딩 화면
// ─────────────────────────────────────────────────────────
function Landing({ setView }) {
  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
          <Crown className="text-emerald-700" size={28} />
        </div>
        <div className="text-xs text-emerald-700 font-medium tracking-widest uppercase mb-1">
          MK Summer Camp 2026
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          우리 팀의 그라운드룰
        </h1>
        <p className="text-stone-500 text-sm">
          함께 일하는 약속을 직접 만들어요
        </p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => setView('facilitator')}
          className="w-full bg-white border border-stone-200 rounded-2xl p-5 text-left hover:border-emerald-700 transition group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-emerald-700 text-white rounded-xl p-3">
              <Users size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-stone-900 mb-0.5">팀장으로 시작</div>
              <div className="text-sm text-stone-500">세션을 만들고 진행해요</div>
            </div>
            <ChevronRight className="text-stone-400 group-hover:text-emerald-700 mt-3" size={18} />
          </div>
        </button>

        <button 
          onClick={() => setView('participant')}
          className="w-full bg-white border border-stone-200 rounded-2xl p-5 text-left hover:border-emerald-700 transition group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500 text-white rounded-xl p-3">
              <User size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-stone-900 mb-0.5">팀원으로 참여</div>
              <div className="text-sm text-stone-500">코드를 입력해서 참여해요</div>
            </div>
            <ChevronRight className="text-stone-400 group-hover:text-emerald-700 mt-3" size={18} />
          </div>
        </button>
      </div>

      <div className="mt-10 pt-6 border-t border-stone-200">
        <div className="text-xs text-stone-400 text-center tracking-wide">
          PEACE · JOY · RIGHTEOUSNESS  ·  ROMANS 14:17
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 팀장 화면
// ─────────────────────────────────────────────────────────
function FacilitatorView({ step, setStep }) {
  const [showGuide, setShowGuide] = useState(true);
  
  const stepTitles = [
    '입장 대기', 
    '1단계 · 우리 팀의 가치', 
    '2단계 · 조별 그라운드룰 작성',
    '3단계 · 조별 발표',
    '4단계 · 최종 투표',
    '5단계 · 최종 확정'
  ];

  const stepTimes = ['—', '10분', '15분', '12분', '10분', '5분'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-stone-500 mb-1">참가자관리팀 · 세션 코드 7392</div>
          <h1 className="text-xl font-bold text-stone-900">{stepTitles[step]}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-3 py-1.5">
            <Clock size={14} className="text-stone-500" />
            <span className="text-sm font-medium text-stone-700">{stepTimes[step]}</span>
          </div>
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="bg-white border border-stone-200 rounded-lg p-2"
          >
            {showGuide ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${showGuide ? 'lg:grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>
        <div>
          {step === 0 && <FacStep0 />}
          {step === 1 && <FacStep1 />}
          {step === 2 && <FacStep2 />}
          {step === 3 && <FacStep3 />}
          {step === 4 && <FacStep4 />}
          {step === 5 && <FacStep5 />}
        </div>
        
        {showGuide && <FacilitatorGuide step={step} />}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button 
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-sm text-stone-500 hover:text-stone-900 disabled:opacity-30"
        >
          ← 이전
        </button>
        <button 
          onClick={() => setStep(Math.min(5, step + 1))}
          disabled={step === 5}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-30"
        >
          다음 단계로 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 팀장 가이드 사이드패널
// ─────────────────────────────────────────────────────────
function FacilitatorGuide({ step }) {
  const guides = [
    {
      title: '입장 안내',
      scripts: [
        '"안녕하세요! 지금부터 우리 팀이 함께 일할 때 지킬 약속을 만들 거예요."',
        '"휴대폰으로 사이트에 접속해서 세션 코드 [7392] 입력해주세요."',
        '"닉네임 입력 후 \'참여하기\' 눌러주시면 됩니다."',
      ],
      tip: '모두 입장하면 다음 단계로!'
    },
    {
      title: '1단계: 가치 선정',
      scripts: [
        '"우리 팀이 캠프 2주 동안 가장 중요하게 여기고 싶은 가치를 골라봅시다."',
        '"화면에 나오는 12개 중 가장 마음에 드는 3개를 선택해주세요."',
        '"추가하고 싶은 가치가 있다면 자유롭게 적어주셔도 좋습니다."',
        '"3분 드리겠습니다. 끝나면 결과를 함께 볼게요."',
        '(이후) "투표 결과를 보고 우리 팀이 함께 가져갈 핵심 가치 3개를 제가 정리해서 확정하겠습니다."',
      ],
      tip: '주관식 답변에 좋은 게 있으면 꼭 읽어주세요. 핵심 가치는 팀장이 최종 결정합니다.'
    },
    {
      title: '2단계: 조별 작성',
      scripts: [
        '"이제 4-5명씩 조를 나눠서 구체적인 그라운드룰을 만들어볼게요."',
        '"조별로 모여서 화면에 보이는 우리 팀 핵심 가치와 예시들을 참고하며 이야기 나눠봅시다."',
        '"\'서로 존중한다\' 같은 추상적인 말은 피하고, \'회의 시작 5분 전에 도착한다\' 처럼 구체적인 행동으로 적어주세요."',
        '"조별로 3개씩 작성해서 제출해주세요. 15분 드리겠습니다."',
      ],
      tip: '조별로 토의가 잘 안 되면 직접 가서 한 명씩 의견 묻기'
    },
    {
      title: '3단계: 조별 발표',
      scripts: [
        '"이제 각 조에서 만든 그라운드룰을 함께 나눠볼게요."',
        '"1조부터 한 명씩 나와서 본인 조에서 만든 룰을 읽어주세요."',
        '"읽을 때 \'왜 이게 중요한지\' 한 문장 곁들여 주시면 좋아요."',
      ],
      tip: '발표 조를 차례로 선택하면 모두에게 해당 조의 후보가 표시됩니다'
    },
    {
      title: '4단계: 최종 투표',
      scripts: [
        '"모든 조의 후보를 함께 봤으니, 이제 최종적으로 우리 팀의 그라운드룰을 정해봅시다."',
        '"각자 가장 지키고 싶은 룰 3개에 투표해주세요."',
        '"투표는 익명입니다. 마음 가는 대로 골라주세요."',
        '"3분 드리겠습니다."',
      ],
      tip: '실시간 결과는 모두에게 보이지 않게, 팀장 화면에만 표시됩니다'
    },
    {
      title: '5단계: 최종 확정',
      scripts: [
        '"투표 결과를 보고 팀장으로서 문구를 살짝 다듬은 후 최종 확정하겠습니다."',
        '(편집 후) "우리 팀의 그라운드룰이 정해졌습니다! 함께 큰 소리로 읽어볼까요?"',
        '(다 같이 낭독)',
        '"이 약속들은 캠프 기간 동안 우리 팀 공간에 붙여놓을 거예요."',
        '"수고 많으셨습니다! 좋은 캠프 만들어봅시다."',
      ],
      tip: '문구가 추상적이거나 어색하면 자유롭게 다듬어주세요. 확정 후 모든 팀원에게 공유됩니다.'
    }
  ];

  const g = guides[step];

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 h-fit lg:sticky lg:top-32">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={16} className="text-emerald-700" />
        <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
          진행 가이드
        </span>
      </div>
      <h3 className="font-bold text-stone-900 mb-3">{g.title}</h3>
      <div className="space-y-2 mb-4">
        {g.scripts.map((s, i) => (
          <p key={i} className="text-sm text-stone-700 leading-relaxed">{s}</p>
        ))}
      </div>
      <div className="bg-white border border-emerald-200 rounded-lg p-3 flex gap-2">
        <Lightbulb size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-700">{g.tip}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 팀장 화면 - 각 단계
// ─────────────────────────────────────────────────────────
function FacStep0() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-8">
      <div className="text-center mb-8">
        <div className="text-xs text-stone-500 mb-2">화면에 표시하거나 직접 안내</div>
        <div className="text-6xl font-bold text-stone-900 tracking-tight mb-2">7392</div>
        <div className="text-sm text-stone-500">세션 코드</div>
      </div>
      <div className="border-t border-stone-100 pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-stone-700">참여자 ({MOCK_PARTICIPANTS.length}/20)</span>
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            실시간
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOCK_PARTICIPANTS.map((name, i) => (
            <span key={i} className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ★ 개선: 팀장이 핵심 가치를 직접 선택
function FacStep1() {
  const [selectedValues, setSelectedValues] = useState(['v2', 'v4', 'v3']);
  const [confirmed, setConfirmed] = useState(false);
  
  const sorted = Object.entries(MOCK_VALUE_VOTES).sort((a, b) => b[1] - a[1]);
  const max = sorted[0][1];

  const toggleValue = (id) => {
    if (confirmed) return;
    if (selectedValues.includes(id)) {
      setSelectedValues(selectedValues.filter(v => v !== id));
    } else if (selectedValues.length < 3) {
      setSelectedValues([...selectedValues, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-1 gap-4">
          <div>
            <h3 className="font-semibold text-stone-900">가치 투표 결과</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              결과를 보고 우리 팀의 핵심 가치 3개를 직접 선택해 확정해주세요
            </p>
          </div>
          <div className="text-xs text-stone-500 flex-shrink-0 mt-1">18/20 응답</div>
        </div>
        
        <div className="bg-emerald-50 rounded-lg px-3 py-2 my-3 text-xs text-emerald-800">
          선택됨: {selectedValues.length > 0 
            ? selectedValues.map(id => PRESET_VALUES.find(v => v.id === id).label).join(', ')
            : '없음'} ({selectedValues.length}/3)
        </div>
        
        <div className="space-y-1">
          {sorted.map(([id, count]) => {
            const value = PRESET_VALUES.find(v => v.id === id);
            const pct = (count / max) * 100;
            const isSelected = selectedValues.includes(id);
            const isDisabled = !isSelected && selectedValues.length >= 3;
            return (
              <button 
                key={id}
                onClick={() => toggleValue(id)}
                disabled={confirmed || isDisabled}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition text-left ${
                  isSelected ? 'bg-emerald-50' : 'hover:bg-stone-50'
                } ${(confirmed || isDisabled) ? 'cursor-default opacity-60' : ''}`}
              >
                <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center ${
                  isSelected ? 'bg-emerald-600' : 'border-2 border-stone-300'
                }`}>
                  {isSelected && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="w-16 text-sm font-medium text-stone-700">
                  {value.label}
                </div>
                <div className="flex-1 bg-stone-100 rounded-full h-7 relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${isSelected ? 'bg-emerald-500' : 'bg-stone-300'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-stone-600 text-right">{count}</div>
              </button>
            );
          })}
        </div>
        
        {!confirmed ? (
          <button
            onClick={() => setConfirmed(true)}
            disabled={selectedValues.length === 0}
            className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-40"
          >
            우리 팀의 핵심 가치로 확정
          </button>
        ) : (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex gap-2">
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              핵심 가치가 확정되었습니다. 모든 팀원의 2단계 화면에 표시됩니다.
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <h3 className="font-semibold text-stone-900 mb-3">추가 제안된 가치</h3>
        <div className="space-y-2">
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-sm text-stone-700">
            "유머감각" — 즐겁게 일하려면 필요해요
          </div>
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-sm text-stone-700">
            "기도" — 시작 전에 함께 기도하는 마음
          </div>
        </div>
      </div>
    </div>
  );
}

function FacStep2() {
  const groups = [
    { id: 1, members: ['지윤', '서준', '하은', '도현', '예린'], submitted: 3 },
    { id: 2, members: ['민준', '소율', '시우', '채원', '준우'], submitted: 3 },
    { id: 3, members: ['나은', '윤호', '다인', '태민', '수아'], submitted: 2 },
    { id: 4, members: ['건우', '리아', '재현', '유진', '현우'], submitted: 3 },
  ];

  return (
    <div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
        <div className="text-xs text-emerald-700 font-medium mb-1">우리 팀의 핵심 가치 (1단계에서 확정됨)</div>
        <div className="flex gap-1.5 flex-wrap">
          {SELECTED_CORE_VALUES.map(id => {
            const v = PRESET_VALUES.find(x => x.id === id);
            return (
              <span key={id} className="bg-white px-3 py-1 rounded-md text-sm font-medium text-emerald-800 border border-emerald-200">
                {v.label}
              </span>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {groups.map(g => (
          <div key={g.id} className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-stone-900">{g.id}조</div>
              <div className={`text-xs px-2 py-0.5 rounded-md ${g.submitted >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {g.submitted >= 3 ? '완료' : '작성 중'} {g.submitted}/3
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {g.members.map((m, i) => (
                <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                  {m}
                </span>
              ))}
            </div>
            <div className="space-y-1.5 pt-3 border-t border-stone-100">
              {MOCK_RULE_CANDIDATES.filter(r => r.group === g.id).slice(0, g.submitted).map(r => (
                <div key={r.id} className="text-sm text-stone-700 flex gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FacStep3() {
  const [activeGroup, setActiveGroup] = useState(1);
  const candidates = MOCK_RULE_CANDIDATES.filter(r => r.group === activeGroup);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <div className="text-sm text-stone-500 mb-3">발표 중인 조 선택</div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeGroup === g 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {g}조
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-emerald-600" />
          <h3 className="font-semibold text-stone-900">{activeGroup}조의 그라운드룰</h3>
        </div>
        <div className="space-y-3">
          {candidates.map(r => {
            const value = PRESET_VALUES.find(v => v.id === r.value);
            return (
              <div key={r.id} className="bg-stone-50 rounded-xl p-4">
                <div className="text-xs text-emerald-700 font-medium mb-1">
                  {value.label} 와 연결
                </div>
                <div className="text-base text-stone-900">{r.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FacStep4() {
  const sorted = Object.entries(MOCK_RULE_VOTES).sort((a, b) => b[1] - a[1]);
  const max = sorted[0][1];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-900">실시간 투표 현황 (팀장만 보임)</h3>
        <div className="text-xs text-stone-500">15/20 응답</div>
      </div>
      <div className="space-y-2">
        {sorted.map(([id, count], i) => {
          const rule = MOCK_RULE_CANDIDATES.find(r => r.id === id);
          const pct = (count / max) * 100;
          const isTop = i < 4;
          return (
            <div key={id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isTop && <span className="text-emerald-600 text-xs">●</span>}
                  <span className="text-sm text-stone-700 truncate">{rule.text}</span>
                </div>
                <div className="bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isTop ? 'bg-emerald-500' : 'bg-stone-300'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="w-8 text-sm text-stone-600 text-right">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ★ 개선: 최종 확정 전 각 룰 수정 가능
function FacStep5() {
  const initialRules = Object.entries(MOCK_RULE_VOTES)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, count]) => ({
      id,
      text: MOCK_RULE_CANDIDATES.find(r => r.id === id).text,
      votes: count
    }));
  
  const [rules, setRules] = useState(initialRules);
  const [editingId, setEditingId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const updateRule = (id, newText) => {
    setRules(rules.map(r => r.id === id ? { ...r, text: newText } : r));
  };

  const removeRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  if (confirmed) {
    return <CelebrationCard rules={rules} onEdit={() => setConfirmed(false)} />;
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <h3 className="font-semibold text-stone-900 mb-1">최종 확정 전 검토</h3>
      <p className="text-sm text-stone-500 mb-5">
        문구를 다듬거나 수정한 후 확정해주세요. 확정 시 모든 팀원에게 공유됩니다.
      </p>
      
      <div className="space-y-3 mb-6">
        {rules.map((r, i) => (
          <div key={r.id} className="flex gap-3 items-start">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1">
              {editingId === r.id ? (
                <div>
                  <textarea
                    value={r.text}
                    onChange={(e) => updateRule(r.id, e.target.value)}
                    autoFocus
                    rows={2}
                    className="w-full px-3 py-2 border-2 border-emerald-500 rounded-lg text-sm focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-md"
                    >
                      완료
                    </button>
                    <button
                      onClick={() => removeRule(r.id)}
                      className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-md"
                    >
                      이 룰 삭제
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingId(r.id)}
                  className="w-full text-left bg-stone-50 hover:bg-stone-100 rounded-lg p-3 group relative"
                >
                  <div className="text-sm text-stone-900 pr-8">{r.text}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-stone-400">{r.votes}표</span>
                    <span className="text-xs text-emerald-600 ml-auto group-hover:underline">수정</span>
                  </div>
                  <Edit2 size={14} className="absolute top-3 right-3 text-stone-400 group-hover:text-emerald-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => setConfirmed(true)}
          disabled={rules.length === 0}
          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          최종 확정 및 팀원에게 공유
        </button>
      </div>
      
      <p className="text-xs text-stone-400 mt-3 text-center">
        팀장 권한으로 문구를 다듬거나 어색한 표현을 정리할 수 있습니다
      </p>
    </div>
  );
}

function CelebrationCard({ rules, onEdit }) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-200 rounded-2xl p-8">
      <div className="text-center mb-6">
        <Crown size={32} className="text-emerald-700 mx-auto mb-3" />
        <div className="text-xs text-emerald-700 font-medium tracking-widest uppercase mb-1">
          참가자관리팀
        </div>
        <h2 className="text-2xl font-bold text-stone-900">우리의 그라운드룰</h2>
        <div className="text-xs text-stone-400 mt-1">MK Summer Camp 2026</div>
      </div>
      <div className="space-y-3 mb-6">
        {rules.map((r, i) => (
          <div key={r.id} className="bg-white rounded-xl p-4 flex gap-4 items-start shadow-sm border border-emerald-100">
            <div className="text-2xl font-bold text-emerald-700">{i + 1}</div>
            <div className="flex-1 text-stone-900 text-base leading-relaxed pt-0.5">
              {r.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="bg-white border border-stone-200 text-stone-700 py-2.5 px-4 rounded-lg text-sm font-medium">
          다시 수정
        </button>
        <button className="flex-1 bg-stone-900 text-white py-2.5 rounded-lg text-sm font-medium">
          이미지로 저장
        </button>
        <button className="flex-1 bg-white border border-stone-200 text-stone-900 py-2.5 rounded-lg text-sm font-medium">
          단톡방 공유
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 참여자 화면
// ─────────────────────────────────────────────────────────
function ParticipantView({ step }) {
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-stone-500">참가자관리팀 · 지윤</div>
          <div className="text-xs text-stone-500">{step}/5</div>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div 
              key={i}
              className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-emerald-600' : 'bg-stone-200'}`}
            />
          ))}
        </div>
      </div>

      {step === 0 && <PartStep0 />}
      {step === 1 && <PartStep1 />}
      {step === 2 && <PartStep2 />}
      {step === 3 && <PartStep3 />}
      {step === 4 && <PartStep4 />}
      {step === 5 && <PartStep5 />}
    </div>
  );
}

function PartStep0() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4 animate-pulse">
        <Clock className="text-emerald-700" size={24} />
      </div>
      <h2 className="text-lg font-semibold text-stone-900 mb-2">
        곧 시작합니다
      </h2>
      <p className="text-sm text-stone-500">
        팀장님이 시작하면 자동으로 다음 화면으로 넘어갑니다
      </p>
    </div>
  );
}

function PartStep1() {
  const [selected, setSelected] = useState(['v2', 'v4']);
  const [openInput, setOpenInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(v => v !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-stone-900 mb-1">제출 완료!</h2>
        <p className="text-sm text-stone-500">다른 팀원을 기다리는 중...</p>
        <p className="text-xs text-stone-400 mt-3">18/20 응답</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-stone-900 mb-1">
        우리 팀의 가치를 골라주세요
      </h2>
      <p className="text-sm text-stone-500 mb-5">
        가장 중요하게 여기고 싶은 3개를 선택 ({selected.length}/3)
      </p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {PRESET_VALUES.map(v => {
          const isSelected = selected.includes(v.id);
          const isDisabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={v.id}
              onClick={() => toggle(v.id)}
              disabled={isDisabled}
              className={`p-3 rounded-xl text-left border-2 transition ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : isDisabled
                  ? 'border-stone-100 bg-stone-50 opacity-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="font-semibold text-stone-900 text-sm mb-0.5">{v.label}</div>
              <div className="text-xs text-stone-500">{v.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-stone-700 mb-2 block">
          추가하고 싶은 가치가 있나요? (선택)
        </label>
        <input
          type="text"
          value={openInput}
          onChange={(e) => setOpenInput(e.target.value)}
          placeholder="예: 유머감각, 기도, 회복력..."
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
        />
      </div>

      <button
        onClick={() => setSubmitted(true)}
        disabled={selected.length === 0}
        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40"
      >
        제출하기 <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ★ 개선: 핵심 가치와 연결된 예시 표시 (클릭하면 입력란에 자동 채워짐)
function PartStep2() {
  const [rules, setRules] = useState(['', '', '']);
  const [submitted, setSubmitted] = useState(false);

  const fillExample = (text) => {
    const emptyIndex = rules.findIndex(r => !r.trim());
    if (emptyIndex !== -1) {
      const next = [...rules];
      next[emptyIndex] = text;
      setRules(next);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-stone-900 mb-1">조 제출 완료!</h2>
        <p className="text-sm text-stone-500">다른 조를 기다리는 중...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
        <div className="text-xs text-emerald-700 font-medium mb-1">당신은 1조 입니다</div>
        <div className="text-sm text-stone-700">
          멤버: 지윤, 서준, 하은, 도현, 예린
        </div>
      </div>

      <h2 className="text-lg font-bold text-stone-900 mb-1">
        그라운드룰을 만들어요
      </h2>
      <p className="text-sm text-stone-500 mb-4">
        우리 팀 핵심 가치를 지키려면 어떻게 행동해야 할까요?
      </p>

      {/* 우리 팀 핵심 가치와 연결된 예시 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-emerald-700" />
          <span className="text-sm font-semibold text-emerald-900">
            우리 팀의 핵심 가치와 연결된 예시
          </span>
        </div>
        <div className="space-y-3">
          {SELECTED_CORE_VALUES.map(vid => {
            const value = PRESET_VALUES.find(v => v.id === vid);
            return (
              <div key={vid}>
                <div className="text-xs font-bold text-emerald-700 mb-1.5">
                  {value.label}
                </div>
                <div className="space-y-1.5">
                  {VALUE_RULE_EXAMPLES[vid].map((ex, i) => (
                    <button 
                      key={i}
                      onClick={() => fillExample(ex)}
                      className="w-full text-left text-sm text-stone-700 bg-white px-3 py-2 rounded-lg border border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50 flex justify-between items-center gap-2"
                    >
                      <span>· {ex}</span>
                      <Plus size={12} className="text-emerald-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-emerald-700 mt-3">
          마음에 드는 예시를 누르면 아래 입력란에 자동으로 채워져요
        </p>
      </div>

      {/* 좋은/나쁜 예시 (접이식) */}
      <details className="mb-5 bg-white border border-stone-200 rounded-xl">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-stone-700 flex items-center gap-2">
          <Lightbulb size={14} className="text-emerald-600" />
          좋은 그라운드룰이란?
        </summary>
        <div className="px-4 pb-4 space-y-3 border-t border-stone-100 pt-3">
          <div>
            <div className="text-xs text-emerald-600 font-medium mb-1.5">✓ 좋은 예시</div>
            <ul className="space-y-1">
              {RULE_EXAMPLES.good.map((e, i) => (
                <li key={i} className="text-xs text-stone-600">· {e}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs text-rose-600 font-medium mb-1.5">✗ 피해야 할 예시</div>
            <ul className="space-y-1">
              {RULE_EXAMPLES.bad.map((e, i) => (
                <li key={i} className="text-xs text-stone-600">· {e}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <div className="space-y-3 mb-6">
        {rules.map((r, i) => (
          <div key={i}>
            <label className="text-xs text-stone-500 mb-1 block">룰 {i + 1}</label>
            <input
              type="text"
              value={r}
              onChange={(e) => {
                const next = [...rules];
                next[i] = e.target.value;
                setRules(next);
              }}
              placeholder="구체적인 행동으로 작성"
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => setSubmitted(true)}
        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
      >
        조의 의견으로 제출 <Send size={16} />
      </button>
      <p className="text-xs text-stone-400 text-center mt-2">
        조원이 함께 의논해서 마지막 한 명이 제출하면 됩니다
      </p>
    </div>
  );
}

function PartStep3() {
  const [currentGroup, setCurrentGroup] = useState(1);
  const candidates = MOCK_RULE_CANDIDATES.filter(r => r.group === currentGroup);

  return (
    <div>
      <h2 className="text-lg font-bold text-stone-900 mb-1">
        조별 발표
      </h2>
      <p className="text-sm text-stone-500 mb-5">
        지금 발표 중인 조의 그라운드룰
      </p>

      <div className="bg-emerald-900 text-white rounded-2xl p-6 mb-4">
        <div className="text-xs text-emerald-300 mb-3">발표 중</div>
        <div className="text-3xl font-bold mb-4">{currentGroup}조</div>
        <div className="space-y-3">
          {candidates.map(r => {
            const value = PRESET_VALUES.find(v => v.id === r.value);
            return (
              <div key={r.id} className="bg-emerald-800 rounded-xl p-4">
                <div className="text-xs text-emerald-300 mb-1">{value.label}</div>
                <div className="text-base">{r.text}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4].map(g => (
          <button
            key={g}
            onClick={() => setCurrentGroup(g)}
            className={`w-2 h-2 rounded-full ${currentGroup === g ? 'bg-emerald-700' : 'bg-stone-300'}`}
          />
        ))}
      </div>
    </div>
  );
}

function PartStep4() {
  const [votes, setVotes] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id) => {
    if (votes.includes(id)) {
      setVotes(votes.filter(v => v !== id));
    } else if (votes.length < 3) {
      setVotes([...votes, id]);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-stone-900 mb-1">투표 완료!</h2>
        <p className="text-sm text-stone-500">결과를 기다리는 중...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-stone-900 mb-1">
        가장 지키고 싶은 룰
      </h2>
      <p className="text-sm text-stone-500 mb-5">
        3개를 골라주세요 ({votes.length}/3)
      </p>

      <div className="space-y-2 mb-6">
        {MOCK_RULE_CANDIDATES.map(r => {
          const isSelected = votes.includes(r.id);
          const isDisabled = !isSelected && votes.length >= 3;
          const value = PRESET_VALUES.find(v => v.id === r.value);
          return (
            <button
              key={r.id}
              onClick={() => toggle(r.id)}
              disabled={isDisabled}
              className={`w-full p-4 rounded-xl text-left border-2 transition ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : isDisabled
                  ? 'border-stone-100 bg-stone-50 opacity-50'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-emerald-600' : 'border-2 border-stone-300'}`}>
                  {isSelected && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-stone-500 mb-1">
                    {r.group}조 · {value.label}
                  </div>
                  <div className="text-sm text-stone-900">{r.text}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setSubmitted(true)}
        disabled={votes.length === 0}
        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40"
      >
        투표 제출 <Vote size={16} />
      </button>
    </div>
  );
}

function PartStep5() {
  const sorted = Object.entries(MOCK_RULE_VOTES).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <div className="text-center mb-6">
          <Crown size={36} className="text-emerald-700 mx-auto mb-3" />
          <div className="text-xs text-emerald-700 font-medium tracking-widest uppercase mb-1">
            참가자관리팀
          </div>
          <h2 className="text-xl font-bold text-stone-900">우리의 그라운드룰</h2>
          <div className="text-xs text-stone-400 mt-1">MK Summer Camp 2026</div>
        </div>
        <div className="space-y-3 mb-6">
          {sorted.map(([id, count], i) => {
            const rule = MOCK_RULE_CANDIDATES.find(r => r.id === id);
            return (
              <div key={id} className="bg-white border border-emerald-100 rounded-xl p-4 flex gap-3 items-start">
                <div className="text-xl font-bold text-emerald-700">{i + 1}</div>
                <div className="flex-1 text-stone-900 text-sm leading-relaxed pt-0.5">
                  {rule.text}
                </div>
              </div>
            );
          })}
        </div>
        <button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-medium text-sm">
          결과 저장하기
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ★ 어드민 페이지 (PC + 모바일 반응형)
// ─────────────────────────────────────────────────────────
function AdminView() {
  const teams = MOCK_ADMIN_TEAMS;
  const totalJoined = teams.reduce((s, t) => s + t.joined, 0);
  const totalExpected = teams.reduce((s, t) => s + t.total, 0);
  const completed = teams.filter(t => t.step === 5 && t.finalRules).length;
  const inProgress = teams.filter(t => t.step > 0 && t.step < 5).length;
  const waiting = teams.filter(t => t.step === 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* 헤더 */}
      <header className="mb-6 lg:mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-emerald-700 font-medium tracking-widest uppercase mb-1">
            MK Summer Camp 2026 · 운영 대시보드
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">
            전체 팀 진행 현황
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            5개 팀의 워크숍 진행 상황을 실시간으로 확인합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-3 py-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-stone-700">실시간</span>
          </div>
          <button className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hidden sm:block">
            전체 결과 내보내기
          </button>
        </div>
      </header>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <StatCard 
          icon={<Users size={18} />} 
          label="총 참여" 
          value={`${totalJoined}`} 
          sub={`/ ${totalExpected}명`} 
        />
        <StatCard 
          icon={<Activity size={18} />} 
          label="진행 중" 
          value={`${inProgress}`} 
          sub="팀" 
        />
        <StatCard 
          icon={<Crown size={18} />} 
          label="확정 완료" 
          value={`${completed}`} 
          sub="팀" 
          highlight 
        />
        <StatCard 
          icon={<Clock size={18} />} 
          label="대기" 
          value={`${waiting}`} 
          sub="팀" 
        />
      </div>

      {/* 팀 카드 그리드 (모바일 1열 / 태블릿 2열 / PC 3열) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.map(team => <TeamCard key={team.id} team={team} />)}
      </div>

      {/* 푸터 */}
      <div className="mt-8 lg:mt-10 text-xs text-stone-400 text-center">
        모든 팀의 데이터는 실시간으로 자동 갱신됩니다
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, highlight = false }) {
  return (
    <div className={`border rounded-xl p-4 ${
      highlight 
        ? 'bg-emerald-50 border-emerald-200' 
        : 'bg-white border-stone-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-stone-500 font-medium">{label}</span>
        <span className={highlight ? 'text-emerald-600' : 'text-stone-400'}>
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl lg:text-3xl font-bold ${
          highlight ? 'text-emerald-700' : 'text-stone-900'
        }`}>
          {value}
        </span>
        <span className="text-xs text-stone-500">{sub}</span>
      </div>
    </div>
  );
}

function TeamCard({ team }) {
  const stepNames = ['입장 대기', '가치 선정', '조별 작성', '조별 발표', '최종 투표', '확정 완료'];
  const stepName = stepNames[team.step];
  const isComplete = team.step === 5 && team.finalRules;
  const isWaiting = team.step === 0;
  const joinRate = Math.round(team.joined / team.total * 100);
  
  return (
    <div className={`bg-white border rounded-2xl p-5 transition-all ${
      isComplete 
        ? 'border-emerald-300 shadow-sm' 
        : 'border-stone-200 hover:border-stone-300'
    }`}>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-stone-900 text-base mb-0.5 truncate">
            {team.name}
          </h3>
          <div className="text-xs text-stone-500">정원 {team.total}명</div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
          isComplete ? 'bg-emerald-100 text-emerald-800' :
          isWaiting ? 'bg-stone-100 text-stone-600' :
          'bg-emerald-50 text-emerald-700'
        }`}>
          {stepName}
        </span>
      </div>

      {/* 진행 단계 표시 (6 segments) */}
      <div className="flex gap-1 mb-4">
        {[0, 1, 2, 3, 4, 5].map(s => (
          <div 
            key={s}
            className={`flex-1 h-1.5 rounded-full ${
              s < team.step ? 'bg-emerald-500' :
              s === team.step ? (isComplete ? 'bg-emerald-500' : 'bg-emerald-300 animate-pulse') :
              'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-xs text-stone-500 mb-1">입장</div>
          <div className="text-sm font-semibold text-stone-900">
            {team.joined}/{team.total}
            <span className="text-xs text-stone-400 ml-1">({joinRate}%)</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-stone-500 mb-1">현재 단계</div>
          <div className="text-sm font-semibold text-stone-900 truncate">
            {team.stepInfo}
          </div>
        </div>
      </div>

      {/* 확정된 룰 미리보기 (5단계 완료 시만) */}
      {isComplete && team.finalRules && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3">
          <div className="text-xs text-emerald-700 font-medium mb-2 flex items-center gap-1.5">
            <Crown size={12} /> 확정된 그라운드룰
          </div>
          <ul className="space-y-1.5">
            {team.finalRules.map((rule, i) => (
              <li key={i} className="text-xs text-stone-700 flex gap-2 leading-relaxed">
                <span className="text-emerald-700 font-bold flex-shrink-0">{i + 1}</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 액션 */}
      <button className="w-full text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center justify-center gap-1.5 py-2 rounded-lg transition">
        팀 세션 들여다보기
        <ExternalLink size={12} />
      </button>
    </div>
  );
}
