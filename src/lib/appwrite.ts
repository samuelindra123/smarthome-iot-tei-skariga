// smarthome-dashboard-ts/src/lib/appwrite.ts

import { Client, Account, Databases } from 'appwrite';

// Validasi variabel lingkungan
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error("Harap definisikan NEXT_PUBLIC_APPWRITE_ENDPOINT dan NEXT_PUBLIC_APPWRITE_PROJECT_ID di .env.local");
}

const client = new Client();

client
    .setEndpoint(endpoint)
    .setProject(projectId);

// Ekspor instance yang akan kita gunakan di seluruh aplikasi
export const account = new Account(client);
export const databases = new Databases(client);

// Ekspor ID untuk konsistensi
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export default client;