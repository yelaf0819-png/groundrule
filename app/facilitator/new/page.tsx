"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/lib/hooks/useSession";
import { ArrowRight, Loader2 } from "lucide-react";

export default function NewSessionPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [facilitatorName, setFacilitatorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim() || !facilitatorName.trim()) return;

    setLoading(true);
    setError(null);

    const result = await createSession(teamName.trim(), facilitatorName.trim());

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/facilitator/${result.sessionId}`);
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-4">
            MK Summer Camp 2026
          </p>
          <h1 className="text-xl font-bold text-stone-900">새 세션 만들기</h1>
          <p className="text-stone-500 text-sm mt-1">
            정보를 입력하면 입장 코드가 생성됩니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="facilitatorName" className="block text-sm font-medium text-stone-700 mb-1.5">
              팀장 이름
            </label>
            <input
              id="facilitatorName"
              type="text"
              value={facilitatorName}
              onChange={(e) => setFacilitatorName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-stone-700 mb-1.5">
              팀 이름
            </label>
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="예: 참가자관리팀"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-rose-600 text-sm bg-rose-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={!teamName.trim() || !facilitatorName.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                세션 생성 중…
              </>
            ) : (
              <>
                세션 만들기
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
