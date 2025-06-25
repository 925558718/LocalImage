import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
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



	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				{/* 多语言SEO优化 */}
				<meta httpEquiv="content-language" content={locale} />
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
									<div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-primary/10" />
									
									{/* 装饰性背景元素 */}
									<div className="absolute inset-0 overflow-hidden">
										<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-3xl" />
										<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full blur-3xl" />
										<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl" />
									</div>
									
									{/* 内容区域 */}
									<main className="w-full min-h-screen flex flex-col items-center p-4">
										{children}
									</main>
								</div>
								<Footer />
								<Toaster />
							</JotaiProvider>
						</NextIntlClientProvider>
					</ThemeProvider>
				</BugsnagErrorBoundary>
			</body>
		</html>
	);
}
