import { store } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { jsonBody, rateLimit, sameOrigin, session } from "@/lib/security";
import { cartSchema } from "@/shared/commerce/validation";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await session();
    await rateLimit(request, "quote", 90);
    const cart = cartSchema.parse(await jsonBody(request));
    const db = await store();
    await db.expire();
    return ok(await db.quote(cart));
  } catch (error) {
    return fail(error);
  }
}
