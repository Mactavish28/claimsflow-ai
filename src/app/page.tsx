'use client';

import { useEffect } from 'react';
import { FNOLChat } from '@/components/chat/FNOLChat';
import { useClaimStore } from '@/store/claimStore';

export default function Home() {
  const { startFNOLSession, currentSession } = useClaimStore();

  useEffect(() => {
    // Reset session when landing on home page
    if (currentSession?.isComplete) {
      startFNOLSession();
    }
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <FNOLChat />
    </div>
  );
}
