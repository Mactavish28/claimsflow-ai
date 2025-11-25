'use client';

import { use } from 'react';
import { TriageDashboard } from '@/components/triage/TriageDashboard';

interface PageProps {
  params: Promise<{ claimId: string }>;
}

export default function TriagePage({ params }: PageProps) {
  const { claimId } = use(params);
  return <TriageDashboard claimId={claimId} />;
}
