"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, Participant } from "@/lib/constants";

// 4자리 숫자 코드 생성 (1000~9999)
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ============================================================
// 팀장: 새 세션 생성
// ============================================================
export async function createSession(
  teamName: string,
  facilitatorName?: string
): Promise<{ sessionId: string; code: string } | { error: string }> {
  const supabase = createClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode();
    const { data, error } = await supabase
      .from("sessions")
      .insert({ code, team_name: teamName, facilitator_name: facilitatorName ?? null })
      .select("id, code")
      .single();

    if (error) {
      // 코드 충돌 시 재시도
      if (error.code === "23505" && attempt < 2) continue;
      return { error: error.message };
    }

    return { sessionId: data.id, code: data.code };
  }

  return { error: "세션 생성에 실패했습니다. 다시 시도해 주세요." };
}

// ============================================================
// 참여자: 코드로 세션 찾고 입장
// ============================================================
export async function joinSession(
  code: string,
  name: string
): Promise<{ sessionId: string; participantId: string } | { error: string }> {
  const supabase = createClient();

  // 코드로 세션 조회
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("code", code.trim())
    .single();

  if (sessionError || !session) {
    return { error: "코드를 확인해 주세요. 일치하는 세션이 없습니다." };
  }

  // 참여자 등록
  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({ session_id: session.id, name: name.trim() })
    .select("id")
    .single();

  if (participantError || !participant) {
    return { error: "입장에 실패했습니다. 다시 시도해 주세요." };
  }

  return { sessionId: session.id, participantId: participant.id };
}

// ============================================================
// 세션 상태 실시간 구독
// ============================================================
export function useSessionState(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setSession(data as Session);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    fetchSession();

    const supabase = createClient();
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        () => fetchSession()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchSession]);

  return { session, loading, error };
}

// ============================================================
// 세션의 참여자 목록 실시간 구독
// ============================================================
export function useParticipants(sessionId: string | null) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const fetchParticipants = useCallback(async () => {
    if (!sessionId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("session_id", sessionId)
      .order("joined_at");
    if (data) setParticipants(data as Participant[]);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    fetchParticipants();

    const supabase = createClient();
    const channel = supabase
      .channel(`participants-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => fetchParticipants()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchParticipants]);

  return participants;
}

// ============================================================
// 세션 단계 업데이트 (팀장 전용)
// ============================================================
export async function updateStep(
  sessionId: string,
  step: number
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ current_step: step })
    .eq("id", sessionId);
  return error ? { error: error.message } : {};
}
