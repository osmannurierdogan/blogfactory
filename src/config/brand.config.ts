export interface BrandConfig {
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
 * Single source of truth for brand-specific values. To spin up a new brand,
 * duplicate this file's values (see RAD Bölüm 16 replication checklist) —
 * never hardcode secrets here, only env var *names*.
 */
export const brandConfig: BrandConfig = {
  brandName: "The Modern Stoic",
  tagline: "Ancient wisdom for modern leaders",
  domain: "themodernstoic.co",
  storeUrl: "https://store.themodernstoic.co",
  language: "en",

  theme: {
    colors: {
      primary: "#1c1c1a",
      secondary: "#8a8478",
      accent: "#b08d57",
      background: "#faf9f6",
      text: "#1c1c1a"
    },
    fonts: {
      heading: "Fraunces",
      body: "Inter"
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

  social: {
    twitter: "https://twitter.com/themodernstoic",
    instagram: "https://instagram.com/themodernstoic"
  },

  seo: {
    defaultOgImage: "/og-image.png",
    twitterHandle: "@themodernstoic"
  }
};

