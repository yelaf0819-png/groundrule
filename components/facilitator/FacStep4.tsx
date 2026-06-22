"use client";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRuleVoteCounts } from "@/lib/hooks/useRuleVotes";
import { useParticipants, updateStep } from "@/lib/hooks/useSession";
import type { Session } from "@/lib/constants";

export default function FacStep4({ session }: { session: Session }) {
  const { counts, respondents } = useRuleVoteCounts(session.id);
  const participants = useParticipants(session.id);
  const [loading, setLoading] = useState(false);

  const seen = new Set<string>();
  const dedupedCounts = counts.filter((c) => {
    const key = c.text.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const max = dedupedCounts[0]?.count || 1;

  async function handleNext() {
    setLoading(true);
    await updateStep(session.id, 5);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-stone-900">실시간 투표 집계</h3>
            <p className="text-xs text-stone-500 mt-0.5">숲장만 볼 수 있습니다</p>
          </div>
          <span className="text-xs text-stone-500">{respondents}/{participants.length} 응답</span>
        </div>

        {dedupedCounts.length === 0 ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            투표 대기 중…
          </div>
        ) : (
          <div className="space-y-2">
            {dedupedCounts.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${i < 4 ? "bg-emerald-50" : ""}`}
              >
                {i < 4 && (
                  <span className="text-xs font-bold text-emerald-700 w-5">{i + 1}</span>
                )}
                {i >= 4 && <span className="w-5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800 truncate">{c.text}</p>
                  <p className="text-xs text-stone-400">{c.group_number}조</p>
                </div>
                <div className="w-24 bg-stone-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i < 4 ? "bg-emerald-500" : "bg-stone-300"}`}
                    style={{ width: `${(c.count / max) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-stone-700 w-6 text-right">{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        5단계 최종 확정으로 <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
