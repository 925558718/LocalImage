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

	// 标题和描述支持多语言 - 更新为压缩功能的SEO
	const title =
		dictionary.compress_meta_title ||
		"Compress & Convert Images - LocalImage | Free Online Image Compression";
	const description =
		dictionary.compress_meta_description ||
		"Free online image compression & conversion tool. Reduce size or convert formats, all processed locally for privacy.";

	// 构建基础URL
	const baseUrl = "https://limgx.com";

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
			dictionary.compress_meta_keywords ||
			"image compression, compress images online, reduce image size, JPG compressor, PNG compressor, photo compression tool, image conversion",
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
		dictionary.structured_data_app_name || "LocalImage Image Compression Tool";
	const appDescription =
		dictionary.structured_data_description ||
		"Free online image compression and conversion tool. Reduce file size or change formats with local processing.";
	const featureList = dictionary.structured_data_features || [
		"Image compression and optimization",
		"Multiple image format support",
		"Local processing protects privacy",
		"No server uploads required",
		"Custom quality settings",
		"Batch processing functionality",
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
						url: "https://limgx.com",
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
							"https://limgx.com/images/image-compression-preview.jpg",
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
								<div className="relative min-h-screen w-full overflow-hidden">
									{/* 共享的装饰性背景 */}
									<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900" />
									
									{/* 装饰性背景元素 */}
									<div className="absolute inset-0 overflow-hidden">
										<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
										<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl" />
										<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />
									</div>
									
									{/* 内容区域 */}
									<div className="relative z-10">
										{children}
									</div>
								</div>
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
