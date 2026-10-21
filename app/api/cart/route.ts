import { store } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { jsonBody, rateLimit, sameOrigin, session } from "@/lib/security";
import { cartSchema, cartQuoteSchema } from "@/shared/commerce/validation";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await session();
    await rateLimit(request, "quote", 90);
    const raw = await jsonBody(request);
    const input = Array.isArray(raw) ? cartSchema.parse(raw) : cartQuoteSchema.parse(raw);
    const db = await store();
    await db.expire();
    return ok(Array.isArray(input)
      ? await db.quote(input)
      : await db.quote(input.cart, undefined, undefined, input.customer.location, input.shippingDeferred));
  } catch (error) {
    return fail(error);
  }
}
