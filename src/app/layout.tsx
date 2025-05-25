import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/hooks/useI18n";
import { headers } from "next/headers";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Open_Sans } from "next/font/google";
import clsx from "clsx";
import Script from "next/script";

const Opensans = Open_Sans({
	subsets: ["latin"],
	variable: "--font_os"
});
export const metadata: Metadata = {
	title: "LocalImage - Fast & Private Browser-Based Image Converter",
	description: "Convert images privately in your browser - no uploads needed. Fast, secure processing for JPG, PNG, and WebP formats. Privacy-focused image conversion with zero server storage.",
	keywords: "image converter, no upload, privacy, JPG, PNG, WEBP, browser-based, free, offline, fast conversion",
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
		title: "LocalImage - Fast & Private Browser-Based Image Converter",
		description: "Convert images privately in your browser - no uploads needed. Fast, secure processing for JPG, PNG, and WebP formats. Privacy-focused image conversion with zero server storage.",
		type: "website",
		url: "https://www.limgx.com",
		images: ["https://www.limgx.com/images/social-share-preview.jpg"],
		siteName: "LocalImage",
	},
	twitter: {
		card: "summary_large_image",
		title: "LocalImage - Fast & Private Browser-Based Image Converter",
		description: "Convert images privately in your browser - no uploads needed. Fast, secure processing for JPG, PNG, and WebP formats. Privacy-focused image conversion with zero server storage.",
		images: ["https://www.limgx.com/images/social-share-preview.jpg"],
		creator: "@limgx_official",
	},
	alternates: {
		canonical: "https://www.limgx.com",
	},
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
			{/* 使用 Next.js Script 组件加载 Ezoic 脚本 */}
			<Script src="https://cmp.gatekeeperconsent.com/min.js" strategy="afterInteractive" data-cfasync="false" />
			<Script src="https://the.gatekeeperconsent.com/cmp.min.js" strategy="afterInteractive" data-cfasync="false" />
			<Script src="//www.ezojs.com/ezoic/sa.min.js" strategy="afterInteractive" />
			<Script id="ezoic-init" strategy="afterInteractive">
				{`
				window.ezstandalone = window.ezstandalone || { };
				ezstandalone.cmd = ezstandalone.cmd || [];
				`}
			</Script>

			<body
				className={clsx("bg-background text-foreground", Opensans.variable)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
				>
					<TranslationProvider value={dictionary}>
						<Header />
						{children}
						<Footer />
					</TranslationProvider>
				</ThemeProvider>
				<GoogleAnalytics gaId="G-89618T8EX2" />
			</body>
		</html>
	);
}
