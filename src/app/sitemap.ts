import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.limgx.com';
  
  // Basic route list, animation creator as main feature
  const routes = [
    {
      path: '',            // Homepage - WebP Animation Creator
      priority: 1.0,
      changeFreq: 'daily' as const,
      description: 'WebP Animation Creator Homepage'
    },
    {
      path: '/compress',   // Image Compression Page
      priority: 0.8,
      changeFreq: 'weekly' as const,
      description: 'Image Compression Tool Page'
    },
    {
      path: '/dev/gradient', // CSS Gradient Generator Page
      priority: 0.7,
      changeFreq: 'weekly' as const,
      description: 'CSS Gradient Generator Tool Page'
    },
  ];

  const currentDate = new Date().toISOString();
  
  // 支持的语言 - 显式声明
  const languages = {
    'en': 'https://www.limgx.com',
    'zh-CN': 'https://www.limgx.com/zh-CN',
    'ja': 'https://www.limgx.com/ja',
    'es': 'https://www.limgx.com/es',
    'fr': 'https://www.limgx.com/fr',
    'de': 'https://www.limgx.com/de',
    'ru': 'https://www.limgx.com/ru'
  };

  // Convert each route to sitemap entry
  return routes.map(route => {
    return {
      url: `${baseUrl}${route.path}`,
      lastModified: currentDate,
      changeFrequency: route.changeFreq,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languages).map(([lang, url]) => [
            lang, 
            `${url}${route.path}`
          ])
        )
      }
    };
  });
}
