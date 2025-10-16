// smarthome-dashboard-ts/setup-appwrite.js

const sdk = require('node-appwrite');

// --- Konfigurasi ---
const ENDPOINT = 'https://syd.cloud.appwrite.io/v1'; // Atau endpoint self-hosted kamu
const PROJECT_ID = '68ed023d0003b9495c6d'; // Ganti dengan ID Proyek kamu (atau biarkan 'unique()' untuk membuat baru)
const API_KEY = 'standard_2e4ac19992ef009c4755f091146a82c749638908ff1987f0175d41b8419f3e2a1a46aa11032122c7811935d934bafefc0dbeb2ba9c87da195d4955e0f86dae462b9d0393f55ee625ef2ad24abfde67f87922a250c7c50cfc4bc265662158cac76e2c8e521a6392f7752153427a69b539c5692898361214c8c8199b405d2c54de'; // Ganti dengan API Key kamu dari Appwrite Console
const DATABASE_NAME = 'SmartHomeDB';
const DATABASE_ID = 'smarthome-db';
const USERS_COLLECTION_NAME = 'Users';
const USERS_COLLECTION_ID = 'users';

// Inisialisasi Klien
const client = new sdk.Client();
client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new sdk.Databases(client);

async function setupAppwrite() {
    try {
        console.log('Memulai penyiapan Appwrite...');

        // 1. Membuat Database
        try {
            await databases.get(DATABASE_ID);
            console.log(`Database "${DATABASE_NAME}" sudah ada.`);
        } catch (e) {
            if (e.code === 404) {
                console.log(`Membuat database "${DATABASE_NAME}"...`);
                await databases.create(DATABASE_ID, DATABASE_NAME);
                console.log('Database berhasil dibuat.');
            } else {
                throw e;
            }
        }

        // 2. Membuat Koleksi Pengguna
        try {
            await databases.getCollection(DATABASE_ID, USERS_COLLECTION_ID);
            console.log(`Koleksi "${USERS_COLLECTION_NAME}" sudah ada.`);
        } catch (e) {
            if (e.code === 404) {
                console.log(`Membuat koleksi "${USERS_COLLECTION_NAME}"...`);
                await databases.createCollection(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    USERS_COLLECTION_NAME,
                    [
                        sdk.Permission.read(sdk.Role.any()),
                        sdk.Permission.create(sdk.Role.any()),
                        sdk.Permission.update(sdk.Role.any()),
                        sdk.Permission.delete(sdk.Role.any()),
                    ]
                );
                console.log('Koleksi berhasil dibuat. Menambahkan atribut...');

                // 3. Menambahkan Atribut ke Koleksi
                await databases.createStringAttribute(DATABASE_ID, USERS_COLLECTION_ID, 'name', 255, true); // 'name' tetap wajib diisi
                
                // PERBAIKAN: Atribut 'role' tidak wajib (false) karena memiliki nilai default
                await databases.createStringAttribute(DATABASE_ID, USERS_COLLECTION_ID, 'role', 50, false, 'user'); 

                console.log('Atribut "name" dan "role" berhasil ditambahkan.');

                // Tunggu beberapa saat agar atribut selesai dibuat sebelum membuat indeks
                console.log('Menunggu Appwrite untuk memproses atribut...');
                await new Promise(resolve => setTimeout(resolve, 2000));

                 // 4. Membuat Indeks
                await databases.createIndex(DATABASE_ID, USERS_COLLECTION_ID, 'role_index', 'key', ['role']);
                console.log('Indeks untuk atribut "role" berhasil dibuat.');

            } else {
                throw e;
            }
        }

        console.log('\nPenyiapan Appwrite selesai! 🎉');
        console.log('Pastikan untuk mengisi variabel lingkungan di file .env.local proyek Next.js kamu.');

    } catch (error) {
        console.error('Terjadi kesalahan selama penyiapan Appwrite:');
        console.error(error);
    }
}

setupAppwrite();