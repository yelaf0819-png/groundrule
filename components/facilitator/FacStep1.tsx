"use client";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useValueVoteCounts, useValueSuggestions, confirmCoreValues } from "@/lib/hooks/useValueVotes";
import { useParticipants } from "@/lib/hooks/useSession";
import { PRESET_VALUES } from "@/lib/constants";
import { updateStep } from "@/lib/hooks/useSession";
import type { Session } from "@/lib/constants";

export default function FacStep1({ session }: { session: Session }) {
  const { counts, respondents } = useValueVoteCounts(session.id);
  const suggestions = useValueSuggestions(session.id);
  const participants = useParticipants(session.id);
  const [selected, setSelected] = useState<string[]>(session.core_value_ids ?? []);
  const [confirmed, setConfirmed] = useState(session.core_value_ids.length > 0);
  const [loading, setLoading] = useState(false);

  const sorted = [...counts].sort((a, b) => b.count - a.count);
  const max = sorted[0]?.count || 1;

  function toggle(id: string) {
    if (confirmed) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  async function handleConfirm() {
    if (selected.length === 0) return;
    setLoading(true);
    await confirmCoreValues(session.id, selected);
    setConfirmed(true);
    setLoading(false);
  }

  async function handleNext() {
    setLoading(true);
    await updateStep(session.id, 2);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* 투표 결과 */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-2 gap-4">
          <div>
            <h3 className="font-semibold text-stone-900">가치 투표 결과</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              결과를 보고 우리 팀의 핵심 가치 3개를 직접 선택해 확정해주세요
            </p>
          </div>
          <span className="text-xs text-stone-500 flex-shrink-0 mt-1">
            {respondents}/{participants.length} 응답
          </span>
        </div>

        <div className="bg-emerald-50 rounded-lg px-3 py-2 my-3 text-xs text-emerald-800">
          선택됨:{" "}
          {selected.length > 0
            ? selected.map((id) => PRESET_VALUES.find((v) => v.id === id)?.label).join(", ")
            : "없음"}{" "}
          ({selected.length}/3)
        </div>

        <div className="space-y-1">
          {sorted.map(({ id, label, count }) => {
            const isSelected = selected.includes(id);
            const isDisabled = !isSelected && selected.length >= 3;
            const pct = max > 0 ? (count / max) * 100 : 0;
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                disabled={confirmed || isDisabled}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition text-left ${
                  isSelected ? "bg-emerald-50" : "hover:bg-stone-50"
                } ${confirmed || isDisabled ? "cursor-default opacity-60" : ""}`}
              >
                <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 ${
                  isSelected ? "bg-emerald-600 border-emerald-600" : "border-stone-300"
                }`}>
                  {isSelected && <CheckCircle2 size={13} className="text-white" />}
                </div>
                <span className="w-14 text-sm font-medium text-stone-700">{label}</span>
                <div className="flex-1 bg-stone-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isSelected ? "bg-emerald-500" : "bg-stone-300"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-7 text-sm text-stone-600 text-right">{count}</span>
              </button>
            );
          })}
        </div>

        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0 || loading}
            className="mt-4 w-full bg-emerald-700 text-white rounded-xl py-3 font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
            우리 팀의 핵심 가치로 확정
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={16} />
            핵심 가치 확정됨 — 다음 단계로 진행하세요
          </div>
        )}
      </div>

      {/* 주관식 제안 */}
      {suggestions.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-stone-700 mb-3">추가 제안 가치</h4>
          <div className="space-y-1.5">
            {suggestions.map((s) => (
              <p key={s.id} className="text-sm text-stone-700 bg-stone-50 rounded-lg px-3 py-2">
                "{s.text}"
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 다음 단계 */}
      {confirmed && (
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 transition-colors"
        >
          2단계 조별 작성 시작 <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
