import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// 自定义中间件，确保sitemap.xml和robots.txt在根路径可用
export default function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// 对于sitemap.xml和robots.txt特殊处理，让它们不通过语言路由
	if (pathname === "/sitemap.xml" || pathname === "/robots.txt") {
		return NextResponse.next();
	}

	// 其他路径使用next-intl的中间件
	return intlMiddleware(request);
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
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
