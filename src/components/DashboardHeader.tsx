"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-gray-900/80 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">SmartHome SKARIGA</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-gray-800">Home</Link>
            <Link href="/dashboard/control" className="px-3 py-2 rounded bg-yellow-500 text-black font-semibold">Control</Link>
          </nav>
        </div>

        <div className="relative">
          <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800">
            <span className="text-sm">{user?.name || user?.email || 'User'}</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg py-2">
              <div className="px-3 py-2 text-sm text-gray-200">{user?.name || user?.email || 'User'}</div>
              <div className="px-3 py-2 text-xs text-gray-400">{user?.$id}</div>
              <div className="border-t border-gray-700 mt-2" />
              <button onClick={() => { logout(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
