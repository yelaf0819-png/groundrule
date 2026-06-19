"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useParticipants, updateStep } from "@/lib/hooks/useSession";
import { useRuleCandidates, assignGroups } from "@/lib/hooks/useGroups";
import { PRESET_VALUES } from "@/lib/constants";
import type { Session } from "@/lib/constants";

export default function FacStep2({ session }: { session: Session }) {
  const participants = useParticipants(session.id);
  const candidates = useRuleCandidates(session.id);
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState(participants.some((p) => p.group_number !== null));

  // 조 배정 (참여자가 로드되면 자동 실행)
  useEffect(() => {
    if (assigned || participants.length === 0) return;
    const anyAssigned = participants.some((p) => p.group_number !== null);
    if (!anyAssigned) {
      setAssigned(false);
    } else {
      setAssigned(true);
    }
  }, [participants, assigned]);

  async function handleAssign() {
    setLoading(true);
    await assignGroups(session.id, participants);
    setAssigned(true);
    setLoading(false);
  }

  async function handleNext() {
    setLoading(true);
    await updateStep(session.id, 3);
    setLoading(false);
  }

  const groupNumbers = [...new Set(participants.map((p) => p.group_number).filter(Boolean))].sort() as number[];
  const submittedGroups = new Set(candidates.map((c) => c.group_number));

  return (
    <div className="space-y-4">
      {/* 조 배정 버튼 */}
      {!assigned && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm text-amber-800 mb-3">
            조 배정이 아직 안 됐어요. 아래 버튼을 눌러 자동 배정해주세요.
          </p>
          <button
            onClick={handleAssign}
            disabled={loading || participants.length === 0}
            className="bg-amber-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
            조 자동 배정하기
          </button>
        </div>
      )}

      {/* 조별 카드 */}
      {groupNumbers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groupNumbers.map((g) => {
            const members = participants.filter((p) => p.group_number === g);
            const groupCandidates = candidates.filter((c) => c.group_number === g);
            const isSubmitted = submittedGroups.has(g);
            return (
              <div key={g} className={`bg-white border rounded-2xl p-5 ${isSubmitted ? "border-emerald-200" : "border-stone-200"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-stone-900">{g}조</span>
                  {isSubmitted ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 size={13} /> 제출 완료
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock size={13} /> 작성 중
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {members.map((m) => (
                    <span key={m.id} className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                      {m.name}
                    </span>
                  ))}
                </div>
                {groupCandidates.length > 0 && (
                  <div className="space-y-1 border-t border-stone-100 pt-3">
                    {groupCandidates.map((c) => {
                      const valueName = PRESET_VALUES.find((v) => v.id === c.value_id)?.label;
                      return (
                        <div key={c.id} className="text-xs text-stone-600">
                          {valueName && <span className="text-emerald-600 mr-1">[{valueName}]</span>}
                          {c.text}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 진행 현황 */}
      <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-stone-600">제출 현황</span>
        <span className="font-semibold text-stone-900">
          {submittedGroups.size} / {groupNumbers.length} 조
        </span>
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 disabled:opacity-40 transition-colors"
      >
        3단계 조별 발표 시작 <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
