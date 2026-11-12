import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// AI 학습·수집용 크롤러는 막는다(이용약관 제4조). 검색엔진은 허용.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "PerplexityBot",
  "Meta-ExternalAgent",
  "cohere-ai",
  "Diffbot",
  "Omgilibot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
