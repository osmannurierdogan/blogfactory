/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly NOTION_API_KEY: string;
  readonly NOTION_BLOG_POSTS_DATABASE_ID: string;
  readonly NOTION_SITE_PAGES_DATABASE_ID: string;
  readonly PUBLIC_GA4_ID: string;
  readonly PUBLIC_GTM_ID: string;
  readonly PUBLIC_META_PIXEL_ID: string;
  readonly META_CONVERSION_API_TOKEN: string | undefined;
  readonly PUBLIC_BEEHIIV_PUBLICATION_ID: string;
  readonly PUBLIC_BEEHIIV_EMBED_FORM_ID: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

