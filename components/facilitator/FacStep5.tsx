"use client";
import { useState, useEffect } from "react";
import { Edit2, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useRuleVoteCounts } from "@/lib/hooks/useRuleVotes";
import { confirmFinalRules } from "@/lib/hooks/useRuleVotes";
import type { Session, FinalRule } from "@/lib/constants";

export default function FacStep5({ session }: { session: Session }) {
  const { counts } = useRuleVoteCounts(session.id);
  const alreadyConfirmed = session.final_rules && session.final_rules.length > 0;

  const [rules, setRules] = useState<FinalRule[]>(() => {
    if (alreadyConfirmed) return session.final_rules;
    return [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmed, setConfirmed] = useState(alreadyConfirmed);
  const [loading, setLoading] = useState(false);

  // counts가 로드되면 상위 4개로 rules 초기화 (아직 확정 전이고 rules가 비어있을 때)
  useEffect(() => {
    if (!alreadyConfirmed && rules.length === 0 && counts.length > 0) {
      setRules(counts.slice(0, 4).map((c, i) => ({ id: c.id, text: c.text, order: i + 1 })));
    }
  }, [counts, alreadyConfirmed, rules.length]);

  function startEdit(rule: FinalRule) {
    setEditingId(rule.id);
    setEditText(rule.text);
  }

  function saveEdit() {
    if (!editingId) return;
    setRules((prev) => prev.map((r) => r.id === editingId ? { ...r, text: editText } : r));
    setEditingId(null);
  }

  function deleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleConfirm() {
    setLoading(true);
    await confirmFinalRules(session.id, rules);
    setConfirmed(true);
    setLoading(false);
  }

  if (counts.length === 0 && rules.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
        투표 결과 불러오는 중…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-stone-900">최종 확정 룰</h3>
        </div>
        {!confirmed && (
          <p className="text-xs text-stone-500 mb-4">
            연필 아이콘을 눌러 문구를 다듬고, 불필요한 룰은 삭제할 수 있어요
          </p>
        )}

        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div key={rule.id} className="border border-stone-200 rounded-xl overflow-hidden">
              {editingId === rule.id ? (
                <div className="p-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-sm text-stone-800 resize-none border-0 outline-none bg-transparent"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setEditingId(null)} className="text-xs text-stone-500 px-3 py-1">
                      취소
                    </button>
                    <button onClick={saveEdit} className="text-xs bg-emerald-700 text-white px-3 py-1 rounded-lg">
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="text-xs font-bold text-emerald-700 mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                  <p className="flex-1 text-sm text-stone-800 leading-relaxed">{rule.text}</p>
                  {!confirmed && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(rule)} className="p-1.5 text-stone-400 hover:text-stone-700" title="수정">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-stone-400 hover:text-rose-600" title="삭제">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={rules.length === 0 || loading}
            className="mt-5 w-full bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-1" />}
            최종 확정 및 숲원에게 공유
          </button>
        ) : (
          <div className="mt-5 bg-emerald-50 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-emerald-900">우리 숲의 그라운드룰이 확정됐습니다!</p>
            <p className="text-xs text-emerald-700 mt-1">
              숲원 화면에 결과가 표시됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
