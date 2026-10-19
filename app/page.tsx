import { store } from "@/lib/db";
import { Storefront, type Catalog } from "@/components/storefront";

// Refresh the prerendered menu without putting database latency on every page view.
export const revalidate = 15;

export default async function Page() {
  let initialCatalog: Catalog | undefined;
  try {
    const db = await store();
    initialCatalog = await db.catalog();
  } catch (error) {
    console.error("Failed to load catalog on server SSR:", error);
  }
  return <Storefront initialCatalog={initialCatalog} />;
}
