'use client';

import { use } from 'react';
import { ClaimStatusPortal } from '@/components/status/ClaimStatusPortal';

interface PageProps {
  params: Promise<{ claimId: string }>;
}

export default function StatusPage({ params }: PageProps) {
  const { claimId } = use(params);
  return <ClaimStatusPortal claimId={claimId} />;
}
