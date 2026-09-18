import { getCollection, type CollectionEntry } from 'astro:content';

export type SitePageEntry = CollectionEntry<'pages'>;

export type NavLocation = 'topbar' | 'footer' | 'direct';

function normalizeLocation(raw: string | null | undefined): NavLocation | null {
  const value = raw?.toLowerCase() ?? '';
  if (value.includes('top')) return 'topbar';
  if (value.includes('foot')) return 'footer';
  if (value.includes('direct') || value.includes('standalone')) return 'direct';
  return null;
}

export async function getSitePages(): Promise<SitePageEntry[]> {
  return getCollection('pages');
}

export async function getSitePage(slug: string): Promise<SitePageEntry | undefined> {
  const pages = await getSitePages();
  return pages.find((page) => page.data.properties.Slug === slug);
}

export async function getNavPages(location: NavLocation): Promise<SitePageEntry[]> {
  const pages = await getSitePages();
  return pages.filter(
    (page) => normalizeLocation(page.data.properties.Location) === location,
  );
}
