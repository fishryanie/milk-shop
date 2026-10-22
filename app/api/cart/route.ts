import { store } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { jsonBody, rateLimit, sameOrigin, session } from "@/lib/security";
import { cartSchema, cartQuoteSchema } from "@/shared/commerce/validation";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await session();
    const quote = async () => {
      const raw = await jsonBody(request);
      const input = Array.isArray(raw) ? cartSchema.parse(raw) : cartQuoteSchema.parse(raw);
      const db = await store();
      await db.expire();
      return Array.isArray(input)
        ? db.quote(input)
        : db.quote(input.cart, undefined, undefined, input.customer.location, input.shippingDeferred);
    };
    // Count even invalid requests, alongside the independent quote work.
    // Expiration still finishes before stock is read, and both must succeed.
    const [data] = await Promise.all([quote(), rateLimit(request, "quote", 90)]);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
