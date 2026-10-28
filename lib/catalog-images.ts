import { createHash } from "node:crypto";
import type { ShopProduct, ShopSettings } from "@/shared/commerce/types";

export type PublicCatalog = { products: ShopProduct[]; settings: ShopSettings };

const imageVersion = (source: string) =>
  createHash("sha256").update(source).digest("hex").slice(0, 16);

export function publicImageUrl(source: string, path: string) {
  return source.startsWith("data:image/")
    ? `${path}?v=${imageVersion(source)}`
    : source;
}

// Keep catalog bytes focused on text. The database and commerce calculations
// retain their original values; only public presentation uses image URLs.
export function publicCatalog(catalog: PublicCatalog): PublicCatalog {
  return {
    products: catalog.products.map((product) => ({
      ...product,
      imageUrl: publicImageUrl(
        product.imageUrl,
        `/media/products/${product.id}`,
      ),
    })),
    settings: {
      ...catalog.settings,
      qrImage: publicImageUrl(catalog.settings.qrImage, "/media/payment-qr"),
    },
  };
}

export function imageResponse(request: Request, source: string | undefined) {
  const match = source?.match(
    /^data:(image\/(?:png|jpeg|webp|gif|avif));base64,([a-zA-Z0-9+/]+={0,2})$/,
  );
  if (!source || !match)
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  const data = Buffer.from(match[2], "base64");
  const etag = `"${createHash("sha256").update(data).digest("hex")}"`;
  // Only cache an exact content version indefinitely. Unversioned requests and
  // old URLs after an admin image edit must still revalidate the current bytes.
  const versionMatches =
    new URL(request.url).searchParams.get("v") === imageVersion(source);
  const headers = {
    "Content-Type": match[1],
    "Cache-Control": versionMatches
      ? "public, max-age=31536000, immutable"
      : "public, max-age=0, s-maxage=15, stale-while-revalidate=60",
    "X-Content-Type-Options": "nosniff",
    ETag: etag,
  };
  if (
    request.headers
      .get("if-none-match")
      ?.split(",")
      .some(
        (tag) => tag.trim().replace(/^W\//, "") === etag || tag.trim() === "*",
      )
  ) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(request.method === "HEAD" ? null : data, {
    headers: { ...headers, "Content-Length": String(data.length) },
  });
}
