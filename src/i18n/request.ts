import { getRequestConfig } from "next-intl/server";
import { defaultLocale, dictionaries, getNormalizedLocale } from "./langMap";

export default getRequestConfig(async ({ requestLocale }) => {
	// 获取请求的语言
	const requested = await requestLocale;

	// 标准化语言代码 - 处理可能的undefined情况
	const locale = requested ? getNormalizedLocale(requested) : defaultLocale;

	// 加载对应的字典
	const messages = await dictionaries[locale]();

	return {
		locale,
		messages,
	};
});
