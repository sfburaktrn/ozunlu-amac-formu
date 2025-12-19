import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if path starts with /admin/dashboard
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
        const session = request.cookies.get('admin_session');

        if (!session) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/dashboard/:path*',
};
