"use client";

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { MqttProvider } from '@/lib/mqtt';
import GlobalChrome from '@/components/GlobalChrome';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MqttProvider>
        <GlobalChrome>{children}</GlobalChrome>
      </MqttProvider>
    </AuthProvider>
  );
}
