import { store } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { currentSession, jsonBody, rateLimit, sameOrigin, session } from "@/lib/security";
import { ownerHash } from "@/shared/commerce/store";
import { checkoutSchema } from "@/shared/commerce/validation";
import { after } from "next/server";
import { notifyZaloOrder } from "@/lib/zalo";
export async function GET(request: Request) {
  try {
    const token = await currentSession();
    // A new visitor has no orders, even before the catalog creates their cookie.
    // Detail reads and checkout still require a valid, signed guest session.
    if (!token) return ok({ orders: [], nextCursor: null, activeCount: 0 });
    const owner = ownerHash(token);
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
    const order = await (await store()).checkout(body, owner, (created) => {
      after(() => notifyZaloOrder(created));
    });
    return ok(order, 201);
  } catch (error) {
    return fail(error);
  }
}
