import { store } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { jsonBody, rateLimit, sameOrigin, session } from "@/lib/security";
import { ownerHash } from "@/shared/commerce/store";
import { checkoutSchema } from "@/shared/commerce/validation";
export async function GET(request: Request) {
  try {
    const owner = ownerHash(await session());
    await rateLimit(request, "orders-read", 120);
    const before = new URL(request.url).searchParams.get("before") || undefined;
    return ok(await (await store()).listOrders(owner, undefined, before));
  } catch (error) {
    return fail(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const owner = ownerHash(await session());
    await rateLimit(request, "checkout-ip", 10, 3600);
    const body = checkoutSchema.parse(await jsonBody(request));
    await rateLimit(request, "checkout-phone", 6, 3600, body.customer.phone);
    return ok(await (await store()).checkout(body, owner), 201);
  } catch (error) {
    return fail(error);
  }
}
