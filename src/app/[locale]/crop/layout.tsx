import type { Metadata } from "next";
import { dictionaries, getNormalizedLocale } from "@/i18n/langMap";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || "zh-CN");
	const dictionary = await dictionaries[locale]();

	return {
		title:
			dictionary.crop_meta_title ||
			"图片裁剪工具 - LocalImage | 在线图片裁剪与编辑",
		description:
			dictionary.crop_meta_description ||
			"免费在线图片裁剪工具，精确裁剪图片尺寸，支持多种裁剪比例，本地处理保护隐私。",
	};
}

export default function CropLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
