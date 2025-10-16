// src/app/admin/dashboard/page.tsx

'use client';

import { useEffect, useState, FormEvent } from 'react';
import UserProfileModal from '@/components/UserProfileModal';
import { Models } from 'appwrite';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type UserDocument = Models.Document & {
    name: string;
    role: 'admin' | 'user';
};

export default function AdminDashboardPage() {
    const [users, setUsers] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const { logout } = useAuth();

    // State untuk form tambah user
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDocument | null>(null);
    const [showProfile, setShowProfile] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
            setUsers(response.documents as unknown as UserDocument[]);
        } catch (err) {
            setError('Gagal memuat data pengguna.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user?.role !== 'admin') {
            router.replace('/dashboard');
            return;
        }
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user, authLoading, router]);

    const handleCreateUser = async (e: FormEvent) => {
        e.preventDefault();
        setIsCreatingUser(true);
        setFormMessage(null);

        try {
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, email: newEmail, password: newPassword, role: newRole }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal membuat pengguna.');
            }

            setFormMessage({ type: 'success', text: `Pengguna "${newName}" berhasil dibuat!` });
            // Reset form
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            setNewRole('user');
            // Muat ulang daftar pengguna
            await fetchUsers();

        } catch (err: unknown) {
            const error = err as { message?: string };
            setFormMessage({ type: 'error', text: error.message || 'Gagal membuat pengguna' });
        } finally {
            setIsCreatingUser(false);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Memuat sesi...</div>;
    }
    
    if (user?.role !== 'admin') {
         return <div className="min-h-screen flex items-center justify-center">Anda tidak punya akses. Mengalihkan...</div>;
    }

    return (
        <main className="min-h-screen w-full bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white px-6 py-24">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                    <div>
                        <button onClick={async () => { await logout(); }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500">Logout</button>
                    </div>
                </div>

                {/* --- Form Tambah Pengguna --- */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6 tracking-tight text-yellow-400">Buat Pengguna Baru</h2>
                    <form onSubmit={handleCreateUser} className="bg-gray-900/40 border border-gray-800 p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             {formMessage && (
                                <div className={`p-3 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                                    {formMessage.text}
                                </div>
                            )}
                        </div>
                        {/* Kolom Input */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">Nama</label>
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
                        </div>
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">Email</label>
                            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
                        </div>
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
                        </div>
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">Role</label>
                            <select value={newRole} onChange={e => setNewRole(e.target.value as 'user' | 'admin')} className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={isCreatingUser} className="w-full md:w-auto px-6 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-400 transition disabled:opacity-50">
                                {isCreatingUser ? 'Menyimpan...' : 'Tambah Pengguna'}
                            </button>
                        </div>
                    </form>
                </section>

                {/* --- Daftar Pengguna --- */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6 tracking-tight text-yellow-400">Daftar Pengguna</h2>
                    <div className="overflow-x-auto border border-gray-800 rounded-lg bg-gray-900/40">
                         {loading ? <p className="p-4 text-center">Memuat pengguna...</p> : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800/60 text-gray-300">
                                    <tr>
                                        <th className="px-4 py-3">Nama</th>
                                        <th className="px-4 py-3">User ID</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Dibuat pada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                                <tr key={u.$id} className="border-t border-gray-800 hover:bg-gray-800/30">
                                            <td className="px-4 py-3 font-medium">{u.name}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-400">{u.$id}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">{new Date(u.$createdAt).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {u.role === 'user' && (
                                                            <div className="relative inline-block text-left">
                                                                <button onClick={() => { setSelectedUser(u); setShowProfile(true); }} className="px-2 py-1 rounded hover:bg-gray-800/30">⋮</button>
                                                            </div>
                                                        )}
                                                    </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         )}
                         {error && <p className="p-4 text-red-400">{error}</p>}
                    </div>
                </section>
                <UserProfileModal open={showProfile} onClose={() => { setShowProfile(false); setSelectedUser(null); }} user={selectedUser} onSave={async ({ name, role }: { name: string; role: string }) => {
                    if (!selectedUser) return;
                    const res = await fetch('/api/users/update', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedUser.$id, name, role }) });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan');
                    await fetchUsers();
                    setShowProfile(false);
                    setSelectedUser(null);
                }} />
            </div>
        </main>
    );
}