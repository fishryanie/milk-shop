import type { Metadata } from "next";
import { preload } from "react-dom";
import { Storefront } from "@/components/storefront";
import { pageCatalog } from "@/lib/catalog";
import { storefrontAvifImage } from "@/lib/storefront-image";
import {
  businessSchema,
  serializeJsonLd,
  SITE_URL,
  websiteSchema,
} from "@/lib/site-content";

// Refresh the prerendered menu without putting database latency on every page view.
export const revalidate = 15;

export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/`,
    types: { "text/markdown": `${SITE_URL}/index.md` },
  },
};

export default async function Page() {
  preload(storefrontAvifImage.src, {
    as: "image",
    type: "image/avif",
    imageSrcSet: storefrontAvifImage.srcSet,
    imageSizes: storefrontAvifImage.sizes,
    fetchPriority: "high",
  });
  const initialCatalog = await pageCatalog();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(businessSchema(initialCatalog.settings)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema()) }}
      />
      <Storefront initialCatalog={initialCatalog} />
    </>
  );
}
