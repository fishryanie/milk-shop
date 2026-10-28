import { describe, expect, test } from "bun:test";
import { indexablePages, productPageLinks, SITE_URL } from "@/lib/site-content";

// Run against `next start` or a deployed preview. No orders are created.
const base = process.env.AGENT_TEST_BASE_URL;
const read = (path: string, accept = "text/html", method = "GET") =>
  fetch(new URL(path, base), { method, headers: { Accept: accept } });
const textContent = (html: string) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

describe.skipIf(!base)("public agent readiness HTTP contracts", () => {
  test.each(indexablePages)(
    "%s supports HTML and Markdown with safe variant caching",
    async (path) => {
      for (const type of ["text/markdown", "text/html"]) {
        const response = await read(path, type);
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toContain(type);
        const body = await response.text();
        expect(body.length).toBeGreaterThan(500);
        if (type === "text/markdown") {
          expect(
            response.headers.get("Vary")?.toLowerCase().split(/,\s*/),
          ).toContain("accept");
          expect(body).toStartWith("# ");
          expect(body).not.toContain("<html");
          expect(body).toContain(`${SITE_URL}/llms.txt`);
          expect(response.headers.get("Cache-Control")).toContain("no-store");
        } else {
          // Next.js 16 App Pages replace custom Vary; no-store prevents a shared
          // cache from confusing HTML with the negotiated Markdown representation.
          expect(response.headers.get("Cache-Control")).toContain("no-store");
          expect(body).toContain('<html lang="vi"');
          const canonical = body.match(
            /<link rel="canonical" href="([^"]+)"/,
          )?.[1];
          expect(canonical).toBeTruthy();
          expect(new URL(canonical!).href).toBe(
            new URL(`${SITE_URL}${path}`).href,
          );
          expect(textContent(body).length).toBeGreaterThan(500);
        }
      }
    },
    15000,
  );

  test("raw homepage keeps identity, schema and links to detailed information", async () => {
    const html = await (await read("/")).text();
    const text = textContent(html);
    expect(text.length).toBeGreaterThan(500);
    expect(text).not.toContain("Chọn món và theo dõi đơn hàng");
    expect(text).not.toContain("Giao hàng quanh tiệm và hỗ trợ trực tiếp");
    expect(html).toContain('href="/about"');
    expect(html).not.toContain("data:image/");
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toContain('property="og:image"');
    expect(html).toMatch(/<title>Cái Tiệm Sữa[^<]*sữa tuyết/i);
    for (const page of productPageLinks)
      expect(html).toContain(`href="${page.path}"`);
    const headings = [...html.matchAll(/<h([1-6])\b/g)].map((match) =>
      Number(match[1]),
    );
    expect(headings[0]).toBe(1);
    expect(headings.filter((level) => level === 1).length).toBe(1);
    for (let i = 1; i < headings.length; i++)
      expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(1);
    const schema = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )![1],
    );
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toContain("Organization");
    expect(schema.contactPoint.contactType).toBe("customer service");
    expect(schema.contactPoint.telephone).toBeTruthy();
    expect(schema.address["@type"]).toBe("PostalAddress");
    expect(schema.address.streetAddress).toBeTruthy();
  });

  test("Accept weights, exclusions, unsupported types and successive variants work", async () => {
    for (const [accept, type, status] of [
      ["text/markdown;q=0.2,text/html;q=0.9", "text/html", 200],
      ["text/html;q=0.2,text/markdown;q=0.9", "text/markdown", 200],
      ["text/markdown;q=0,*/*;q=1", "text/html", 200],
      ["application/json", "text/plain", 406],
      ["*/*", "text/html", 200],
      ["text/markdown", "text/markdown", 200],
      ["text/html", "text/html", 200],
    ] as const) {
      const response = await read("/", accept);
      expect(response.status).toBe(status);
      expect(response.headers.get("Content-Type")).toContain(type);
      await response.arrayBuffer();
    }
    const flight = await read("/about", "text/x-component");
    expect(flight.status).toBe(200);
    await flight.arrayBuffer();
  });

  test("unknown paths return a real 404 with a usable Markdown body", async () => {
    for (const path of [
      "/__ora-agent-test-missing",
      "/missing/deep/path",
      "/not-a-page.md",
      "/missing.png",
    ]) {
      const response = await read(path, "text/markdown");
      expect(response.status).toBe(404);
      expect(response.headers.get("Content-Type")).toContain("text/markdown");
      expect(response.headers.get("Vary")).toContain("Accept");
      const body = await response.text();
      expect(body.length).toBeGreaterThan(20);
      expect(body).toContain(`[Hướng dẫn cho agent](${SITE_URL}/llms.txt)`);
      expect(body).not.toContain("<html");
    }
    const html = await read("/__ora-agent-test-missing");
    expect(html.status).toBe(404);
    expect(html.headers.get("Content-Type")).toContain("text/html");
    await html.arrayBuffer();
    const head = await read(
      "/__ora-agent-test-missing",
      "text/markdown",
      "HEAD",
    );
    expect(head.status).toBe(404);
    expect(await head.text()).toBe("");
  });

  test("Markdown aliases and llms.txt supply valid linked guidance", async () => {
    for (const path of indexablePages.map((path) =>
      path === "/" ? "/index.md" : `${path}.md`,
    )) {
      const response = await read(path, "*/*");
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("text/markdown");
      expect(await response.text()).toStartWith("# ");
    }
    const llms = await read("/llms.txt", "*/*");
    expect(llms.status).toBe(200);
    expect(llms.headers.get("Content-Type")).toContain("text/plain");
    const body = await llms.text();
    expect(body).toStartWith("# Cái Tiệm Sữa\n\n> ");
    expect(body).toContain("## When to use this");
    const paths = new Set(
      [...body.matchAll(/\]\(https:\/\/caitiemsua\.com([^)]*)\)/g)].map(
        (match) => match[1],
      ),
    );
    for (const path of paths) {
      const response = await read(
        path,
        path.endsWith(".md") ? "text/markdown" : "*/*",
      );
      expect(response.status).toBe(200);
      await response.arrayBuffer();
    }
  }, 15000);

  test.each(productPageLinks)(
    "$path has visible products and working links without JavaScript",
    async ({ path }) => {
      const html = await (await read(path)).text();
      const visible = textContent(html);
      expect(visible).toContain("Món và giá hiện tại");
      if (path === "/sua-tuoi") {
        expect(visible).toContain("Sữa bò tươi tiệt trùng");
        expect(visible).not.toContain("sữa bò thô");
      }
      const schema = JSON.parse(
        html.match(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
        )![1],
      );
      expect(schema["@type"]).toBe("CollectionPage");
      expect(schema.url).toBe(`${SITE_URL}${path}`);
      const home = await (await read("/")).text();
      const markdown = await (await read(path, "text/markdown")).text();
      for (const item of schema.mainEntity.itemListElement) {
        expect(visible).toContain(item.name);
        expect(markdown).toContain(`### ${item.name}`);
        const fragment = new URL(item.url).hash.slice(1);
        expect(html).toContain(`href="/#${fragment}"`);
        expect(home).toContain(`id="${fragment}"`);
      }
    },
  );

  test("sitemap and robots are valid discovery responses with all indexable URLs", async () => {
    const response = await read("/sitemap.xml", "*/*");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("xml");
    const xml = await response.text();
    expect(xml).toContain(
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    );
    expect(xml).toContain("</urlset>");
    expect(new TextEncoder().encode(xml).length).toBeLessThan(50 * 1024 * 1024);
    const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    expect(locations).toEqual(
      indexablePages.map((path) => `${SITE_URL}${path}`),
    );
    expect(
      [...xml.matchAll(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)].length,
    ).toBe(locations.length);
    const robots = await read("/robots.txt", "*/*");
    expect(robots.status).toBe(200);
    expect(await robots.text()).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test("catalog and original photos remain accessible; shopping API content types are preserved", async () => {
    const response = await read("/api/catalog", "text/markdown");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    const { success, data } = await response.json();
    expect(success).toBe(true);
    expect(JSON.stringify(data)).not.toContain("data:image/");
    const images = [
      ...data.products.map((product: { imageUrl: string }) => product.imageUrl),
      data.settings.qrImage,
    ].filter((url: string) => url.startsWith("/media/"));
    for (const image of images) {
      const photo = await read(image, "image/*");
      expect(photo.status).toBe(200);
      expect(photo.headers.get("Content-Type")).toStartWith("image/");
      expect((await photo.arrayBuffer()).byteLength).toBeGreaterThan(0);
      const head = await read(image, "image/*", "HEAD");
      expect(head.status).toBe(200);
      expect(await head.text()).toBe("");
    }
    const missing = await read(
      "/media/products/000000000000000000000000",
      "image/*",
    );
    expect(missing.status).toBe(404);
    const invalid = await read("/media/products/invalid", "image/*");
    expect(invalid.status).toBe(404);
    const cart = await read("/api/cart", "text/markdown");
    expect(cart.status).toBe(405);
    const icon = await read("/icons/app-icon.png", "image/*");
    expect(icon.status).toBe(200);
    expect(icon.headers.get("Content-Type")).toContain("image/png");
    await icon.arrayBuffer();
  }, 30000);
});
