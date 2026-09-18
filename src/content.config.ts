import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { notionLoader, notionPageSchema } from "@astro-notion/loader";
import {
  propertySchema,
  transformedPropertySchema
} from "@astro-notion/loader/schemas";

const notionApiKey = import.meta.env.NOTION_API_KEY;
const notionBlogPostsDatabaseId = import.meta.env.NOTION_BLOG_POSTS_DATABASE_ID;
const notionSitePagesDatabaseId = import.meta.env.NOTION_SITE_PAGES_DATABASE_ID;

// Notion credentials are placeholders until each brand's databases are
// connected (see .env.example). Falling back to a no-op loader keeps
// `astro build`/`dev` working with an empty collection instead of crashing
// on bad auth.
function disabledLoader(collectionName: string, missingEnvVar: string): Loader {
  return {
    name: `notion-loader-disabled-${collectionName}`,
    async load() {
      console.warn(
        `[content.config] ${missingEnvVar} env yok — "${collectionName}" koleksiyonu boş dönüyor. ` +
          "Gerçek içerik için .env dosyasını doldurup Notion database bağlantısını tamamlayın."
      );
    }
  };
}

const publishedStatusFilter = {
  property: "Status",
  select: { equals: "Published" }
} as const;

const posts = defineCollection({
  loader:
    notionApiKey && notionBlogPostsDatabaseId
      ? notionLoader({
          auth: notionApiKey,
          database_id: notionBlogPostsDatabaseId,
          collectionName: "posts",
          filter: publishedStatusFilter
        })
      : disabledLoader("posts", "NOTION_BLOG_POSTS_DATABASE_ID"),
  schema: notionPageSchema({
    properties: z.object({
      Title: transformedPropertySchema.title,
      Slug: transformedPropertySchema.rich_text,
      Status: transformedPropertySchema.select,
      PublishDate: transformedPropertySchema.date,
      Excerpt: transformedPropertySchema.rich_text,
      CoverImage: propertySchema.files,
      Tags: transformedPropertySchema.multi_select
    })
  })
});

// Standalone site pages (About, Privacy Policy, Cookie Policy, ...) — each
// gets a route at /{Slug}. "Location" decides where it's linked from
// (Top Bar, Footer, or Standalone = not linked anywhere, e.g. a coming-soon
// or custom 404 page reachable only by URL).
const pages = defineCollection({
  loader:
    notionApiKey && notionSitePagesDatabaseId
      ? notionLoader({
          auth: notionApiKey,
          database_id: notionSitePagesDatabaseId,
          collectionName: "pages",
          filter: publishedStatusFilter
        })
      : disabledLoader("pages", "NOTION_SITE_PAGES_DATABASE_ID"),
  schema: notionPageSchema({
    properties: z.object({
      Title: transformedPropertySchema.title,
      Slug: transformedPropertySchema.rich_text,
      Status: transformedPropertySchema.select,
      // Optional: older rows or newly-added properties may not be filled in
      // for every page yet, and a missing value shouldn't break the whole sync.
      MetaDescription: transformedPropertySchema.rich_text.optional(),
      Location: transformedPropertySchema.select.optional()
    })
  })
});

export const collections = { posts, pages };
