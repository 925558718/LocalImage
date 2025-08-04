import type { Metadata } from "next";
import {
	defaultLocale,
	dictionaries,
	getNormalizedLocale,
	supportedLocales,
} from "@/i18n/langMap";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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

	// 添加x-default指向默认语言
	languageAlternates["x-default"] = `${baseUrl}/animation`;

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
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
