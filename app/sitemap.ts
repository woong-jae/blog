import { MetadataRoute } from 'next';
import userConfig from "@/user.config.json";
import PostRepository from './PostRepository';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: userConfig.url,
      lastModified: new Date(),
    },
    ...PostRepository.categories.map(category => {
      return {
        url: `${userConfig.url}/${category}`,
        lastModified: new Date(),
      };
    }),
    ...PostRepository.posts.map(post => {
      return {
        url: `${userConfig.url}/post/${post.slug}`,
        lastModified: new Date(post.modified ?? post.date),
      };
    }),
  ];
}