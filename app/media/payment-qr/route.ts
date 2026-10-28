import { rawCatalog } from "@/lib/catalog";
import { imageResponse } from "@/lib/catalog-images";

export async function GET(request: Request) {
  try {
    return imageResponse(request, (await rawCatalog()).settings.qrImage);
  } catch {
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "15" },
    });
  }
}
export const HEAD = GET;
