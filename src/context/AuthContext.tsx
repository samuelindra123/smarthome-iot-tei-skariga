// src/context/AuthContext.tsx

'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppwriteException, Models } from 'appwrite';
import { account, databases, USERS_COLLECTION_ID, DATABASE_ID } from '@/lib/appwrite';

interface UserData extends Models.User<Models.Preferences> {
    role?: string;
}

interface IAuthContext {
    user: UserData | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const getUserDetails = async (accountData: Models.User<Models.Preferences>): Promise<UserData> => {
        try {
            console.debug('[auth] getUserDetails: fetching user document for', accountData.$id);
            const userDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, accountData.$id);
            console.debug('[auth] getUserDetails: found userDoc', userDoc);
            return { ...accountData, role: userDoc.role || 'user' };
        } catch (error) {
            console.warn("Gagal mengambil role pengguna, fallback ke 'user'.", error);
            return { ...accountData, role: 'user' };
        }
    };

    const checkSession = useCallback(async () => {
        setIsLoading(true); // Mulai loading saat pengecekan
        try {
            console.debug('[auth] checkSession: calling account.get()');
            const accountData = await account.get();
            console.debug('[auth] checkSession: account.get() ->', accountData);
            const userDetails = await getUserDetails(accountData);
            console.debug('[auth] checkSession: userDetails ->', userDetails);
            setUser(userDetails);
            return userDetails;
        } catch (error) {
            console.debug('[auth] checkSession: no active session or error', error);
            setUser(null);
            return null;
        } finally {
            setIsLoading(false); // Selesaikan loading setelah pengecekan
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (email: string, pass: string) => {
        // Cek dulu apakah sudah ada sesi aktif
        try {
            console.debug('[auth] login: checking existing session before creating one');
            const existing = await checkSession();
            console.debug('[auth] login: existing session ->', existing);
            if (existing) {
                // Jika sudah login, langsung arahkan ke dashboard
                console.debug('[auth] login: session exists, redirecting to /dashboard');
                router.replace('/dashboard');
                return;
            }
        } catch (e) {
            // Jika gagal cek session, kita lanjut mencoba membuat session baru
            console.debug('[auth] Tidak dapat mengecek session sebelum login, melanjutkan...', e);
        }

        try {
            console.debug('[auth] login: creating email/password session for', email);
            await account.createEmailPasswordSession(email, pass);
            console.debug('[auth] login: createEmailPasswordSession resolved; checking session');
            const userDetails = await checkSession();
            console.debug('[auth] login: post-create session check ->', userDetails);
            if (userDetails) {
                console.debug('[auth] login: redirecting to /dashboard');
                router.replace('/dashboard');
            }
        } catch (error) {
            if (error instanceof AppwriteException) {
                const appwriteError = error as AppwriteException & { type?: string; response?: unknown };
                console.error('[auth] Appwrite error saat login:', {
                    code: error.code,
                    message: error.message,
                    type: appwriteError.type,
                    response: appwriteError.response,
                });

                // Jika Appwrite menolak karena sesi sudah ada, ambil detail session dan redirect
                const errType = appwriteError.type;
                if (error.code === 401 && errType === 'user_session_already_exists') {
                    try {
                        console.debug('[auth] login: server reported session exists, trying to retrieve it via checkSession');
                        const userDetails = await checkSession();
                        console.debug('[auth] login: checkSession returned', userDetails);
                        if (userDetails) {
                            console.debug('[auth] login: session retrieved, redirecting');
                            router.push('/dashboard');
                            return;
                        }
                    } catch (e) {
                        // Jika retrieval session gagal, hapus sesi lalu coba buat ulang
                        console.debug('[auth] login: checkSession failed after session-already-exists; attempting deleteSession and recreate', e);
                        try {
                            const del = await account.deleteSession('current');
                            console.debug('[auth] login: deleteSession result', del);
                            // setelah menghapus sesi, coba buat session baru sekali lagi
                            const created = await account.createEmailPasswordSession(email, pass);
                            console.debug('[auth] login: createEmailPasswordSession after delete ->', created);
                            const userDetails = await checkSession();
                            console.debug('[auth] login: post-recreate checkSession ->', userDetails);
                            if (userDetails) {
                                console.debug('[auth] login: redirecting after recreate');
                                router.push('/dashboard');
                            }
                            return;
                        } catch (innerErr) {
                            console.error('[auth] Gagal merecovery atau recreate session:', innerErr);
                            setUser(null);
                            throw innerErr;
                        }
                    }
                }

                setUser(null);
                throw error;
            }
            setUser(null);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            router.replace('/login');
        } catch (error) {
            console.error("Gagal logout:", error);
        }
    };

    const value = { user, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }
    return context;
};