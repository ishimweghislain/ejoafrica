import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_for_dev_only"
);

export default async function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);

            // Basic role protection check can be added here if needed
            // For now, any valid token allows access to the dashboard base
            // Specific page-level restrictions are handled in the layout/components

            return NextResponse.next();
        } catch (err) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect from login to dashboard if already authenticated
    if (request.nextUrl.pathname === '/login' && token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch (err) {
            // Token invalid, allow login page
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
