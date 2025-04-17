'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import HelpCenter from '@/components/help/HelpCenter';

export default function HelpCenterPage() {
  return (
    <AppShell>
      <HelpCenter />
    </AppShell>
  );
}