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
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersList = await headers();
	const acceptLanguage = headersList.get("accept-language");
	// const locale = acceptLanguage?.split(",")[0] || "en";
	const locale = "en";
	console.log(locale);
	const dictionary = await dictionaries[locale as keyof typeof dictionaries]();
	return (
		<html lang={locale} suppressHydrationWarning>
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
