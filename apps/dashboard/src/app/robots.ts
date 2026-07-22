import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const commonDisallows = ["/dashboard", "/login", "/register", "/forgot-password", "/api"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: commonDisallows,
      },
      // Explicitly welcome OpenAI crawlers (ChatGPT / GPTBot)
      {
        userAgent: ["GPTBot", "ChatGPT-User"],
        allow: "/",
        disallow: commonDisallows,
      },
      // Explicitly welcome Anthropic crawler (Claude)
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: commonDisallows,
      },
      // Explicitly welcome Grok crawler (xAI)
      {
        userAgent: ["Grok", "xai-crawler"],
        allow: "/",
        disallow: commonDisallows,
      },
      // Explicitly welcome Perplexity crawler
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: commonDisallows,
      },
      // Explicitly welcome Google AI crawler
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: commonDisallows,
      },
      // Explicitly welcome Apple AI crawler
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: commonDisallows,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
