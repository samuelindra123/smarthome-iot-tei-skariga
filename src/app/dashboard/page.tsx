// src/app/dashboard/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardHomePage() {
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
        // else normal user stays on welcome page
    }, [user, isLoading, router]);

    if (isLoading) return <main className="min-h-screen flex items-center justify-center">Memeriksa sesi...</main>;

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="max-w-3xl text-center">
                <h1 className="text-4xl font-bold mb-4">Selamat datang di SmartHome</h1>
                <p className="text-gray-400 mb-6">Gunakan menu di atas untuk mengakses panel kontrol perangkat Anda.</p>
                <div className="space-x-3">
                    <a href="/dashboard/control" className="px-4 py-2 bg-yellow-500 text-black rounded font-semibold">Buka Control Panel</a>
                </div>
            </div>
        </main>
    );
}