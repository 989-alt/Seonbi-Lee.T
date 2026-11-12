import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/learn", "/news", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/" || path === "/news" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
