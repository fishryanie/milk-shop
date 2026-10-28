import type { MetadataRoute } from "next";
import { CONTENT_UPDATED, indexablePages, SITE_URL } from "@/lib/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexablePages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: CONTENT_UPDATED,
  }));
}
