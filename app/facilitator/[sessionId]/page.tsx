"use client";

import { use } from "react";
import { useSessionState } from "@/lib/hooks/useSession";
import FacilitatorGuide from "@/components/facilitator/FacilitatorGuide";
import FacStep0 from "@/components/facilitator/FacStep0";
import FacStep1 from "@/components/facilitator/FacStep1";
import FacStep2 from "@/components/facilitator/FacStep2";
import FacStep3 from "@/components/facilitator/FacStep3";
import FacStep4 from "@/components/facilitator/FacStep4";
import FacStep5 from "@/components/facilitator/FacStep5";
import { Loader2 } from "lucide-react";

const STEP_TITLES = [
  "입장 대기",
  "1단계 · 가치 선정",
  "2단계 · 조별 룰 작성",
  "3단계 · 조별 발표",
  "4단계 · 최종 투표",
  "5단계 · 최종 확정",
];
const STEP_TIMES = ["—", "10분", "15분", "12분", "10분", "5분"];

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default function FacilitatorPage({ params }: Props) {
  const { sessionId } = use(params);
  const { session, loading, error } = useSessionState(sessionId);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-rose-600 text-sm">세션을 불러올 수 없습니다.</p>
      </main>
    );
  }

  const step = session.current_step;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-stone-500 mb-0.5">
            {session.team_name} · 코드 {session.code}
          </p>
          <h1 className="text-xl font-bold text-stone-900">{STEP_TITLES[step]}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500 bg-white border border-stone-200 rounded-lg px-3 py-1.5">
          {STEP_TIMES[step]}
        </div>
      </div>

      {/* 진행 바 */}
      <div className="flex gap-1 mb-6">
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s < step ? "bg-emerald-500" : s === step ? "bg-emerald-700 animate-pulse" : "bg-stone-200"
            }`}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          {step === 0 && <FacStep0 session={session} />}
          {step === 1 && <FacStep1 session={session} />}
          {step === 2 && <FacStep2 session={session} />}
          {step === 3 && <FacStep3 session={session} />}
          {step === 4 && <FacStep4 session={session} />}
          {step === 5 && <FacStep5 session={session} />}
        </div>
        <div>
          <FacilitatorGuide step={step} />
        </div>
      </div>
    </div>
  );
}
