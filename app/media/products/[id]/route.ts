import { rawCatalog } from "@/lib/catalog";
import { imageResponse } from "@/lib/catalog-images";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) return imageResponse(request, undefined);
  try {
    const catalog = await rawCatalog();
    return imageResponse(
      request,
      catalog.products.find((product) => product.id === id)?.imageUrl,
    );
  } catch {
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "15" },
    });
  }
}
export const HEAD = GET;
