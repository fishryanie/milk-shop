import { store } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { rateLimit, sameOrigin, session } from "@/lib/security";
import { ownerHash } from "@/shared/commerce/store";
import { receiptImage } from "@/lib/image";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    sameOrigin(request);
    const owner = ownerHash(await session());
    await rateLimit(request, "receipt", 12, 3600);
    const { id } = await params;
    const db = await store();
    await db.getOrder(id, owner);
    const data = await receiptImage(request);
    return ok(await db.uploadReceipt(id, owner, data, "image/webp"));
  } catch (error) {
    return fail(error);
  }
}
