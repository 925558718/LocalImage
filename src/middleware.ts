import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import createMiddleware from 'next-intl/middleware';

export default createMiddleware(routing);

export const middleware = createMiddleware(routing);

// 配置中间件应用于所有路由
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - API路由
     * - 静态文件 (例如：图片、JS、CSS等)
     * - 系统文件 (_next, favicon.ico等)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
