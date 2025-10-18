// smarthome-dashboard-ts/src/app/layout.tsx

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import GlobalChrome from '@/components/GlobalChrome';
import { MqttProvider } from '@/lib/mqtt';
import { AuthProvider } from '@/context/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'SmartHome SKARIGA',
  description: 'Dashboard IoT ESP32-S2 Mini 4-Channel Relay oleh siswa SKARIGA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="id" data-scroll-behavior="smooth" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-yellow-500/30 selection:text-yellow-100`}>
        <link rel="manifest" href="/manifest.json" />
        <AuthProvider>
          <MqttProvider>
            {/* GlobalChrome will hide Header/Footer on admin routes */}
            <GlobalChrome>
              {children}
            </GlobalChrome>
          </MqttProvider>
        </AuthProvider>
      </body>
    </html>
  );
}