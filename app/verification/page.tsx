// /verification/page.tsx (Server Component)
import React, { Suspense } from 'react';
import VerificationClient from './VerificationClient';

export default function VerificationPage() {
  return (
    <Suspense fallback={<div>Loading verification...</div>}>
      <VerificationClient />
    </Suspense>
  );
}
