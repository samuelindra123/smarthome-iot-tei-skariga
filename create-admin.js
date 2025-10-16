// smarthome-dashboard-ts/create-admin.js

const sdk = require('node-appwrite');

// --- Konfigurasi (Pastikan ini sudah benar) ---
const ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const PROJECT_ID = '68ed023d0003b9495c6d';
const API_KEY = 'standard_2e4ac19992ef009c4755f091146a82c749638908ff1987f0175d41b8419f3e2a1a46aa11032122c7811935d934bafefc0dbeb2ba9c87da195d4955e0f86dae462b9d0393f55ee625ef2ad24abfde67f87922a250c7c50cfc4bc265662158cac76e2c8e521a6392f7752153427a69b539c5692898361214c8c8199b405d2c54de';
const DATABASE_ID = 'smarthome-db';
const USERS_COLLECTION_ID = 'users';

// --- Kredensial Admin ---
const ADMIN_EMAIL = 'comdonate9@gmail.com';
const ADMIN_PASSWORD = 'devwebxyn123';
const ADMIN_NAME = 'Admin';

// Inisialisasi Klien (Server-side)
const client = new sdk.Client();
client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const users = new sdk.Users(client);
const databases = new sdk.Databases(client);

async function createAdminUser() {
    try {
        // --- BLOK BARU: Validasi dan Pembuatan Atribut ---
        console.log('Memeriksa atribut di koleksi "Users"...');
        const userCollection = await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID);
        
        const hasNameAttribute = userCollection.attributes.some(attr => attr.key === 'name');
        const hasRoleAttribute = userCollection.attributes.some(attr => attr.key === 'role');
        let attributesModified = false;

        if (!hasNameAttribute) {
            console.log('Atribut "name" tidak ditemukan. Membuat...');
            await databases.createStringAttribute(DATABASE_ID, USERS_COLLECTION_ID, 'name', 255, true);
            console.log('Atribut "name" berhasil dibuat.');
            attributesModified = true;
        }

        if (!hasRoleAttribute) {
            console.log('Atribut "role" tidak ditemukan. Membuat...');
            // 'required' di-set ke false karena kita memberikan nilai default.
            await databases.createStringAttribute(DATABASE_ID, USERS_COLLECTION_ID, 'role', 50, false, 'user');
            console.log('Atribut "role" berhasil dibuat.');
            attributesModified = true;
        }

        if(attributesModified) {
            console.log('Memberi jeda agar Appwrite memproses atribut baru...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Jeda 2 detik
        } else {
            console.log('Semua atribut yang diperlukan sudah ada.');
        }
        // --- AKHIR BLOK BARU ---


        console.log(`\nMencari pengguna dengan email: ${ADMIN_EMAIL}...`);
        
        const existingUsers = await users.list({ search: ADMIN_EMAIL });
        if (existingUsers.total > 0) {
            console.log('Pengguna admin sudah ada di sistem autentikasi. Tidak ada yang perlu dibuat.');
            return;
        }

        console.log('Pengguna admin tidak ditemukan. Membuat akun baru...');
        
        const userId = sdk.ID.unique();
        const newAdmin = await users.create(
            userId,
            ADMIN_EMAIL,
            null,
            ADMIN_PASSWORD,
            ADMIN_NAME
        );
        console.log(`Akun autentikasi untuk ${ADMIN_NAME} berhasil dibuat dengan ID: ${newAdmin.$id}`);

        await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            newAdmin.$id,
            {
                name: ADMIN_NAME,
                role: 'admin',
            }
        );
        console.log(`Dokumen di database untuk ${ADMIN_NAME} dengan role 'admin' berhasil dibuat.`);
        console.log('\nPengguna admin berhasil disiapkan! ✅');

    } catch (error) {
        console.error('Terjadi kesalahan saat membuat pengguna admin:');
        console.error(error);
    }
}

createAdminUser();