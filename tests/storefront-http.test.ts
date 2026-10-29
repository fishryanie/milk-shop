import { describe, expect, test } from "bun:test";
import sharp from "sharp";

// Run against a production build. These checks never create an order.
const base = process.env.AGENT_TEST_BASE_URL;

describe.skipIf(!base)("responsive storefront assets", () => {
  test("the AVIF hero declares its actual variant widths", async () => {
    const html = await (await fetch(new URL("/", base))).text();
    const source = html.match(/<source type="image\/avif"[^>]*srcSet="([^"]+)"/);
    expect(source).toBeTruthy();
    const variants = source![1].split(", ");
    expect(variants.map((variant) => Number(variant.match(/ (\d+)w$/)![1])))
      .toEqual([240, 320, 480, 640, 960, 1280]);
    const asset = await fetch(new URL(variants[0].split(" ")[0], base));
    expect(asset.status).toBe(200);
    expect(asset.headers.get("Content-Type")).toBe("image/avif");
    expect(asset.headers.get("Cache-Control")).toContain("immutable");
  });

  test("native product images retain server resizing and AVIF negotiation", async () => {
    const html = await (await fetch(new URL("/", base))).text();
    const srcSet = html.match(/(?:image)?srcset="([^"]*\/_next\/image[^\"]+)"/i)?.[1].replaceAll("&amp;", "&");
    expect(srcSet).toBeTruthy();
    const variant = srcSet!.split(", ").find((item) => item.endsWith(" 336w"));
    expect(variant).toBeTruthy();
    const response = await fetch(new URL(variant!.split(" ")[0], base), {
      headers: { Accept: "image/avif" },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/avif");
    const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    expect(metadata.width).toBeGreaterThan(0);
    expect(metadata.width!).toBeLessThanOrEqual(336);
  });
});

describe.skipIf(!base)("guest orders HTTP contracts", () => {
  test.each([undefined, "milk_guest=invalid", `milk_guest=${"a".repeat(64)}.${"b".repeat(64)}`])(
    "a visitor without a valid session gets an empty private order list (%s)",
    async (cookie) => {
      const response = await fetch(new URL("/api/orders", base), {
        headers: cookie ? { Cookie: cookie } : {},
      });
      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      expect(response.headers.has("Set-Cookie")).toBe(false);
      expect(await response.json()).toEqual({
        success: true,
        data: { orders: [], nextCursor: null, activeCount: 0 },
      });
    },
  );

  test("a newly signed guest session can still read its own orders", async () => {
    const catalog = await fetch(new URL("/api/catalog", base));
    expect(catalog.status).toBe(200);
    const cookie = catalog.headers.get("Set-Cookie")?.split(";")[0];
    expect(cookie).toStartWith("milk_guest=");
    const response = await fetch(new URL("/api/orders", base), {
      headers: { Cookie: cookie! },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { orders: [], nextCursor: null, activeCount: 0 },
    });
  });

  test("reading a specific order still requires a signed session", async () => {
    const response = await fetch(new URL(`/api/orders/${"a".repeat(24)}`, base));
    expect(response.status).toBe(401);
  });

  test("checkout still requires a signed session", async () => {
    const response = await fetch(new URL("/api/orders", base), {
      method: "POST",
      headers: {
        Origin: process.env.STOREFRONT_ORIGIN || "https://caitiemsua.com",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    expect(response.status).toBe(401);
  });
});
