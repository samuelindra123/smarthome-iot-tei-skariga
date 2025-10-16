import React from 'react';
import DashboardHeader from '../../components/DashboardHeader';

export const metadata = {
  title: 'Control - SmartHome SKARIGA',
};

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
