import { MetadataRoute } from 'next';
import userConfig from '@/user.config.json';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${userConfig.url}/sitemap.xml`,
  };
}