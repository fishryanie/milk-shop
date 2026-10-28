import type { Metadata } from "next";
import { Storefront } from "@/components/storefront";
import { pageCatalog } from "@/lib/catalog";
import { businessSchema, serializeJsonLd, SITE_URL } from "@/lib/site-content";

// Refresh the prerendered menu without putting database latency on every page view.
export const revalidate = 15;

export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/`,
    types: { "text/markdown": `${SITE_URL}/index.md` },
  },
};

export default async function Page() {
  const initialCatalog = await pageCatalog();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(businessSchema(initialCatalog.settings)),
        }}
      />
      <Storefront initialCatalog={initialCatalog} />
    </>
  );
}
