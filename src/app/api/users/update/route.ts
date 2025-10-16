import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role } = body;
    if (!id || !name || !role) return NextResponse.json({ message: 'Missing fields' }, { status: 400 });

    const updated = await databases.updateDocument(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!, process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!, id, { name, role });
    return NextResponse.json({ message: 'Updated', updated }, { status: 200 });
  } catch (e: any) {
    console.error('update user error', e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  }
}
