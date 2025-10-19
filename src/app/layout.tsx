// smarthome-dashboard-ts/src/app/layout.tsx

import './globals.css';
import ClientProviders from './providers/ClientProviders';

// Force dynamic layout rendering to prevent accidental static export.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Server layout that renders a client boundary for auth/mqtt providers.
  return (
    <html lang="id">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}