import { after } from "next/server";
import { store } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { rateLimit, session } from "@/lib/security";
import { publicCatalog } from "@/lib/catalog-images";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await rateLimit(request, "catalog", 180);
    await session(true);
    const db = await store();
    // Stock is checked synchronously by cart/checkout; cleanup must not block browsing.
    after(async () => {
      try {
        await db.expire();
      } catch (error) {
        console.error("Failed to expire orders after catalog response:", error instanceof Error ? error.name : "UnknownError");
      }
    });
    return ok(publicCatalog(await db.catalog()));
  } catch (error) {
    return fail(error);
  }
}
