"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Loader2, X } from "lucide-react";

export default function FacilitatorCodeEntry() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: session } = await supabase
      .from("sessions")
      .select("id, team_name, code")
      .eq("code", code.trim())
      .single();

    if (!session) {
      setError("코드를 찾을 수 없습니다. 다시 확인해 주세요.");
      setLoading(false);
      return;
    }

    try {
      localStorage.setItem("fac_session", JSON.stringify({
        sessionId: session.id,
        teamName: session.team_name,
        code: session.code,
      }));
    } catch {}

    router.push(`/facilitator/${session.id}`);
  }

  function handleClose() {
    setOpen(false);
    setCode("");
    setError(null);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-stone-400 hover:text-emerald-600 transition-colors underline underline-offset-2"
      >
        숲장 코드로 재입장
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs text-stone-500 text-center mb-2">4자리 입장 코드를 입력하면 숲장 화면으로 이동합니다</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="0000"
          maxLength={4}
          autoFocus
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-base font-mono text-center tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={code.length !== 4 || loading}
          className="px-4 py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 min-h-[44px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="px-3 border border-stone-200 bg-white rounded-xl text-stone-400 hover:text-stone-600"
        >
          <X className="w-4 h-4" />
        </button>
      </form>
      {error && <p className="text-rose-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
