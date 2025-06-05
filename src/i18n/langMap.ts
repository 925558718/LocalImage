/**
 * 语言映射表 - 将各种语言变体映射到标准语言代码
 * 
 * 例如：'zh', 'zh-cn', 'zh-CN', 'zh_CN' 都映射到 'zh-CN'
 * 这样我们只需要维护标准语言代码对应的翻译文件
 */

// 支持的语言列表 - 用于路由和UI展示
export const supportedLocales = ['en', 'zh-CN', 'es', 'fr', 'de', 'ja', 'ru'] as const;
export type SupportedLocale = typeof supportedLocales[number];

// 默认语言
export const defaultLocale: SupportedLocale = 'en';

// 语言变体映射表
export const langVariantMap: Record<string, SupportedLocale> = {
  // 英语变体
  'en': 'en',
  'en-us': 'en',
  'en-US': 'en',
  'en_US': 'en',
  'en-gb': 'en',
  'en-GB': 'en',
  'en_GB': 'en',
  
  // 中文变体
  'zh': 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh_CN': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh_Hans': 'zh-CN',
  'zh-SG': 'zh-CN',
  'zh-HK': 'zh-CN',
  'zh-TW': 'zh-CN',
  
  // 西班牙语变体
  'es': 'es',
  'es-ES': 'es',
  'es_ES': 'es',
  'es-MX': 'es',
  'es-419': 'es',
  
  // 法语变体
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr_FR': 'fr',
  'fr-CA': 'fr',
  'fr_CA': 'fr',
  
  // 德语变体
  'de': 'de',
  'de-DE': 'de',
  'de_DE': 'de',
  
  // 日语变体
  'ja': 'ja',
  'ja-JP': 'ja',
  'ja_JP': 'ja',
  
  // 俄语变体
  'ru': 'ru',
  'ru-RU': 'ru',
  'ru_RU': 'ru'
};

/**
 * 获取规范化的语言代码
 * @param locale 原始语言代码
 * @returns 规范化的语言代码，如果不支持则返回默认语言
 */
export function getNormalizedLocale(locale: string): SupportedLocale {
  // 转为小写并查找映射
  const normalizedLocale = locale.toLowerCase();
  
  // 尝试直接匹配
  if (normalizedLocale in langVariantMap) {
    return langVariantMap[normalizedLocale];
  }
  
  // 尝试匹配语言前缀（例如"zh-anything"都归为"zh-CN"）
  const prefix = normalizedLocale.split(/[-_]/)[0];
  if (prefix in langVariantMap) {
    return langVariantMap[prefix];
  }
  
  // 不支持的语言返回默认语言
  return defaultLocale;
}

/**
 * 获取语言的显示名称
 * @param locale 语言代码
 * @returns 语言的本地化显示名称
 */
export function getLanguageDisplayName(locale: SupportedLocale): string {
  const displayNames: Record<SupportedLocale, string> = {
    'en': 'English',
    'zh-CN': '简体中文',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'ja': '日本語',
    'ru': 'Русский'
  };
  
  return displayNames[locale] || locale;
}

/**
 * 获取Open Graph的locale格式
 * @param locale 语言代码
 * @returns 符合Open Graph规范的locale字符串
 */
export function getOpenGraphLocale(locale: SupportedLocale): string {
  const ogLocaleMap: Record<SupportedLocale, string> = {
    'en': 'en_US',
    'zh-CN': 'zh_CN',
    'es': 'es_ES',
    'fr': 'fr_FR',
    'de': 'de_DE',
    'ja': 'ja_JP',
    'ru': 'ru_RU'
  };
  
  return ogLocaleMap[locale] || 'en_US';
}

/**
 * 字典类型定义 - 包含所有多语言翻译键值
 */
export interface Dictionary {
  // 基础信息
  load_ffmpeg: string;
  compress_btn: string;
  compressing_btn: string;
  name: string;
  desc: string;
  logo_subtitle: string;
  nav_compress: string;
  download: string;
  download_all: string;
  advance: string;
  
  // 元数据
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  
  // 结构化数据
  structured_data_app_name?: string;
  structured_data_description?: string;
  structured_data_features?: string[];
  
  // 其他字段
  [key: string]: any;
}

// 字典加载函数
export const dictionaries: Record<SupportedLocale, () => Promise<Dictionary>> = {
  'en': () => import("public/i18n/en.json").then((module) => module.default),
  'zh-CN': () => import("public/i18n/zh-CN.json").then((module) => module.default),
  'es': () => import("public/i18n/es.json").then((module) => module.default),
  'fr': () => import("public/i18n/fr.json").then((module) => module.default),
  'de': () => import("public/i18n/de.json").then((module) => module.default),
  'ja': () => import("public/i18n/ja.json").then((module) => module.default),
  'ru': () => import("public/i18n/ru.json").then((module) => module.default)
}; 