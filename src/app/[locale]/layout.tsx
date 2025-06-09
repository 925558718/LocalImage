import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Open_Sans, Inter } from "next/font/google";
import clsx from "clsx";
import { Toaster } from "@/components/shadcn/sonner";
import { Provider as JotaiProvider } from "jotai";
import { NextIntlClientProvider } from "next-intl";
import {
	getNormalizedLocale,
	dictionaries,
	defaultLocale,
	getOpenGraphLocale,
	SupportedLocale,
	supportedLocales,
} from "@/i18n/langMap";
import BugsnagErrorBoundary from "@/components/Bugsnap";
// import Bugsnag from "@bugsnag/js";
// import BugsnagPluginReact from "@bugsnag/plugin-react";
// import BugsnagPerformance from "@bugsnag/browser-performance";
// import React from "react";
// Bugsnag.start({
// 	apiKey: "841d9857e90394f3e59323ad57e3795c",
// 	plugins: [new BugsnagPluginReact()],
// });
// BugsnagPerformance.start({ apiKey: "841d9857e90394f3e59323ad57e3795c" });

// const ErrorBoundary = Bugsnag?.getPlugin("react")?.createErrorBoundary(React);

const Opensans = Open_Sans({
	subsets: ["latin"],
	variable: "--font_os",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["400", "500", "600", "700", "800", "900"],
});

// 动态生成元数据
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
		dictionary.meta_title ||
		"WebP Animation Creator - LocalImage | Convert Images";
	const description =
		dictionary.meta_description ||
		"Free online WebP and GIF animation creator. Convert multiple images into high-quality animations with local processing. No uploads required, privacy protected.";

	// 获取OpenGraph格式的locale
	const ogLocale = getOpenGraphLocale(locale);

	// 构建其他语言的alternate locales
	const alternateLocales = [
		"en_US",
		"zh_CN",
		"ja_JP",
		"es_ES",
		"fr_FR",
		"de_DE",
		"ru_RU",
	].filter((l) => l !== ogLocale);

	// 构建基础URL
	const baseUrl = "https://www.limgx.com";

	// 构建当前语言的URL (默认语言不需要语言前缀)
	const currentUrl =
		locale === defaultLocale ? baseUrl : `${baseUrl}/${locale}`;

	// 构建备用语言链接
	const languageAlternates: Record<string, string> = {};

	// 添加默认语言链接
	languageAlternates[defaultLocale] = baseUrl;

	// 添加其他语言链接
	for (const lang of supportedLocales) {
		if (lang !== defaultLocale) {
			languageAlternates[lang] = `${baseUrl}/${lang}`;
		}
	}

	return {
		title,
		description,
		keywords:
			dictionary.meta_keywords ||
			"WebP animation, GIF creator, animation creator, image to animation, online animation tool",
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
		openGraph: {
			title,
			description,
			type: "website",
			url: currentUrl,
			images: ["https://www.limgx.com/images/webp-animation-preview.jpg"],
			siteName: "LocalImage WebP Animation Creator",
			locale: ogLocale,
			alternateLocale: alternateLocales,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ["https://www.limgx.com/images/webp-animation-preview.jpg"],
			creator: "@limgx_official",
		},
		alternates: {
			canonical: currentUrl,
			languages: languageAlternates,
		},
	};
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	// 等待参数解析并标准化语言代码
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);

	// 加载当前语言的字典
	const dictionary = await dictionaries[locale]();

	// 动态生成结构化数据
	const appName =
		dictionary.structured_data_app_name || "LocalImage WebP Animation Creator";
	const appDescription =
		dictionary.structured_data_description ||
		"Free online WebP animation creator. Convert multiple images into high-quality animations";
	const featureList = dictionary.structured_data_features || [
		"WebP animation creation",
		"Multiple image format support",
		"Local processing protects privacy",
		"No server uploads required",
		"Custom frame rate and quality",
		"Real-time preview functionality",
	];

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				{/* 多语言SEO优化 */}
				<meta httpEquiv="content-language" content={locale} />

				{/* 结构化数据 - WebP动画合成器 */}
				<script type="application/ld+json">
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebApplication",
						name: appName,
						description: appDescription,
						url: "https://www.limgx.com",
						applicationCategory: "MultimediaApplication",
						operatingSystem: "Web Browser",
						inLanguage: locale,
						offers: {
							"@type": "Offer",
							price: "0",
							priceCurrency: "USD",
						},
						featureList: featureList,
						screenshot:
							"https://www.limgx.com/images/webp-animation-preview.jpg",
						softwareVersion: "1.0",
						author: {
							"@type": "Organization",
							name: "limgx.com",
							url: "https://www.limgx.com",
						},
						aggregateRating: {
							"@type": "AggregateRating",
							ratingValue: "4.8",
							ratingCount: "1250",
						},
					})}
				</script>
				<script
					src="https://analytics.ahrefs.com/analytics.js"
					data-key="fAy0GhLZ8HwbJfkrQ3zMOw"
					async
				/>
			</head>
			<body
				className={clsx(
					"bg-background text-foreground",
					Opensans.variable,
					inter.variable,
				)}
			>
				<BugsnagErrorBoundary>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						disableTransitionOnChange
						enableSystem={false}
					>
						<NextIntlClientProvider locale={locale} messages={dictionary}>
							<JotaiProvider>
								<Header />
								{children}
								<Footer />
								<Toaster />
							</JotaiProvider>
						</NextIntlClientProvider>
					</ThemeProvider>
				</BugsnagErrorBoundary>
				<GoogleAnalytics gaId="G-89618T8EX2" />
			</body>
		</html>
	);
}
