"use client";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRuleCandidates, setPresentingGroup } from "@/lib/hooks/useGroups";
import { updateStep } from "@/lib/hooks/useSession";
import type { Session } from "@/lib/constants";

export default function FacStep3({ session }: { session: Session }) {
  const candidates = useRuleCandidates(session.id);
  const [loading, setLoading] = useState(false);
  const presenting = session.presenting_group;

  const groupNumbers = [...new Set(candidates.map((c) => c.group_number))].sort();

  async function handleSelect(g: number) {
    await setPresentingGroup(session.id, g);
  }

  async function handleNext() {
    setLoading(true);
    await updateStep(session.id, 4);
    setLoading(false);
  }

  const presentingCandidates = candidates.filter((c) => c.group_number === presenting);

  return (
    <div className="space-y-4">
      {/* 조 선택 버튼 */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <p className="text-sm text-stone-600 mb-3">발표할 조를 선택하세요 — 참여자 화면에 실시간으로 표시됩니다</p>
        <div className="flex gap-2 flex-wrap">
          {groupNumbers.map((g) => (
            <button
              key={g}
              onClick={() => handleSelect(g)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                presenting === g
                  ? "bg-emerald-700 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {g}조
            </button>
          ))}
        </div>
      </div>

      {/* 발표 중인 조 룰 */}
      {presentingCandidates.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h3 className="font-semibold text-stone-900 mb-3">{presenting}조 제안 룰</h3>
          <div className="space-y-2">
            {presentingCandidates.map((c) => (
              <div key={c.id} className="bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-800">
                {c.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        4단계 최종 투표 시작 <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
