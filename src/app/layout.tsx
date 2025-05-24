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
	title: "LocalImage - Fast, Private Image Conversion Right in Your Browser",
	description: "LocalImage: Convert your images instantly without uploads! Your photos stay private, processed directly in your browser. Supports JPG, PNG, WEBP, and more. Lightning-fast, secure, and privacy-focused image conversion.",
	keywords: "image converter, local image conversion, no upload, privacy-first, fast image processing, JPG to PNG, PNG to JPG, WEBP converter, image format converter, online image converter, offline image processing, private photo converter, free image converter, browser-based image tool",
	authors: [{ name: "limgx.com" }],
	openGraph: {
		title: "LocalImage - Fast, Private Image Conversion Right in Your Browser",
		description: "LocalImage: Convert your images instantly without uploads! Your photos stay private, processed directly in your browser. Supports JPG, PNG, WEBP, and more. Lightning-fast, secure, and privacy-focused image conversion.",
		type: "website",
		url: "https://www.limgx.com",
		images: ["https://www.limgx.com/images/social-share-preview.jpg"],
		siteName: "LocalImage",
	},
	twitter: {
		card: "summary_large_image",
		title: "LocalImage - Fast, Private Image Conversion Right in Your Browser",
		description: "LocalImage: Convert your images instantly without uploads! Your photos stay private, processed directly in your browser. Supports JPG, PNG, WEBP, and more. Lightning-fast, secure, and privacy-focused image conversion.",
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
