"use client";
import { useRef } from "react";
import { Crown, Download, Loader2 } from "lucide-react";
import type { Session } from "@/lib/constants";

export default function PartStep5({ session }: { session: Session }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const rules = session.final_rules;

  async function handleSave() {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `groundrules-${session.team_name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("이미지 저장에 실패했습니다.");
    }
  }

  if (!rules || rules.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          팀장이 최종 확정하는 중입니다…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* 결과 카드 */}
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-6 mb-5 text-white"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-300" />
            <div>
              <p className="text-xs text-emerald-300 font-medium">MK Summer Camp 2026</p>
              <p className="font-bold">{session.team_name} 그라운드룰</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {rules.map((rule, i) => (
              <div key={rule.id} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-xs font-bold text-yellow-300 mt-0.5 w-4 flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-emerald-300 text-center mt-4">
            PEACE · JOY · RIGHTEOUSNESS · ROMANS 14:17
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 transition-colors min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          결과 저장하기
        </button>

        <p className="text-xs text-stone-400 text-center mt-3">
          이미지로 저장해서 공유해보세요 🎉
        </p>
      </div>
    </main>
  );
}
