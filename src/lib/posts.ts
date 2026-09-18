import { getCollection, type CollectionEntry } from 'astro:content';
import { fileToUrl } from '@astro-notion/loader';

export type PostEntry = CollectionEntry<'posts'>;

export async function getPublishedPosts(): Promise<PostEntry[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => {
    const dateA = a.data.properties.PublishDate?.start.getTime() ?? 0;
    const dateB = b.data.properties.PublishDate?.start.getTime() ?? 0;
    return dateB - dateA;
  });
}

export function getPostSlug(post: PostEntry): string {
  return post.data.properties.Slug || post.id;
}

export function getPostCoverUrl(post: PostEntry): string | undefined {
  const file = post.data.properties.CoverImage.files[0];
  return file ? fileToUrl(file) : undefined;
}
