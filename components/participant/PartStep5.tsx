"use client";
import { useRef } from "react";
import { Crown, Download, Loader2 } from "lucide-react";
import { PRESET_VALUES } from "@/lib/constants";
import type { Session } from "@/lib/constants";

function getValueSubtitle(ids: string[]): string {
  if (!ids || ids.length === 0) return "그라운드룰";
  const labels = ids.map((id) => {
    if (id.startsWith("custom:")) return id.slice(7);
    return PRESET_VALUES.find((v) => v.id === id)?.label ?? id;
  });
  return labels.join(" · ") + " 그라운드룰";
}

export default function PartStep5({ session }: { session: Session }) {
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const rules = session.final_rules;
  const subtitle = getValueSubtitle(session.core_value_ids ?? []);

  async function handleSave() {
    const target = wallpaperRef.current;
    if (!target) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(target, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        width: 390,
        height: 844,
      });
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
          숲장이 최종 확정하는 중입니다…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-8">
      {/* 숲 이름 상단 표시 */}
      <div className="text-center mb-4">
        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-1">MK Summer Camp 2026</p>
        <h2 className="text-xl font-bold text-stone-900">{session.team_name} 숲</h2>
      </div>

      <div className="w-full max-w-sm">
        {/* 화면용 결과 카드 */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-6 mb-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-300" />
            <div>
              <p className="text-xs text-emerald-300 font-medium">MK Summer Camp 2026</p>
              <p className="font-bold">{session.team_name} 숲 {subtitle}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {rules.map((rule, i) => (
              <div key={rule.id} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-xs font-bold text-yellow-300 w-4 flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-emerald-300 text-center mt-4">
            RIGHTEOUSNESS · PEACE · JOY · ROMANS 14:17
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold hover:bg-emerald-800 transition-colors min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          배경화면 저장하기
        </button>

        <p className="text-xs text-stone-400 text-center mt-3">
          핸드폰 배경화면으로 저장해보세요 🎉
        </p>
      </div>

      {/* 핸드폰 배경화면 사이즈 (숨김 — 다운로드 전용) */}
      <div
        ref={wallpaperRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0",
          width: "390px",
          height: "844px",
        }}
        className="bg-gradient-to-br from-emerald-700 to-emerald-900 flex flex-col items-center justify-center px-10 py-12"
      >
        <p className="text-xs text-emerald-300 font-semibold tracking-widest uppercase mb-2">
          MK Summer Camp 2026
        </p>
        <p className="text-2xl font-bold text-white mb-1">{session.team_name} 숲</p>
        <p className="text-sm text-emerald-200 mb-8">{subtitle}</p>

        <div className="w-full space-y-3">
          {rules.map((rule, i) => (
            <div key={rule.id} className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-4">
              <span className="text-sm font-bold text-yellow-300 w-5 flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-white leading-relaxed">{rule.text}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-emerald-300 text-center mt-8">
          RIGHTEOUSNESS · PEACE · JOY · ROMANS 14:17
        </p>
      </div>
    </main>
  );
}
