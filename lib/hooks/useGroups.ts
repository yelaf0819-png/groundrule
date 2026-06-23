"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { TARGET_GROUP_SIZE } from "@/lib/constants";
import type { RuleCandidate, Participant } from "@/lib/constants";

export async function assignGroups(sessionId: string, participants: Participant[]): Promise<{ error?: string }> {
  const supabase = createClient();
  const groupCount = Math.min(2, Math.max(1, Math.ceil(participants.length / TARGET_GROUP_SIZE)));
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const updates = shuffled.map((p, i) => ({
    id: p.id,
    session_id: sessionId,
    name: p.name,
    group_number: (i % groupCount) + 1,
  }));
  const results = await Promise.all(
    updates.map((u) =>
      supabase.from("participants").update({ group_number: u.group_number }).eq("id", u.id)
    )
  );
  const failed = results.find((r) => r.error);
  return failed ? { error: failed.error!.message } : {};
}

export function useRuleCandidates(sessionId: string | null) {
  const [candidates, setCandidates] = useState<RuleCandidate[]>([]);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("rule_candidates")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at");
    if (data) setCandidates(data as RuleCandidate[]);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetch();
    const supabase = createClient();
    const ch = supabase
      .channel(`rule-candidates-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rule_candidates", filter: `session_id=eq.${sessionId}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId, fetch]);

  return candidates;
}

export async function submitGroupRules(
  sessionId: string,
  participantId: string,
  groupNumber: number,
  rules: { text: string; valueId?: string }[]
): Promise<{ error?: string }> {
  const supabase = createClient();

  // 이미 제출된 조인지 확인
  const { data: alreadySubmitted } = await supabase
    .from("rule_candidates")
    .select("id")
    .eq("session_id", sessionId)
    .eq("group_number", groupNumber)
    .limit(1);

  if (alreadySubmitted && alreadySubmitted.length > 0) {
    return { error: "ALREADY_SUBMITTED" };
  }

  const { error } = await supabase.from("rule_candidates").insert(
    rules
      .filter((r) => r.text.trim())
      .map((r) => ({
        session_id: sessionId,
        group_number: groupNumber,
        text: r.text.trim(),
        value_id: r.valueId ?? null,
        created_by: participantId,
      }))
  );
  return error ? { error: error.message } : {};
}

export async function setPresentingGroup(sessionId: string, groupNumber: number): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ presenting_group: groupNumber })
    .eq("id", sessionId);
  return error ? { error: error.message } : {};
}
