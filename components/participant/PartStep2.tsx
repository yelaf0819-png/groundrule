"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { submitGroupRules, useRuleCandidates } from "@/lib/hooks/useGroups";
import { useParticipants } from "@/lib/hooks/useSession";
import { PRESET_VALUES, VALUE_RULE_EXAMPLES } from "@/lib/constants";
import type { Session } from "@/lib/constants";

export default function PartStep2({
  session,
  participantId,
}: {
  session: Session;
  participantId: string;
}) {
  const participants = useParticipants(session.id);
  const candidates = useRuleCandidates(session.id);
  const me = participants.find((p) => p.id === participantId);
  const groupMembers = participants.filter((p) => p.group_number === me?.group_number);
  const groupAlreadySubmitted = !!me?.group_number && candidates.some((c) => c.group_number === me.group_number);

  const coreValues = session.core_value_ids
    .map((id) => {
      if (id.startsWith("custom:")) {
        return { id, label: id.slice(7), desc: "", isCustom: true };
      }
      const preset = PRESET_VALUES.find((v) => v.id === id);
      return preset ? { ...preset, isCustom: false } : null;
    })
    .filter(Boolean) as { id: string; label: string; desc: string; isCustom: boolean }[];

  const [rules, setRules] = useState([
    { text: "", valueId: "" },
    { text: "", valueId: "" },
    { text: "", valueId: "" },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setRule(i: number, text: string) {
    setRules((prev) => prev.map((r, idx) => (idx === i ? { ...r, text } : r)));
  }

  function applyExample(i: number, text: string, valueId: string) {
    setRules((prev) => prev.map((r, idx) => (idx === i ? { text, valueId } : r)));
  }

  async function handleSubmit() {
    const filled = rules.filter((r) => r.text.trim());
    if (filled.length === 0) return;
    if (!me?.group_number) return;
    setLoading(true);
    setError(null);
    const result = await submitGroupRules(
      session.id,
      participantId,
      me.group_number,
      filled.map((r) => ({ text: r.text, valueId: r.valueId || undefined }))
    );
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (!me?.group_number) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          조 배정 중입니다…
        </div>
      </main>
    );
  }

  if (submitted || groupAlreadySubmitted) {
    return (
      <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
        <h2 className="text-lg font-bold text-stone-900 mb-2">
          {submitted ? "제출 완료!" : "조에서 이미 제출했어요!"}
        </h2>
        <p className="text-stone-500 text-sm">다른 조가 완료되기를 기다리는 중입니다</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-1">2단계</p>
          <h2 className="text-xl font-bold text-stone-900">조별 그라운드룰 작성</h2>
        </div>

        {/* 내 조 정보 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-emerald-700 text-lg">{me.group_number}조</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {groupMembers.map((m) => (
              <span key={m.id} className={`text-xs px-2 py-0.5 rounded ${m.id === participantId ? "bg-emerald-100 text-emerald-800 font-medium" : "bg-stone-100 text-stone-600"}`}>
                {m.id === participantId ? `${m.name} (나)` : m.name}
              </span>
            ))}
          </div>
        </div>

        {/* 핵심 가치 예시 */}
        {coreValues.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-emerald-800 mb-2">우리 숲 핵심 가치 예시 (클릭하면 자동 입력)</p>
            {coreValues.map((v) => {
              const examples = v.isCustom ? [] : (VALUE_RULE_EXAMPLES[v.id] ?? []);
              return (
                <div key={v.id} className="mb-2">
                  <p className="text-xs font-medium text-emerald-700 mb-1">{v.label}</p>
                  {examples.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {examples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            const emptyIdx = rules.findIndex((r) => !r.text);
                            if (emptyIdx >= 0) applyExample(emptyIdx, ex, v.id);
                          }}
                          className="text-left text-xs text-stone-700 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 italic">숲이 직접 정한 가치예요. 어떤 룰로 표현할지 이야기해보세요!</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 룰 입력 */}
        <div className="space-y-3 mb-4">
          {rules.map((rule, i) => (
            <div key={i}>
              <label className="block text-xs font-medium text-stone-600 mb-1">룰 {i + 1}</label>
              <input
                type="text"
                value={rule.text}
                onChange={(e) => setRule(i, e.target.value)}
                placeholder="구체적인 행동으로 적어주세요"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>

        {/* 좋은 예/나쁜 예 팁 */}
        <button
          onClick={() => setShowTips((v) => !v)}
          className="flex items-center gap-1 text-xs text-stone-500 mb-3"
        >
          {showTips ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          좋은 룰 예시 보기
        </button>
        {showTips && (
          <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 text-xs space-y-2">
            <p className="font-medium text-emerald-700">✓ 좋은 예</p>
            {["회의 시작 5분 전에는 자리에 도착한다", "불편한 점은 그날 안에 직접 말한다"].map((t) => (
              <p key={t} className="text-stone-600">• {t}</p>
            ))}
            <p className="font-medium text-rose-600 mt-2">✗ 피하기</p>
            {["서로 존중한다 (너무 추상적)", "소통을 잘 한다 (행동이 안 보임)"].map((t) => (
              <p key={t} className="text-stone-500">• {t}</p>
            ))}
          </div>
        )}

        {error && <p className="text-rose-600 text-sm mb-3 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={rules.every((r) => !r.text.trim()) || loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          조의 의견으로 제출
        </button>
      </div>
    </main>
  );
}
