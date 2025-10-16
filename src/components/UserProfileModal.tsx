"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: { name?: string; role?: string; $id?: string; email?: string; $createdAt?: string } | null; // user document from DB
  onSave?: (data: { name: string; role: string }) => Promise<void>;
}

export default function UserProfileModal({ open, onClose, user, onSave }: UserProfileModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setRole(user.role || 'user');
    }
  }, [user]);

  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave({ name, role });
      setIsEditing(false);
    } catch (e) {
      console.error('save user failed', e);
      alert('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && user && (
        <motion.div
          ref={backdropRef}
          onMouseDown={onBackdropClick}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-950 to-black border border-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{user.name || '—'}</h3>
                <p className="text-sm text-gray-400">ID: <span className="font-mono text-xs">{user.$id}</span></p>
              </div>
              <div className="flex gap-2 items-center">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-3 py-1 bg-yellow-500 text-black rounded">Edit</button>
                )}
                <button onClick={onClose} className="text-sm text-gray-300 border border-gray-700 px-3 py-1 rounded">Close</button>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nama</label>
                <input disabled={!isEditing} value={name} onChange={e => setName(e.target.value)} className={`w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 ${isEditing ? 'focus:ring-2 focus:ring-yellow-500' : 'opacity-80'}`} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Role</label>
                <select disabled={!isEditing} value={role} onChange={e => setRole(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Dibuat pada</label>
                <div className="text-gray-400 text-xs font-mono">{user.$createdAt ? new Date(user.$createdAt).toLocaleString('id-ID') : 'N/A'}</div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-700 rounded">Batal</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-yellow-500 text-black rounded">{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
