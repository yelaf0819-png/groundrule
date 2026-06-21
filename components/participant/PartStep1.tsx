"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitValueVotes } from "@/lib/hooks/useValueVotes";
import { PRESET_VALUES, MAX_VALUE_VOTES } from "@/lib/constants";
import type { Session } from "@/lib/constants";

export default function PartStep1({ session, participantId }: { session: Session; participantId: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : prev.length < MAX_VALUE_VOTES ? [...prev, id] : prev
    );
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    setLoading(true);
    setError(null);
    const result = await submitValueVotes(session.id, participantId, selected, suggestion);
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
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-stone-900 mb-2">투표 완료!</h2>
          <p className="text-stone-500 text-sm">숲장이 핵심 가치를 확정하는 중입니다</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-1">1단계</p>
          <h2 className="text-xl font-bold text-stone-900">우리 숲의 가치</h2>
          <p className="text-stone-500 text-sm mt-1">
            가장 중요하게 여기고 싶은 가치 {MAX_VALUE_VOTES}개를 선택해주세요
          </p>
        </div>

        <div className="bg-emerald-50 rounded-lg px-3 py-2 mb-4 text-xs text-emerald-800 text-center">
          {selected.length}/{MAX_VALUE_VOTES}개 선택됨
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {PRESET_VALUES.map((v) => {
            const isSelected = selected.includes(v.id);
            const isDisabled = !isSelected && selected.length >= MAX_VALUE_VOTES;
            return (
              <button
                key={v.id}
                onClick={() => toggle(v.id)}
                disabled={isDisabled}
                className={`rounded-2xl p-4 text-left border-2 transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : isDisabled
                    ? "border-stone-100 bg-stone-50 opacity-40"
                    : "border-stone-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-stone-900 text-sm">{v.label}</span>
                  {isSelected && <CheckCircle2 size={15} className="text-emerald-500" />}
                </div>
                <p className="text-xs text-stone-500">{v.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            추가하고 싶은 가치 (선택)
          </label>
          <input
            type="text"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="예: 감동, 창의성…"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-rose-600 text-sm mb-3 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 || loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          투표 제출
        </button>
      </div>
    </main>
  );
}
