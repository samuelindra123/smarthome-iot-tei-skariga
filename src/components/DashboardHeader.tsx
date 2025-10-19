"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-gray-900/80 backdrop-blur border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="text-base md:text-lg font-bold">SmartHome SKARIGA</Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-gray-800 transition-colors">Home</Link>
          <Link href="/dashboard/control" className="px-3 py-2 rounded bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors">Control</Link>
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden md:block relative">
          <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 transition-colors">
            <span className="text-sm">{user?.name || user?.email || 'User'}</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg py-2 z-50">
              <div className="px-3 py-2 text-sm text-gray-200">{user?.name || user?.email || 'User'}</div>
              <div className="px-3 py-2 text-xs text-gray-400 truncate">{user?.$id}</div>
              <div className="border-t border-gray-700 mt-2" />
              <button onClick={() => { logout(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors">Logout</button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          aria-label="Toggle mobile menu"
          onClick={() => setMobileMenuOpen(v => !v)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:bg-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded hover:bg-gray-800 transition-colors">Home</Link>
            <Link href="/dashboard/control" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors">Control</Link>
            
            <div className="border-t border-gray-700 my-2" />
            
            <div className="px-3 py-2 text-sm text-gray-200">{user?.name || user?.email || 'User'}</div>
            <div className="px-3 py-2 text-xs text-gray-400 truncate">{user?.$id}</div>
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded transition-colors">Logout</button>
          </div>
        </div>
      )}
    </header>
  );
}
