/**
 * Renders a fresh src/config/brand.config.ts for a scaffolded project.
 * Keeps the same BrandConfig shape as the template — analytics/notion/newsletter
 * fields stay wired to env vars, only the brand-identity fields get literal values.
 */
export function renderBrandConfig({ brandName, tagline, domain, storeUrl, language, colors, fonts }) {
  return `export interface BrandConfig {
  brandName: string;
  tagline: string;
  domain: string;
  storeUrl: string;
  language: "en" | "tr";

  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    logoUrl: string;
    faviconUrl: string;
  };

  analytics: {
    ga4Id: string;
    metaPixelId: string;
    metaConversionApiToken?: string;
    gtmId: string;
  };

  notion: {
    blogPostsDatabaseId: string;
    sitePagesDatabaseId: string;
    apiKeyEnvVar: string;
  };

  newsletter: {
    beehiivPublicationId: string;
    embedFormId: string;
  };

  social: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };

  seo: {
    defaultOgImage: string;
    twitterHandle?: string;
  };
}

/**
 * Single source of truth for brand-specific values. To spin up another
 * brand, run \`npx create-blogfactory\` again, or edit these values directly.
 */
export const brandConfig: BrandConfig = {
  brandName: ${JSON.stringify(brandName)},
  tagline: ${JSON.stringify(tagline)},
  domain: ${JSON.stringify(domain)},
  storeUrl: ${JSON.stringify(storeUrl)},
  language: ${JSON.stringify(language)},

  theme: {
    colors: {
      primary: ${JSON.stringify(colors.primary)},
      secondary: ${JSON.stringify(colors.secondary)},
      accent: ${JSON.stringify(colors.accent)},
      background: ${JSON.stringify(colors.background)},
      text: ${JSON.stringify(colors.text)}
    },
    fonts: {
      heading: ${JSON.stringify(fonts.heading)},
      body: ${JSON.stringify(fonts.body)}
    },
    logoUrl: "/logo.svg",
    faviconUrl: "/favicon.svg"
  },

  analytics: {
    ga4Id: import.meta.env.PUBLIC_GA4_ID ?? "",
    metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID ?? "",
    metaConversionApiToken: import.meta.env.META_CONVERSION_API_TOKEN,
    gtmId: import.meta.env.PUBLIC_GTM_ID ?? ""
  },

  notion: {
    blogPostsDatabaseId: import.meta.env.NOTION_BLOG_POSTS_DATABASE_ID ?? "",
    sitePagesDatabaseId: import.meta.env.NOTION_SITE_PAGES_DATABASE_ID ?? "",
    apiKeyEnvVar: "NOTION_API_KEY"
  },

  newsletter: {
    beehiivPublicationId: import.meta.env.PUBLIC_BEEHIIV_PUBLICATION_ID ?? "",
    embedFormId: import.meta.env.PUBLIC_BEEHIIV_EMBED_FORM_ID ?? ""
  },

  social: {},

  seo: {
    defaultOgImage: "/og-image.png"
  }
};
`;
}
