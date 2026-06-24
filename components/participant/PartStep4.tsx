"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRuleCandidates } from "@/lib/hooks/useGroups";
import { submitRuleVotes } from "@/lib/hooks/useRuleVotes";
import { MAX_RULE_VOTES, PRESET_VALUES } from "@/lib/constants";
import type { Session } from "@/lib/constants";

function getValueLabel(valueId: string | null): string | null {
  if (!valueId) return null;
  if (valueId.startsWith("custom:")) return valueId.slice(7);
  return PRESET_VALUES.find((v) => v.id === valueId)?.label ?? null;
}

export default function PartStep4({ session, participantId }: { session: Session; participantId: string }) {
  const candidates = useRuleCandidates(session.id);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : prev.length < MAX_RULE_VOTES ? [...prev, id] : prev
    );
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    setLoading(true);
    setError(null);
    const result = await submitRuleVotes(session.id, participantId, selected);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
        <h2 className="text-lg font-bold text-stone-900 mb-2">투표 완료!</h2>
        <p className="text-stone-500 text-sm">숲장이 결과를 집계하는 중입니다</p>
      </main>
    );
  }

  const seen = new Set<string>();
  const uniqueCandidates = candidates.filter((c) => {
    const key = c.text.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const groupNumbers = [...new Set(uniqueCandidates.map((c) => c.group_number))].sort();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-1">4단계</p>
          <h2 className="text-xl font-bold text-stone-900">최종 투표</h2>
          <p className="text-stone-500 text-sm mt-1">
            가장 지키고 싶은 룰 {MAX_RULE_VOTES}개를 선택해주세요
          </p>
        </div>

        <div className="bg-emerald-50 rounded-lg px-3 py-2 mb-4 text-xs text-emerald-800 text-center">
          {selected.length}/{MAX_RULE_VOTES}개 선택됨
        </div>

        <div className="space-y-4 mb-6">
          {groupNumbers.map((g) => {
            const groupRules = uniqueCandidates.filter((c) => c.group_number === g);
            return (
              <div key={g}>
                <p className="text-xs font-semibold text-stone-500 mb-2">{g}조</p>
                <div className="space-y-2">
                  {groupRules.map((c) => {
                    const isSelected = selected.includes(c.id);
                    const isDisabled = !isSelected && selected.length >= MAX_RULE_VOTES;
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggle(c.id)}
                        disabled={isDisabled}
                        className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : isDisabled
                            ? "border-stone-100 bg-stone-50 opacity-40"
                            : "border-stone-200 bg-white hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-stone-300"}`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            {getValueLabel(c.value_id) && (
                              <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 mb-1">
                                {getValueLabel(c.value_id)}
                              </span>
                            )}
                            <p className="text-sm text-stone-800 leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="text-rose-600 text-sm mb-3 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 || loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          투표 제출
        </button>
      </div>
    </main>
  );
}
