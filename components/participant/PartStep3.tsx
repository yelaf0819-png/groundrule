"use client";
import { useRuleCandidates } from "@/lib/hooks/useGroups";
import type { Session } from "@/lib/constants";

export default function PartStep3({ session }: { session: Session }) {
  const candidates = useRuleCandidates(session.id);
  const presenting = session.presenting_group;
  const presentingRules = candidates.filter((c) => c.group_number === presenting);

  return (
    <main className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-1">
            3단계 · 조별 발표
          </p>
          <h2 className="text-2xl font-bold text-white">
            {presenting}조 발표 중
          </h2>
        </div>

        {presentingRules.length > 0 ? (
          <div className="space-y-3">
            {presentingRules.map((rule, i) => (
              <div key={rule.id} className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-emerald-400 mt-0.5">{i + 1}</span>
                  <p className="text-white text-base leading-relaxed">{rule.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-emerald-400 text-sm">
            발표 준비 중입니다…
          </div>
        )}

        {/* 조 인디케이터 */}
        <div className="flex justify-center gap-2 mt-8">
          {[...new Set(candidates.map((c) => c.group_number))].sort().map((g) => (
            <div
              key={g}
              className={`w-2 h-2 rounded-full ${g === presenting ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
