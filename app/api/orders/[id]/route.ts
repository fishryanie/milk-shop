import { store } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { rateLimit, session } from "@/lib/security";
import { ownerHash } from "@/shared/commerce/store";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const owner = ownerHash(await session());
    await rateLimit(request, "order-read", 120);
    return ok(await (await store()).order((await params).id, owner));
  } catch (error) {
    return fail(error);
  }
}
