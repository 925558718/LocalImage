import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取响应
  const response = NextResponse.next();
  
  // 添加X-Robots-Tag头部，允许索引和跟踪
  response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  
  return response;
}

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
