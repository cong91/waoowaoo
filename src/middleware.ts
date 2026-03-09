import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n';

export default createMiddleware({
    // 支持的所有语言
    locales,

    // 默认语言
    defaultLocale,

    // URL 路径策略: 始终显示语言前缀
    localePrefix: 'always',

    // 语言检测: 根据 Accept-Language header 自动检测
    localeDetection: true
});

export const config = {
    // Match all app routes, but exclude API/static/internal endpoints.
    matcher: [
        '/',
        '/(zh|en|vi|ko)/:path*',
        '/((?!api|m|_next/static|_next/image|_vercel|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|.*\\.ico).*)'
    ]
};
