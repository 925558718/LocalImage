import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.limgx.com';
  
  // 基本路由列表，根据您应用的实际结构来调整
  const routes = [
    '',            // 首页
  ];

  const currentDate = new Date().toISOString();

  // 将每个路由转换为sitemap条目
  return routes.map(route => {
    return {
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: route === '' ? 1 : 0.8, // 首页优先级最高
    };
  });
}
