import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Image Compressor - LocalImage | Reduce Image Size",
	description: "Free online image compression tool. Reduce image file sizes without losing quality. Supports JPG, PNG, WebP formats with local processing for privacy protection.",
	keywords: "image compression, compress images online, reduce image size, JPG compressor, PNG compressor",
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
		title: "Image Compressor - LocalImage | Reduce Image Size Online",
		description: "Free online image compression tool. Reduce image file sizes without losing quality with local processing for privacy protection.",
		type: "website",
		url: "https://www.limgx.com/compress",
		images: ["https://www.limgx.com/images/image-compression-preview.jpg"],
		siteName: "LocalImage Image Compressor",
		locale: "en_US",
		alternateLocale: ["zh_CN", "ja_JP", "es_ES", "fr_FR", "de_DE"],
	},
	twitter: {
		card: "summary_large_image",
		title: "Image Compressor - LocalImage | Reduce Image Size Online",
		description: "Free online image compression tool with local processing for privacy protection.",
		images: ["https://www.limgx.com/images/image-compression-preview.jpg"],
		creator: "@limgx_official",
	},
	alternates: {
		canonical: "https://www.limgx.com/compress",
	}
};

export default function CompressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 