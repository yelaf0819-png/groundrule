"use client";
import { useParticipants, updateStep } from "@/lib/hooks/useSession";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Session } from "@/lib/constants";

export default function FacStep0({ session }: { session: Session }) {
  const participants = useParticipants(session.id);
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    setLoading(true);
    await updateStep(session.id, 1);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* 세션 코드 */}
      <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
        <p className="text-xs text-stone-500 mb-2">화면에 표시하거나 직접 안내</p>
        <div className="text-7xl font-bold text-stone-900 tracking-tight mb-2">
          {session.code}
        </div>
        <p className="text-sm text-stone-500">세션 코드</p>
      </div>

      {/* 참여자 목록 */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-stone-700">
            참여자 ({participants.length}명)
          </span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
            실시간
          </div>
        </div>
        {participants.length === 0 ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            참여자 대기 중…
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {participants.map((p) => (
              <span key={p.id} className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 다음 단계 */}
      <button
        onClick={handleNext}
        disabled={participants.length === 0 || loading}
        className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        1단계 가치 선정 시작
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
