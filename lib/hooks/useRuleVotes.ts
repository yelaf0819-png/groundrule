"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FinalRule } from "@/lib/constants";

export interface RuleVoteCount {
  id: string;
  text: string;
  group_number: number;
  count: number;
}

export function useRuleVoteCounts(sessionId: string | null) {
  const [counts, setCounts] = useState<RuleVoteCount[]>([]);
  const [respondents, setRespondents] = useState(0);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    const supabase = createClient();
    const [{ data: candidates }, { data: votes }] = await Promise.all([
      supabase.from("rule_candidates").select("id, text, group_number").eq("session_id", sessionId),
      supabase.from("rule_votes").select("candidate_id, participant_id").eq("session_id", sessionId),
    ]);
    if (!candidates || !votes) return;
    setCounts(
      candidates.map((c) => ({
        id: c.id,
        text: c.text,
        group_number: c.group_number,
        count: votes.filter((v) => v.candidate_id === c.id).length,
      })).sort((a, b) => b.count - a.count)
    );
    setRespondents(new Set(votes.map((v) => v.participant_id)).size);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetch();
    const supabase = createClient();
    const ch = supabase
      .channel(`rule-votes-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rule_votes", filter: `session_id=eq.${sessionId}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId, fetch]);

  return { counts, respondents };
}

export async function submitRuleVotes(
  sessionId: string,
  participantId: string,
  candidateIds: string[]
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("rule_votes").insert(
    candidateIds.map((candidate_id) => ({ session_id: sessionId, participant_id: participantId, candidate_id }))
  );
  return error ? { error: error.message } : {};
}

export async function confirmFinalRules(
  sessionId: string,
  rules: FinalRule[]
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ final_rules: rules })
    .eq("id", sessionId);
  return error ? { error: error.message } : {};
}
