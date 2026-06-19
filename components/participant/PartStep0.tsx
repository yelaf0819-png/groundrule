"use client";
import type { Session } from "@/lib/constants";

export default function PartStep0({ session }: { session: Session }) {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-6">
          {session.team_name}
        </p>
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-50" />
          <div className="relative bg-emerald-500 rounded-full w-16 h-16 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">곧 시작합니다</h2>
        <p className="text-stone-500 text-sm">팀장이 워크숍을 시작하면 자동으로 넘어갑니다</p>
      </div>
    </main>
  );
}
