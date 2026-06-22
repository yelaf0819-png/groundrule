"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, X } from "lucide-react";

interface FacSession {
  sessionId: string;
  teamName: string;
  code: string;
}

export default function FacilitatorReJoin() {
  const [prev, setPrev] = useState<FacSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fac_session");
      if (raw) setPrev(JSON.parse(raw));
    } catch {}
  }, []);

  function handleClear() {
    try { localStorage.removeItem("fac_session"); } catch {}
    setPrev(null);
  }

  if (!prev) return null;

  return (
    <div className="w-full max-w-sm mt-4 pt-4 border-t border-stone-200">
      <p className="text-xs text-stone-400 text-center mb-2">이전에 시작한 세션</p>
      <div className="flex items-center gap-2">
        <Link
          href={`/facilitator/${prev.sessionId}`}
          className="flex-1 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 hover:bg-emerald-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div className="text-left">
            <p className="font-semibold text-sm text-emerald-900">{prev.teamName} 숲 이어가기</p>
            <p className="text-xs text-emerald-600">코드 {prev.code}</p>
          </div>
        </Link>
        <button
          onClick={handleClear}
          className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
          title="이전 세션 지우기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
