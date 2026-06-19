"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRESET_VALUES } from "@/lib/constants";
import type { ValueSuggestion } from "@/lib/constants";

export interface ValueVoteCount {
  id: string;
  label: string;
  count: number;
}

export function useValueVoteCounts(sessionId: string | null) {
  const [counts, setCounts] = useState<ValueVoteCount[]>([]);
  const [respondents, setRespondents] = useState(0);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("value_votes")
      .select("value_id, participant_id")
      .eq("session_id", sessionId);
    if (!data) return;
    setCounts(
      PRESET_VALUES.map((v) => ({
        id: v.id,
        label: v.label,
        count: data.filter((d) => d.value_id === v.id).length,
      }))
    );
    setRespondents(new Set(data.map((d) => d.participant_id)).size);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetch();
    const supabase = createClient();
    const ch = supabase
      .channel(`value-votes-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "value_votes", filter: `session_id=eq.${sessionId}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId, fetch]);

  return { counts, respondents };
}

export function useValueSuggestions(sessionId: string | null) {
  const [suggestions, setSuggestions] = useState<ValueSuggestion[]>([]);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("value_suggestions")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at");
    if (data) setSuggestions(data as ValueSuggestion[]);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetch();
    const supabase = createClient();
    const ch = supabase
      .channel(`value-sug-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "value_suggestions", filter: `session_id=eq.${sessionId}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId, fetch]);

  return suggestions;
}

export async function submitValueVotes(
  sessionId: string,
  participantId: string,
  valueIds: string[],
  suggestion?: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("value_votes").insert(
    valueIds.map((value_id) => ({ session_id: sessionId, participant_id: participantId, value_id }))
  );
  if (error) return { error: error.message };
  if (suggestion?.trim()) {
    await supabase.from("value_suggestions").insert({
      session_id: sessionId,
      participant_id: participantId,
      text: suggestion.trim(),
    });
  }
  return {};
}

export async function confirmCoreValues(
  sessionId: string,
  valueIds: string[]
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ core_value_ids: valueIds })
    .eq("id", sessionId);
  return error ? { error: error.message } : {};
}
