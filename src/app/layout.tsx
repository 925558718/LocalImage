import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/hooks/useI18n";
import { headers } from "next/headers";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Open_Sans, Inter } from "next/font/google";
import clsx from "clsx";
import { Toaster } from "@/components/shadcn/sonner";

const Opensans = Open_Sans({
	subsets: ["latin"],
	variable: "--font_os"
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["400", "500", "600", "700", "800", "900"]
});
export const metadata: Metadata = {
	title: "LocalImage - WebP Animation Creator",
	description: "Free online WebP animation creator. Convert multiple images into high-quality animations with local processing. No uploads required.",
	keywords: "WebP animation, animation creator, image to animation, online animation tool, local processing, privacy",
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
	openGraph: {
		title: "LocalImage - WebP Animation Creator",
		description: "Free online WebP animation creator. Convert multiple images into high-quality animations with local processing. No uploads required.",
		type: "website",
		url: "https://www.limgx.com",
		images: ["https://www.limgx.com/images/webp-animation-preview.jpg"],
		siteName: "LocalImage WebP Animation Creator",
		locale: "en_US",
		alternateLocale: ["zh_CN", "ja_JP", "es_ES", "fr_FR", "de_DE"],
	},
	twitter: {
		card: "summary_large_image",
		title: "LocalImage - WebP Animation Creator",
		description: "Free online WebP animation creator. Convert multiple images into high-quality animations with local processing.",
		images: ["https://www.limgx.com/images/webp-animation-preview.jpg"],
		creator: "@limgx_official",
	},
	alternates: {
		canonical: "https://www.limgx.com",
	}
};

const dictionaries = {
	en: () => import("public/i18n/en.json").then((module) => module.default),
	"zh-CN": () => import("public/i18n/zh-CN.json").then((module) => module.default),
	zh: () => import("public/i18n/zh-CN.json").then((module) => module.default),
	es: () => import("public/i18n/es.json").then((module) => module.default),
	fr: () => import("public/i18n/fr.json").then((module) => module.default),
	de: () => import("public/i18n/de.json").then((module) => module.default),
	ja: () => import("public/i18n/ja.json").then((module) => module.default)
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersList = await headers();
	const acceptLanguage = headersList.get("accept-language");
	const preferredLocale = acceptLanguage?.split(",")[0] || "en";
	// 检查是否支持该语言，如果不支持则使用英语
	const supportedLocales = Object.keys(dictionaries);
	let locale = "en";

	if (supportedLocales.includes(preferredLocale)) {
		locale = preferredLocale;
	} else if (preferredLocale.startsWith("zh")) {
		// 对于中文的各种变体，都使用zh-CN
		locale = "zh-CN";
	}

	console.log("User locale:", preferredLocale, "Using:", locale);
	const dictionary = await dictionaries[locale as keyof typeof dictionaries]();
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
						"name": locale === "zh-CN" ? "LocalImage WebP动画合成器" : "LocalImage WebP Animation Creator",
						"description": locale === "zh-CN" 
							? "免费在线WebP动画合成工具，将多张图片快速合成为高质量动图" 
							: "Free online WebP animation creator. Convert multiple images into high-quality animations",
						"url": "https://www.limgx.com",
						"applicationCategory": "MultimediaApplication",
						"operatingSystem": "Web Browser",
						"inLanguage": locale,
						"offers": {
							"@type": "Offer",
							"price": "0",
							"priceCurrency": "USD"
						},
						"featureList": locale === "zh-CN" ? [
							"WebP动画合成",
							"多格式图片支持",
							"本地处理保护隐私",
							"无需上传服务器",
							"自定义帧率和质量",
							"实时预览功能"
						] : [
							"WebP animation creation",
							"Multiple image format support",
							"Local processing protects privacy",
							"No server uploads required",
							"Custom frame rate and quality",
							"Real-time preview functionality"
						],
						"screenshot": "https://www.limgx.com/images/webp-animation-preview.jpg",
						"softwareVersion": "1.0",
						"author": {
							"@type": "Organization",
							"name": "limgx.com",
							"url": "https://www.limgx.com"
						},
						"aggregateRating": {
							"@type": "AggregateRating",
							"ratingValue": "4.8",
							"ratingCount": "1250"
						}
					})}
				</script>
			</head>
			<body
				className={clsx("bg-background text-foreground", Opensans.variable, inter.variable)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					disableTransitionOnChange
					enableSystem={false}
				>
					<TranslationProvider value={dictionary}>
						<Header />
						{children}
						<Footer />
						<Toaster />
					</TranslationProvider>
				</ThemeProvider>
				<GoogleAnalytics gaId="G-89618T8EX2" />
			</body>
		</html>
	);
}
