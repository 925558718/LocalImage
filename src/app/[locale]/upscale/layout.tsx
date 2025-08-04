import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import PageTitle from "@/components/PageTitle";
import {
	defaultLocale,
	dictionaries,
	getNormalizedLocale,
	supportedLocales,
} from "@/i18n/langMap";

// 动态生成元数据
export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);
	const dictionary = await dictionaries[locale]();

	const title =
		dictionary.upscale_meta_title ||
		"Image Upscaler & Resizer - Enhance & Resize Images | LocalImage";
	const description =
		dictionary.upscale_meta_description ||
		"Free online image upscaler and resizer tool. Use advanced algorithms to enhance image resolution, resize images, and make blurry images sharp. Local processing protects privacy.";

	// 构建基础URL
	const baseUrl = "https://limgx.com";

	// 构建当前语言的URL (默认语言不需要语言前缀)
	const currentUrl =
		locale === defaultLocale
			? `${baseUrl}/upscale`
			: `${baseUrl}/${locale}/upscale`;

	// 构建备用语言链接
	const languageAlternates: Record<string, string> = {};

	// 添加默认语言链接
	languageAlternates[defaultLocale] = `${baseUrl}/upscale`;

	// 添加其他语言链接
	for (const lang of supportedLocales) {
		if (lang !== defaultLocale) {
			languageAlternates[lang] = `${baseUrl}/${lang}/upscale`;
		}
	}

	// 添加x-default指向默认语言
	languageAlternates["x-default"] = `${baseUrl}/upscale`;

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

export default async function UpscaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);
	const dictionary = await dictionaries[locale]();

	return (
		<NextIntlClientProvider locale={locale} messages={dictionary}>
			<div className="w-full max-w-7xl mx-auto px-4 py-8">
				<PageTitle
					title={dictionary.upscale_composer || "Image Upscaler"}
					description={
						dictionary.upscale_desc ||
						"Use advanced algorithms to enhance image resolution and make low-resolution images crisp"
					}
				/>
				{children}
			</div>
		</NextIntlClientProvider>
	);
}
