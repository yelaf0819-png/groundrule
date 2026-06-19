"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";

const ADMIN_PASSWORD =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    : undefined;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 클라이언트 사이드 간단 비밀번호 체크 (운영용으로 충분)
    if (password === (ADMIN_PASSWORD ?? "admin")) {
      setAuthenticated(true);
    } else {
      setError(true);
      setPassword("");
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <div className="inline-flex bg-emerald-100 rounded-full p-3 mb-4">
              <Lock className="w-6 h-6 text-emerald-700" />
            </div>
            <h1 className="text-lg font-bold text-stone-900">운영자 대시보드</h1>
            <p className="text-stone-500 text-sm mt-1">비밀번호를 입력하세요</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="비밀번호"
              className={`w-full px-4 py-3 rounded-xl border bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base ${
                error ? "border-rose-400 bg-rose-50" : "border-stone-200"
              }`}
              autoFocus
            />
            {error && (
              <p className="text-rose-600 text-sm text-center">
                비밀번호가 올바르지 않습니다
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-emerald-700 text-white rounded-xl py-3 font-semibold hover:bg-emerald-800 transition-colors min-h-[44px]"
            >
              확인
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <AdminDashboard />
    </main>
  );
}
