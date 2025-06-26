import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import PageTitle from "@/components/PageTitle";
import {
	defaultLocale,
	dictionaries,
	getNormalizedLocale,
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
		"AI Image Upscaler - Enhance Image Resolution | LocalImage";
	const description =
		dictionary.upscale_meta_description ||
		"Free online AI image upscaler tool. Use advanced algorithms to enhance image resolution and make blurry images sharp. Local processing protects privacy.";

	return {
		title,
		description,
		robots: {
			index: true,
			follow: true,
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
						"Use AI technology to enhance image resolution and make low-resolution images crisp"
					}
				/>
				{children}
			</div>
		</NextIntlClientProvider>
	);
}
