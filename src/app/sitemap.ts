import { MetadataRoute } from "next";
import { defaultLocale, supportedLocales } from "@/i18n/langMap";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://limgx.com";

	// Basic route list, animation creator as main feature
	const routes = [
		{
			path: "/animation", // Homepage - WebP Animation Creator
			priority: 1.0,
			changeFreq: "daily" as const,
			description: "WebP Animation Creator Homepage",
		},
		{
			path: "/", // Image Compression Page
			priority: 0.8,
			changeFreq: "weekly" as const,
			description: "Image Compression Tool Page",
		},
		{
			path: "/upscale", // Image Upscale Page
			priority: 0.9,
			changeFreq: "weekly" as const,
			description: "Image Upscale Tool Page",
		},
		{
			path: "/crop", // Image Crop Page
			priority: 0.9,
			changeFreq: "weekly" as const,
			description: "Image Crop Tool Page",
		},
	];

	const currentDate = new Date().toISOString();

	// 生成所有语言和路由的组合
	const sitemapEntries: MetadataRoute.Sitemap = [];

	// 为每个路由和每种语言生成条目
	for (const route of routes) {
		// 为默认语言生成无语言前缀的URL（默认路径）
		sitemapEntries.push({
			url: `${baseUrl}${route.path}`,
			lastModified: currentDate,
			changeFrequency: route.changeFreq,
			priority: route.priority,
		});

		// 为每种支持的语言生成带语言前缀的URL
		for (const locale of supportedLocales) {
			// 默认语言已经添加过了（没有前缀）
			if (locale === defaultLocale) continue;

			// 添加带语言前缀的URL
			sitemapEntries.push({
				url: `${baseUrl}/${locale}${route.path}`,
				lastModified: currentDate,
				changeFrequency: route.changeFreq,
				priority: route.priority,
			});
		}
	}

	return sitemapEntries;
}
