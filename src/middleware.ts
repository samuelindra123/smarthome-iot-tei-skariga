// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    if (!projectId) {
        console.error("Middleware Error: NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set!");
        return NextResponse.next();
    }
    const sessionCookieName = `a_session_${projectId}`;
    const sessionCookie = request.cookies.get(sessionCookieName);
    const { pathname } = request.nextUrl;

    // Jika ada sesi aktif, jangan biarkan user membuka /login
    if (sessionCookie && pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // NOTE: earlier we redirected unauthenticated requests from /dashboard or /admin
    // back to /login on the server side. During local development with Appwrite Cloud
    // the auth cookie may not be available to Next's middleware, which caused a
    // redirect loop (client thinks it's authenticated while the server does not).
    // To avoid that problem we no longer enforce server-side redirects for
    // /dashboard and /admin here — client-side `checkSession()` will still
    // redirect the user to /login when appropriate.
    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/dashboard/:path*', '/admin/:path*'],
};