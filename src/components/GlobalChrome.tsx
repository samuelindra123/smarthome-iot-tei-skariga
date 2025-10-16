"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  // Hide global header/footer on admin, dashboard and control routes (we render custom chrome there)
  const hide = pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/control');

  return (
    <>
      {!hide && <Header />}
      {children}
      {!hide && <Footer />}
    </>
  );
}
