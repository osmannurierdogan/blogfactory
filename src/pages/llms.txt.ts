import type { APIRoute } from 'astro';
import { brandConfig } from '@/config/brand.config';
import { getPublishedPosts, getPostSlug } from '@/lib/posts';
import { getSitePages } from '@/lib/pages';

export const GET: APIRoute = async ({ site }) => {
  const [posts, pages] = await Promise.all([getPublishedPosts(), getSitePages()]);
  const siteUrl = site?.toString().replace(/\/$/, '') ?? `https://${brandConfig.domain}`;

  const essayLines = posts
    .slice(0, 20)
    .map((post) => `- [${post.data.properties.Title}](${siteUrl}/blog/${getPostSlug(post)}): ${post.data.properties.Excerpt}`)
    .join('\n');

  const pageLines = pages
    .map((page) => `- [${page.data.properties.Title}](${siteUrl}/${page.data.properties.Slug})`)
    .join('\n');

  const body = `# ${brandConfig.brandName}

> ${brandConfig.tagline}

## Essays

- [Essays index](${siteUrl}/blog): Full archive of published essays.
${essayLines}

## Other

- [Newsletter](${siteUrl}/newsletter): Subscribe for new essays.
${pageLines}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
