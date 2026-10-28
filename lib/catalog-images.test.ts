import { expect, test } from "bun:test";
import {
  imageResponse,
  publicCatalog,
  publicImageUrl,
  type PublicCatalog,
} from "./catalog-images";
import { defaultSettings, type ShopProduct } from "@/shared/commerce/types";

const source = "data:image/png;base64,aGVsbG8=";
const product: ShopProduct = {
  id: "123456789012345678901234",
  name: "Sữa tuyết",
  description: "Món từ sữa",
  category: "Sữa",
  imageUrl: source,
  price: 35000,
  status: "available",
  stock: 5,
  unit: "ly",
  badge: "",
  toppings: [],
  sortOrder: 1,
};

export const fixtureCatalog: PublicCatalog = {
  products: [product],
  settings: { ...defaultSettings, phone: "0767271126", qrImage: source },
};

test("catalog replaces embedded images without changing commerce fields or mutating the source", () => {
  const catalog = publicCatalog(fixtureCatalog);
  expect(catalog.products[0].imageUrl).toMatch(
    /^\/media\/products\/123456789012345678901234\?v=[a-f0-9]{16}$/,
  );
  expect(catalog.settings.qrImage).toMatch(
    /^\/media\/payment-qr\?v=[a-f0-9]{16}$/,
  );
  expect({ ...catalog.products[0], imageUrl: source }).toEqual(product);
  expect({ ...catalog.settings, qrImage: source }).toEqual(
    fixtureCatalog.settings,
  );
  expect(fixtureCatalog.products[0].imageUrl).toBe(source);
  expect(JSON.stringify(catalog)).not.toContain("data:image/");
});

test("existing URLs and empty fallbacks stay unchanged; changed bytes get a new URL", () => {
  expect(
    publicImageUrl("https://example.com/photo.webp", "/media/products/id"),
  ).toBe("https://example.com/photo.webp");
  expect(publicImageUrl("", "/media/products/id")).toBe("");
  expect(publicImageUrl(source, "/image")).not.toBe(
    publicImageUrl("data:image/png;base64,d29ybGQ=", "/image"),
  );
});

test("images deliver original bytes and MIME with cache revalidation and HEAD", async () => {
  const request = new Request("https://caitiemsua.com/media/products/id");
  const response = imageResponse(request, source);
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("image/png");
  expect(await response.text()).toBe("hello");
  const etag = response.headers.get("ETag")!;
  const conditional = imageResponse(
    new Request(request, {
      headers: { "If-None-Match": `"other", W/${etag}` },
    }),
    source,
  );
  expect(conditional.status).toBe(304);
  expect(await conditional.text()).toBe("");
  const head = imageResponse(new Request(request, { method: "HEAD" }), source);
  expect(head.headers.get("Content-Length")).toBe("5");
  expect(await head.text()).toBe("");
});

test("matching content versions cache for a year, including HEAD and 304 responses", () => {
  const url = new URL(publicImageUrl(source, "/media/products/id"), "https://caitiemsua.com");
  const response = imageResponse(new Request(url), source);
  const cacheControl = "public, max-age=31536000, immutable";
  expect(response.headers.get("Cache-Control")).toBe(cacheControl);
  const head = imageResponse(new Request(url, { method: "HEAD" }), source);
  expect(head.headers.get("Cache-Control")).toBe(cacheControl);
  const conditional = imageResponse(new Request(url, {
    headers: { "If-None-Match": response.headers.get("ETag")! },
  }), source);
  expect(conditional.status).toBe(304);
  expect(conditional.headers.get("Cache-Control")).toBe(cacheControl);
});

test("changed image bytes, missing and incorrect versions keep short revalidation", () => {
  const oldUrl = publicImageUrl(source, "/media/products/id");
  const updatedSource = "data:image/png;base64,d29ybGQ=";
  for (const [path, bytes] of [
    [oldUrl, updatedSource],
    ["/media/products/id", source],
    ["/media/products/id?v=incorrect", source],
  ]) {
    const response = imageResponse(new Request(new URL(path, "https://caitiemsua.com")), bytes);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=0, s-maxage=15, stale-while-revalidate=60",
    );
  }
});

test.each([
  undefined,
  "",
  "https://example.com/image.png",
  "data:image/svg+xml;base64,PHN2Zz4=",
  "data:image/png;base64,!!!!",
])("missing or unsupported image is a non-cacheable 404: %s", (value) => {
  const response = imageResponse(
    new Request("https://caitiemsua.com/media/image"),
    value,
  );
  expect(response.status).toBe(404);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
