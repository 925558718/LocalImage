import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = "https://limgx.com";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		// next-intl 将自动处理这个路径
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
