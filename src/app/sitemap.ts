import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.limgx.com';
  
  // 基本路由列表，动画合成为主要功能
  const routes = [
    {
      path: '',            // 首页 - WebP动画合成器
      priority: 1.0,
      changeFreq: 'daily' as const,
      description: 'WebP动画合成器主页'
    },
    {
      path: '/compress',   // 图片压缩页面
      priority: 0.8,
      changeFreq: 'weekly' as const,
      description: '图片压缩工具页面'
    },
  ];

  const currentDate = new Date().toISOString();
  
  // 支持的语言
  const languages = {
    'zh-CN': 'https://www.limgx.com',
    'en': 'https://www.limgx.com',
    'ja': 'https://www.limgx.com',
    'es': 'https://www.limgx.com',
    'fr': 'https://www.limgx.com',
    'de': 'https://www.limgx.com',
  };

  // 将每个路由转换为sitemap条目
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
