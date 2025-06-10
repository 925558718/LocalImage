import type { Metadata } from "next";
import {
  getNormalizedLocale,
  dictionaries,
  defaultLocale,
  supportedLocales,
} from "@/i18n/langMap";

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  // 等待参数解析并标准化语言代码
  const resolvedParams = await params;
  const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);

  // 加载对应语言的字典
  const dictionary = await dictionaries[locale]();

  // 标题和描述支持多语言
  const title =
    dictionary.gradient_meta_title ||
    "CSS Gradient Generator - LocalImage | Create Gradients";
  const description =
    dictionary.gradient_meta_description ||
    "Free online CSS gradient generator with live preview, Tailwind CSS v3/v4 support, and copy-ready code. Create beautiful linear and radial gradients for your web projects with real-time editing.";
  const keywords =
    dictionary.gradient_meta_keywords ||
    "css gradient, gradient generator, tailwind gradients, linear gradient, radial gradient, css tools";

  // 构建基础URL
  const baseUrl = "https://limgx.com";

  // 构建当前语言的URL (默认语言不需要语言前缀)
  const currentUrl =
    locale === defaultLocale 
      ? `${baseUrl}/dev/gradient` 
      : `${baseUrl}/${locale}/dev/gradient`;

  // 构建备用语言链接
  const languageAlternates: Record<string, string> = {};

  // 添加默认语言链接
  languageAlternates[defaultLocale] = `${baseUrl}/dev/gradient`;

  // 添加其他语言链接
  for (const lang of supportedLocales) {
    if (lang !== defaultLocale) {
      languageAlternates[lang] = `${baseUrl}/${lang}/dev/gradient`;
    }
  }

  return {
    title,
    description,
    keywords,
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
    alternates: {
      canonical: currentUrl,
      languages: languageAlternates,
    }
  };
}

export default function GradientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 