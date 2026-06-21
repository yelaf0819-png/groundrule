"use client";
import { useState } from "react";
import {
  Users, ChevronDown, ChevronUp, Trash2, RefreshCw,
  Plus, X, Loader2, ExternalLink, Pencil, Check,
  Crown, Target, FileText, Trophy,
} from "lucide-react";
import {
  useAllSessions, useAllParticipants, useAllRuleCandidates,
  adminDeleteSession, adminSetStep, adminCreateSession, adminRenameSession,
} from "@/lib/hooks/useAdminData";
import { PRESET_VALUES } from "@/lib/constants";
import type { Session } from "@/lib/constants";

const STEP_LABELS = ["입장 대기", "가치 선정", "조별 룰 작성", "조별 발표", "최종 투표", "최종 확정"];
const STEP_COLORS = [
  "bg-stone-100 text-stone-500",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-700",
];

export default function AdminDashboard() {
  const { sessions, loading, refetch } = useAllSessions();
  const participants = useAllParticipants();
  const ruleCandidates = useAllRuleCandidates();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const totalParticipants = participants.length;
  const activeSessions = sessions.filter((s) => s.current_step > 0 && s.current_step < 5).length;
  const completedSessions = sessions.filter((s) => s.current_step === 5).length;

  function getParticipantsFor(sessionId: string) {
    return participants.filter((p) => p.session_id === sessionId);
  }
  function getCandidatesFor(sessionId: string) {
    return ruleCandidates.filter((c) => c.session_id === sessionId);
  }
  function getValueLabel(id: string) {
    if (id.startsWith("custom:")) return id.slice(7);
    return PRESET_VALUES.find((v) => v.id === id)?.label ?? id;
  }

  async function handleDelete(sessionId: string) {
    setActionLoading(`del-${sessionId}`);
    const result = await adminDeleteSession(sessionId);
    if (result.error) alert("삭제 실패: " + result.error);
    setConfirmDelete(null);
    setActionLoading(null);
  }

  async function handleStepChange(sessionId: string, step: number) {
    setActionLoading(`step-${sessionId}`);
    await adminSetStep(sessionId, step);
    setActionLoading(null);
  }

  async function handleCreate() {
    if (!newTeamName.trim()) return;
    setCreating(true);
    const result = await adminCreateSession(newTeamName.trim());
    if (result.error) alert("생성 실패: " + result.error);
    setNewTeamName("");
    setShowCreate(false);
    setCreating(false);
  }

  async function handleRename(sessionId: string) {
    if (!editingName.trim()) return;
    setActionLoading(`rename-${sessionId}`);
    await adminRenameSession(sessionId, editingName.trim());
    setEditingId(null);
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-0.5">
            MK SUMMER CAMP 2026
          </p>
          <h1 className="text-2xl font-bold text-stone-900">운영자 대시보드</h1>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          새로고침
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "전체 숲", value: sessions.length, color: "text-stone-900" },
          { label: "총 참여자", value: totalParticipants, color: "text-stone-900" },
          { label: "진행 중", value: activeSessions, color: "text-blue-600" },
          { label: "완료", value: completedSessions, color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-stone-200 rounded-xl px-4 py-3">
            <p className="text-xs text-stone-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 새 팀 추가 */}
      <div className="mb-5">
        {showCreate ? (
          <div className="flex gap-2">
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="숲 이름 입력 (예: 사랑숲)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newTeamName.trim()}
              className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 disabled:opacity-40 flex items-center gap-1.5 min-h-[44px]"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              추가
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewTeamName(""); }}
              className="px-3 border border-stone-200 bg-white rounded-xl text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 숲 추가
          </button>
        )}
      </div>

      {/* 팀 카드 목록 */}
      {sessions.length === 0 ? (
        <div className="text-center py-20 text-stone-400 text-sm bg-white border border-stone-200 rounded-2xl">
          아직 생성된 숲이 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: Session) => {
            const sessionParticipants = getParticipantsFor(session.id);
            const sessionCandidates = getCandidatesFor(session.id);
            const isExpanded = expanded === session.id;
            const isDeleting = actionLoading === `del-${session.id}`;
            const isStepLoading = actionLoading === `step-${session.id}`;
            const isEditing = editingId === session.id;
            const groups = [
              ...new Set(sessionParticipants.map((p) => p.group_number).filter(Boolean)),
            ].sort() as number[];
            const candidateGroups = [
              ...new Set(sessionCandidates.map((c) => c.group_number)),
            ].sort();

            return (
              <div key={session.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                {/* ── 카드 헤더 ── */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* 팀 이름 + 단계 배지 */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleRename(session.id)}
                              className="text-base font-bold border-b-2 border-emerald-500 bg-transparent text-stone-900 focus:outline-none w-40"
                              autoFocus
                            />
                            <button onClick={() => handleRename(session.id)} className="text-emerald-600 hover:text-emerald-800">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-stone-400 hover:text-stone-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <h2 className="font-bold text-stone-900 text-base">{session.team_name}</h2>
                            <button
                              onClick={() => { setEditingId(session.id); setEditingName(session.team_name); }}
                              className="text-stone-300 hover:text-stone-500 p-0.5"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STEP_COLORS[session.current_step]}`}>
                          {session.current_step}단계 · {STEP_LABELS[session.current_step]}
                        </span>
                      </div>

                      {/* 코드 + 인원 */}
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span>입장 코드 <strong className="text-stone-800 font-mono text-sm">{session.code}</strong></span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {sessionParticipants.length}명 참여
                        </span>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {confirmDelete === session.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(session.id)}
                            disabled={isDeleting}
                            className="text-xs px-2.5 py-1.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 flex items-center gap-1"
                          >
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "삭제 확인"}
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="text-xs px-2.5 py-1.5 bg-stone-100 text-stone-600 rounded-lg">
                            취소
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(session.id)}
                          className="p-1.5 text-stone-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : session.id)}
                        className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 진행 바 */}
                  <div className="flex gap-1 mt-3">
                    {[0, 1, 2, 3, 4, 5].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          s < session.current_step ? "bg-emerald-400" : s === session.current_step ? "bg-emerald-700" : "bg-stone-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* ── 상세 패널 ── */}
                {isExpanded && (
                  <div className="border-t border-stone-100 divide-y divide-stone-100">

                    {/* 1. 구성원 정보 */}
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">구성원</p>
                      </div>

                      {/* 팀장 */}
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-xs text-stone-500">숲장</span>
                        {session.facilitator_name ? (
                          <span className="text-xs font-semibold text-stone-800">{session.facilitator_name}</span>
                        ) : (
                          <span className="text-xs text-stone-400 italic">미입력</span>
                        )}
                      </div>

                      {/* 구성원 */}
                      {sessionParticipants.length === 0 ? (
                        <p className="text-xs text-stone-400">아직 입장한 참여자가 없습니다</p>
                      ) : groups.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {groups.map((g) => {
                            const members = sessionParticipants.filter((p) => p.group_number === g);
                            return (
                              <div key={g} className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                                <p className="text-xs font-bold text-emerald-700 mb-1.5">{g}조 ({members.length}명)</p>
                                {members.map((p) => (
                                  <p key={p.id} className="text-xs text-stone-700 py-0.5">{p.name}</p>
                                ))}
                              </div>
                            );
                          })}
                          {sessionParticipants.filter((p) => !p.group_number).length > 0 && (
                            <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                              <p className="text-xs font-bold text-stone-400 mb-1.5">
                                조 미배정 ({sessionParticipants.filter((p) => !p.group_number).length}명)
                              </p>
                              {sessionParticipants.filter((p) => !p.group_number).map((p) => (
                                <p key={p.id} className="text-xs text-stone-700 py-0.5">{p.name}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {sessionParticipants.map((p) => (
                            <span key={p.id} className="text-xs bg-stone-50 border border-stone-200 rounded-full px-2.5 py-1 text-stone-700">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. 1단계 결과 — 핵심 가치 */}
                    {session.current_step >= 1 && (
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          <Target className="w-3.5 h-3.5 text-stone-400" />
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            1단계 결과 · 핵심 가치
                          </p>
                        </div>
                        {session.core_value_ids?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {session.core_value_ids.map((id) => (
                              <span key={id} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-full px-3 py-1">
                                {getValueLabel(id)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400">아직 가치 확정 전</p>
                        )}
                      </div>
                    )}

                    {/* 3. 2단계 결과 — 조별 룰 후보 */}
                    {session.current_step >= 2 && (
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          <FileText className="w-3.5 h-3.5 text-stone-400" />
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            2단계 결과 · 조별 룰 후보
                          </p>
                        </div>
                        {candidateGroups.length === 0 ? (
                          <p className="text-xs text-stone-400">아직 제출된 룰이 없습니다</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {candidateGroups.map((g) => {
                              const groupRules = sessionCandidates.filter((c) => c.group_number === g);
                              return (
                                <div key={g} className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-3">
                                  <p className="text-xs font-bold text-emerald-700 mb-2">{g}조 룰</p>
                                  <div className="space-y-1.5">
                                    {groupRules.map((rule, i) => (
                                      <div key={rule.id} className="flex items-start gap-2">
                                        <span className="text-xs font-bold text-stone-400 mt-0.5 w-3 flex-shrink-0">{i + 1}</span>
                                        <p className="text-xs text-stone-700 leading-relaxed">{rule.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. 최종 그라운드룰 */}
                    {session.final_rules?.length > 0 && (
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            최종 그라운드룰
                          </p>
                        </div>
                        <div className="space-y-2">
                          {session.final_rules.map((rule, i) => (
                            <div key={rule.id} className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                              <span className="text-xs font-bold text-emerald-600 mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                              <p className="text-sm text-stone-800 leading-relaxed">{rule.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. 관리 */}
                    <div className="px-5 py-4 bg-stone-50">
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">단계 강제 이동</p>
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {STEP_LABELS.map((label, i) => (
                          <button
                            key={i}
                            onClick={() => handleStepChange(session.id, i)}
                            disabled={isStepLoading}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              session.current_step === i
                                ? "bg-emerald-700 text-white shadow-sm"
                                : "bg-white border border-stone-200 text-stone-600 hover:border-emerald-400 hover:text-emerald-700"
                            }`}
                          >
                            {i}. {label}
                          </button>
                        ))}
                        {isStepLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600 self-center" />}
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`/facilitator/${session.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          숲장 화면
                        </a>
                        <a
                          href="/join"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          참여자 입장 (코드: {session.code})
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
