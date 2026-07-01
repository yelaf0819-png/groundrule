"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, Participant, RuleCandidate } from "@/lib/constants";

export function useAllSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setSessions(data as Session[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-sessions-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { sessions, loading, refetch: fetch };
}

export function useAllParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("participants")
      .select("*")
      .order("joined_at");
    if (data) setParticipants(data as Participant[]);
  }, []);

  // 180명 동시 이벤트 방어: 400ms 안의 burst는 1번만 재조회
  const debouncedFetch = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fetch, 400);
  }, [fetch]);

  useEffect(() => {
    fetch();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-participants-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, debouncedFetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetch, debouncedFetch]);

  return participants;
}

export async function adminDeleteSession(sessionId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  return error ? { error: error.message } : {};
}

export async function adminSetStep(sessionId: string, step: number): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ current_step: step })
    .eq("id", sessionId);
  return error ? { error: error.message } : {};
}

export async function adminCreateSession(teamName: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const { error } = await supabase
    .from("sessions")
    .insert({ code, team_name: teamName });
  return error ? { error: error.message } : {};
}

export async function adminRenameSession(sessionId: string, teamName: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ team_name: teamName })
    .eq("id", sessionId);
  return error ? { error: error.message } : {};
}

export function useAllRuleCandidates() {
  const [candidates, setCandidates] = useState<RuleCandidate[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("rule_candidates")
      .select("*")
      .order("group_number");
    if (data) setCandidates(data as RuleCandidate[]);
  }, []);

  const debouncedFetch = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fetch, 400);
  }, [fetch]);

  useEffect(() => {
    fetch();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-rule-candidates-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "rule_candidates" }, debouncedFetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetch, debouncedFetch]);

  return candidates;
}
