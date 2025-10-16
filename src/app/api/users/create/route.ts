// src/app/api/users/create/route.ts

import { NextResponse } from 'next/server';
import { Client, Users, Databases, ID } from 'node-appwrite';

// Inisialisasi SDK Appwrite sisi server
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!); // Menggunakan API Key rahasia

const users = new Users(client);
const databases = new Databases(client);

export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        // Validasi input dasar
        if (!name || !email || !password || !role) {
            return NextResponse.json({ message: 'Semua field harus diisi.' }, { status: 400 });
        }

        // TODO: Tambahkan validasi di sini untuk memastikan hanya admin yang bisa memanggil endpoint ini
        // Untuk sekarang, kita lanjutkan

        // 1. Buat akun di Appwrite Auth
        const newUser = await users.create(
            ID.unique(),
            email,
            undefined,
            password,
            name
        );

        // 2. Buat dokumen di database kita dengan role yang sesuai
        await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            newUser.$id, // Gunakan ID dari pengguna yang baru dibuat
            {
                name: name,
                role: role,
            }
        );

        return NextResponse.json({ message: 'Pengguna berhasil dibuat!', user: newUser }, { status: 201 });

    } catch (error: unknown) {
        console.error('Error membuat pengguna:', error);
        // Tangani error jika pengguna sudah ada
        const err = error as { code?: number };
        if (err.code === 409) {
             return NextResponse.json({ message: 'Pengguna dengan email ini sudah ada.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
    }
}