import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[health] GET /health requested');
  return NextResponse.json({ status: 'ok' });
}
