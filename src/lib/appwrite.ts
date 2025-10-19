// smarthome-dashboard-ts/src/lib/appwrite.ts

import { Client, Account, Databases } from 'appwrite';

// Read env vars (may be undefined in some dev/test environments)
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

export const APPWRITE_ENABLED = Boolean(endpoint && projectId);

let client: Client | null = null;
let account!: Account;
let databases!: Databases;

if (APPWRITE_ENABLED) {
  client = new Client();
  client.setEndpoint(endpoint!).setProject(projectId!);
  account = new Account(client);
  databases = new Databases(client);
} else {
  // Provide lightweight stubs so imports don't throw during SSR/build.
  // AuthContext and other callers already handle runtime errors; stubs make module import safe.
  console.warn('[appwrite] NEXT_PUBLIC_APPWRITE_ENDPOINT or NEXT_PUBLIC_APPWRITE_PROJECT_ID not set - Appwrite disabled.');
  const accountStub = {
    get: async () => { throw new Error('Appwrite not configured (NEXT_PUBLIC_APPWRITE_ENDPOINT/PROJECT_ID missing)'); },
    createEmailPasswordSession: async () => { throw new Error('Appwrite not configured'); },
    deleteSession: async () => { throw new Error('Appwrite not configured'); },
  } as unknown as Account;

  const databasesStub = {
    getDocument: async () => { throw new Error('Appwrite not configured'); },
  } as unknown as Databases;

  account = accountStub;
  databases = databasesStub;
}

export { account, databases };

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';

export default client;