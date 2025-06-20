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

	// 标题和描述支持多语言 - 动画功能
	const title = dictionary.meta_title;
	const description = dictionary.meta_description;

	// 构建基础URL
	const baseUrl = "https://limgx.com";

	// 构建当前语言的URL (默认语言不需要语言前缀)
	const currentUrl =
		locale === defaultLocale
			? `${baseUrl}/animation`
			: `${baseUrl}/${locale}/animation`;

	// 构建备用语言链接
	const languageAlternates: Record<string, string> = {};

	// 添加默认语言链接
	languageAlternates[defaultLocale] = `${baseUrl}/animation`;

	// 添加其他语言链接
	for (const lang of supportedLocales) {
		if (lang !== defaultLocale) {
			languageAlternates[lang] = `${baseUrl}/${lang}/animation`;
		}
	}

	return {
		title,
		description,
		authors: [{ name: "limgx.com" }],
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		alternates: {
			canonical: currentUrl,
			languages: languageAlternates,
		},
	};
}

export default async function AnimationLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	// 等待参数解析并标准化语言代码
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);

	// 加载当前语言的字典
	const dictionary = await dictionaries[locale]();

	// 动态生成结构化数据 - 动画功能
	const appName =
		dictionary.structured_data_app_name
	const appDescription =
		dictionary.structured_data_description
	const featureList = dictionary.structured_data_features || [
		"WebP animation creation",
		"Multiple image format support",
		"Local processing protects privacy",
		"No server uploads required",
		"Custom frame rate and quality",
		"Real-time preview functionality",
	];

	return (
		<>
			{/* 结构化数据 - WebP动画合成器 */}
			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebApplication",
					name: appName,
					description: appDescription,
					url: "https://limgx.com/animation",
					applicationCategory: "MultimediaApplication",
					operatingSystem: "Web Browser",
					inLanguage: locale,
					offers: {
						"@type": "Offer",
						price: "0",
						priceCurrency: "USD",
					},
					featureList: featureList,
					screenshot: "https://static.limgx.com/screenshot.png",
					softwareVersion: "1.0",
					author: {
						"@type": "Organization",
						name: "limgx.com",
						url: "https://limgx.com",
					},
					aggregateRating: {
						"@type": "AggregateRating",
						ratingValue: "4.8",
						ratingCount: "1250",
					},
				})}
			</script>
			{children}
		</>
	);
}
