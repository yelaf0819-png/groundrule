"use client";
import { useState } from "react";
import { BookOpen, Lightbulb, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const GUIDES = [
  {
    title: "입장 안내",
    scripts: [
      '"안녕하세요! 지금부터 우리 숲이 함께 생활할 때 지킬 약속을 만들 거예요."',
      '"휴대폰으로 사이트에 접속해서 세션 코드를 입력해주세요."',
      '"닉네임 입력 후 \'참여하기\' 눌러주시면 됩니다."',
    ],
    tip: "모두 입장하면 다음 단계로!",
  },
  {
    title: "1단계: 가치 선정",
    scripts: [
      '"우리 숲이 캠프 기간 동안 가장 중요하게 여기고 싶은 가치를 골라봅시다."',
      '"화면에 나오는 12개 중 가장 마음에 드는 3개를 선택해주세요."',
      '"추가하고 싶은 가치가 있다면 자유롭게 적어주셔도 좋습니다."',
      '"3분 드리겠습니다. 끝나면 결과를 함께 볼게요."',
      '(이후) "투표 결과를 보고 우리 숲이 함께 가져갈 핵심 가치 3개를 제가 정리해서 확정하겠습니다."',
    ],
    tip: "주관식 답변에 좋은 게 있으면 꼭 읽어주세요. 핵심 가치는 숲장이 최종 결정합니다.",
  },
  {
    title: "2단계: 조별 작성",
    scripts: [
      '"이제 4-5명씩 조를 나눠서 구체적인 그라운드룰을 만들어볼게요."',
      '"조별로 모여서 화면에 보이는 우리 숲 핵심 가치와 예시들을 참고하며 이야기 나눠봅시다."',
      '"\'서로 존중한다\' 같은 추상적인 말은 피하고, \'회의 시작 5분 전에 도착한다\' 처럼 구체적인 행동으로 적어주세요."',
      '"조별로 3개씩 작성해서 제출해주세요. 15분 드리겠습니다."',
    ],
    tip: "조별로 토의가 잘 안 되면 직접 가서 한 명씩 의견 묻기",
  },
  {
    title: "3단계: 조별 발표",
    scripts: [
      '"이제 각 조에서 만든 그라운드룰을 함께 나눠볼게요."',
      '"1조부터 한 명씩 나와서 본인 조에서 만든 룰을 읽어주세요."',
      '"읽을 때 \'왜 이게 중요한지\' 한 문장 곁들여 주시면 좋아요."',
    ],
    tip: "발표 조를 차례로 선택하면 모두에게 해당 조의 후보가 표시됩니다",
  },
  {
    title: "4단계: 최종 투표",
    scripts: [
      '"모든 조의 후보를 함께 봤으니, 이제 최종적으로 우리 숲의 그라운드룰을 정해봅시다."',
      '"각자 가장 지키고 싶은 룰 3개에 투표해주세요."',
      '"투표는 익명입니다. 마음 가는 대로 골라주세요."',
      '"3분 드리겠습니다."',
    ],
    tip: "실시간 결과는 숲장 화면에만 표시됩니다",
  },
  {
    title: "5단계: 최종 확정",
    scripts: [
      '"투표 결과를 보고 숲장으로서 문구를 살짝 다듬은 후 최종 확정하겠습니다."',
      '(편집 후) "우리 숲의 그라운드룰이 정해졌습니다! 함께 큰 소리로 읽어볼까요?"',
      '"이 약속들은 캠프 기간 동안 우리 숲 공간에 붙여놓을 거예요."',
      '"수고 많으셨습니다! 좋은 캠프 만들어봅시다."',
    ],
    tip: "문구가 추상적이거나 어색하면 자유롭게 다듬어주세요. 확정 후 모든 숲원에게 공유됩니다.",
  },
];

export default function FacilitatorGuide({ step }: { step: number }) {
  const [open, setOpen] = useState(true);
  const g = GUIDES[step] ?? GUIDES[0];

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 mb-3"
      >
        {open ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        진행 가이드
      </button>

      {open && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={15} className="text-emerald-700" />
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">진행 가이드</span>
          </div>
          <h3 className="font-bold text-stone-900 mb-3">{g.title}</h3>
          <div className="space-y-2 mb-4">
            {g.scripts.map((s, i) => (
              <p key={i} className="text-sm text-stone-700 leading-relaxed">{s}</p>
            ))}
          </div>
          <div className="bg-white border border-emerald-200 rounded-lg p-3 flex gap-2">
            <Lightbulb size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-stone-700">{g.tip}</p>
          </div>
        </div>
      )}
    </>
  );
}
