import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { brandConfig } from '@/config/brand.config';
import { getPublishedPosts, getPostSlug } from '@/lib/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();
  const siteUrl = context.site?.toString() ?? `https://${brandConfig.domain}`;

  return rss({
    title: brandConfig.brandName,
    description: brandConfig.tagline,
    site: siteUrl,
    items: posts.map((post) => ({
      title: post.data.properties.Title,
      description: post.data.properties.Excerpt,
      pubDate: post.data.properties.PublishDate?.start,
      link: `/blog/${getPostSlug(post)}`,
    })),
  });
};
