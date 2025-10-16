"use client";

import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DashboardHeader />
      <div>{children}</div>
    </div>
  );
}
