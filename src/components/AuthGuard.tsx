"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'admin') {
      router.replace('/admin/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role === 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Memeriksa akses...</div>;
  }

  return <>{children}</>;
}
