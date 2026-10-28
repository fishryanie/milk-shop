import "server-only";
import { unstable_cache } from "next/cache";
import { store } from "./db";
import { publicCatalog } from "./catalog-images";
import { publicFallbackSettings } from "./site-content";

// A read-only catalog snapshot shared by page, Markdown and image requests.
// Checkout and the existing catalog API continue to check the live database.
export const rawCatalog = unstable_cache(
  async () => (await store()).catalog(),
  ["agent-public-catalog"],
  { revalidate: 15 },
);

export async function pageCatalog() {
  try {
    return publicCatalog(await rawCatalog());
  } catch (error) {
    console.error(
      "Failed to load public catalog:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { products: [], settings: publicFallbackSettings };
  }
}
