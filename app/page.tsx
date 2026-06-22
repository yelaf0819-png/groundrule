import Link from "next/link";
import { Users, Shield } from "lucide-react";
import FacilitatorReJoin from "@/components/FacilitatorReJoin";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      {/* 상단 서명 */}
      <div className="text-center mb-10">
        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-1">
          MK Summer Camp 2026
        </p>
        <p className="text-xs text-stone-500 tracking-wide">
          RIGHTEOUSNESS · PEACE · JOY · ROMANS 14:17
        </p>
      </div>

      {/* 타이틀 */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          숲 그라운드룰 워크숍
        </h1>
        <p className="text-stone-500 text-sm">
          우리 숲만의 약속을 함께 만들어요
        </p>
      </div>

      {/* 버튼 카드 */}
      <div className="w-full max-w-sm space-y-4">
        <Link
          href="/facilitator/new"
          className="flex items-center gap-4 w-full bg-emerald-700 text-white rounded-2xl px-6 py-5 hover:bg-emerald-800 active:bg-emerald-900 transition-colors"
        >
          <div className="bg-white/20 rounded-xl p-2">
            <Shield className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-base">숲장으로 시작</p>
            <p className="text-emerald-200 text-xs mt-0.5">
              새 세션 만들기 · 워크숍 진행
            </p>
          </div>
        </Link>

        <Link
          href="/join"
          className="flex items-center gap-4 w-full bg-white border-2 border-emerald-200 text-stone-800 rounded-2xl px-6 py-5 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
        >
          <div className="bg-emerald-50 rounded-xl p-2">
            <Users className="w-6 h-6 text-emerald-700" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-base">참여자로 입장</p>
            <p className="text-stone-400 text-xs mt-0.5">
              숲장에게 받은 코드로 입장
            </p>
          </div>
        </Link>
      </div>

      <FacilitatorReJoin />

      {/* 어드민 링크 */}
      <div className="mt-12">
        <Link
          href="/admin"
          className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
        >
          운영자 대시보드
        </Link>
      </div>
    </main>
  );
}
