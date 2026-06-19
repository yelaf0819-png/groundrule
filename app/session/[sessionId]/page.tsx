"use client";

import { use, useEffect, useState } from "react";
import { useSessionState } from "@/lib/hooks/useSession";
import PartStep0 from "@/components/participant/PartStep0";
import PartStep1 from "@/components/participant/PartStep1";
import PartStep2 from "@/components/participant/PartStep2";
import PartStep3 from "@/components/participant/PartStep3";
import PartStep4 from "@/components/participant/PartStep4";
import PartStep5 from "@/components/participant/PartStep5";
import { Loader2 } from "lucide-react";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default function SessionPage({ params }: Props) {
  const { sessionId } = use(params);
  const { session, loading, error } = useSessionState(sessionId);
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("participantId");
    setParticipantId(id);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-rose-600 text-sm">세션을 불러올 수 없습니다. 다시 입장해 주세요.</p>
      </main>
    );
  }

  if (!participantId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-stone-500 text-sm">참여자 정보를 찾을 수 없습니다. 다시 입장해 주세요.</p>
      </main>
    );
  }

  const step = session.current_step;

  switch (step) {
    case 0: return <PartStep0 session={session} />;
    case 1: return <PartStep1 session={session} participantId={participantId} />;
    case 2: return <PartStep2 session={session} participantId={participantId} />;
    case 3: return <PartStep3 session={session} />;
    case 4: return <PartStep4 session={session} participantId={participantId} />;
    case 5: return <PartStep5 session={session} />;
    default: return <PartStep0 session={session} />;
  }
}
