"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinSession } from "@/lib/hooks/useSession";
import { ArrowRight, Loader2 } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    setLoading(true);
    setError(null);

    const result = await joinSession(code, name);

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // participantId를 sessionStorage에 저장해두어 이후 단계에서 활용
    sessionStorage.setItem("participantId", result.participantId);
    router.push(`/session/${result.sessionId}`);
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-4">
            MK Summer Camp 2026
          </p>
          <h1 className="text-xl font-bold text-stone-900">참여자 입장</h1>
          <p className="text-stone-500 text-sm mt-1">
            숲장에게 받은 코드와 내 이름을 입력하세요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              입장 코드 (4자리)
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base text-center tracking-widest text-lg font-bold"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              내 이름 (닉네임)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-rose-600 text-sm bg-rose-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={code.length !== 4 || !name.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                입장 중…
              </>
            ) : (
              <>
                입장하기
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
