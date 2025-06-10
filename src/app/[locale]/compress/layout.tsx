import type { Metadata } from "next";
import {
	getNormalizedLocale,
	dictionaries,
	defaultLocale,
	supportedLocales,
} from "@/i18n/langMap";

export async function generateMetadata({
	params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	// 等待参数解析并标准化语言代码
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);

	// 加载对应语言的字典
	const dictionary = await dictionaries[locale]();

	// 标题和描述支持多语言
	const title =
		dictionary.compress_meta_title ||
		"Image Compressor - LocalImage | Reduce Image Size";
	const description =
		dictionary.compress_meta_description ||
		"Free online image compression tool. Reduce image file sizes without losing quality. Supports JPG, PNG, WebP formats with local processing for privacy protection.";
	const keywords =
		dictionary.compress_meta_keywords ||
		"image compression, compress images online, reduce image size, JPG compressor, PNG compressor";

	// 构建基础URL
	const baseUrl = "https://limgx.com";

	// 构建当前语言的URL (默认语言不需要语言前缀)
	const currentUrl =
		locale === defaultLocale 
			? `${baseUrl}/compress` 
			: `${baseUrl}/${locale}/compress`;

	// 构建备用语言链接
	const languageAlternates: Record<string, string> = {};

	// 添加默认语言链接
	languageAlternates[defaultLocale] = `${baseUrl}/compress`;

	// 添加其他语言链接
	for (const lang of supportedLocales) {
		if (lang !== defaultLocale) {
			languageAlternates[lang] = `${baseUrl}/${lang}/compress`;
		}
	}

	return {
		title,
		description,
		keywords,
		authors: [{ name: "limgx.com" }],
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1,
			},
		},
		alternates: {
			canonical: currentUrl,
			languages: languageAlternates,
		}
	};
}

export default function CompressLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
} 