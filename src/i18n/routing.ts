import {defineRouting} from 'next-intl/routing';
import { supportedLocales, defaultLocale } from './langMap';
 
export const routing = defineRouting({
  // 使用语言映射表中的标准语言代码
  locales: supportedLocales,
 
  // 使用默认语言
  defaultLocale: defaultLocale,
  localePrefix: 'as-needed',
});