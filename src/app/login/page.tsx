// src/app/login/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Email dan password harus diisi.');
            return;
        }

        setError(null);
        try {
            // Fungsi login sekarang akan otomatis mengarahkan ke /dashboard
            await login(email, password);
        } catch (err: unknown) {
            // Jika Appwrite mengembalikan pesan, tampilkan ke pengguna dengan pesan yang ramah
            const error = err as { type?: string; message?: string };
            if (error && error.type === 'user_session_already_exists') {
                setError('Sesi pengguna sudah aktif pada browser ini. Anda sudah login — diarahkan ke dashboard.');
            } else if (error && error.message) {
                setError(`Gagal login: ${error.message}`);
            } else {
                setError('Gagal login. Periksa kembali email dan password Anda.');
            }
        }
    };

    // Hapus semua logika useEffect dan kondisi if(user) dari sini.
    // Middleware akan mencegah halaman ini ditampilkan jika sudah login.

    return (
        <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
                    <h1 className="text-3xl font-bold text-center mb-2 tracking-tight text-yellow-400">Login</h1>
                    <p className="text-center text-gray-400 text-sm mb-8">Masuk untuk mengakses dashboard.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                                placeholder="nama@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md p-3 text-center">
                                {error}
                            </p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isLoading ? 'Memproses...' : 'Login'}
                            </button>
                        </div>
                        <div className="mt-4 text-xs text-gray-400">
                            <p className="mb-2">Butuh akses akun atau mengalami masalah login?</p>
                            <p>Hubungi admin untuk meminta akses atau bantuan.</p>
                            <div className="mt-3">
                                <Link href="/hubungi-admin" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold">
                                    Halaman Hubungi Admin
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}