import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match all app routes, but exclude API/static/internal endpoints.
    matcher: [
        '/',
        '/(zh|en|vi|ko)/:path*',
        '/((?!api|m|_next/static|_next/image|_vercel|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|.*\\.ico).*)'
    ]
};
