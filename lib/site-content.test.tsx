import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DeliveryPolicy } from "@/components/delivery-policy";
import {
  businessSchema,
  infoSections,
  pageMetadata,
  productCollectionSchema,
  productPageLinks,
  productsForPage,
  publicFallbackSettings,
  serializeJsonLd,
  SITE_URL,
  type InfoPath,
} from "./site-content";
import { agentInstructions, markdownText, pageMarkdown } from "./markdown";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import type { PublicCatalog } from "./catalog-images";

const catalog: PublicCatalog = {
  settings: publicFallbackSettings,
  products: [
    {
      id: "123456789012345678901234",
      name: "Sữa <script>",
      category: "Sữa",
      description: "Ngon [link](https://malicious.example)",
      imageUrl: "",
      price: 35000,
      unit: "ly",
      stock: 5,
      status: "available",
      badge: "",
      sortOrder: 1,
      sizes: [
        { id: "m", name: "M", price: 35000, available: true },
        { id: "l", name: "L", price: 45000, available: false },
      ],
      toppings: [{ id: "oreo", name: "Oreo", price: 5000, available: true }],
    },
  ],
};

test("introduction, ordering and delivery details live on the about page", () => {
  const home = pageMarkdown("/", catalog)!;
  const about = pageMarkdown("/about", catalog)!;
  for (const heading of [
    "Sữa tuyết, sữa tươi và bánh flan tại Cái Tiệm Sữa",
    "Chọn món và theo dõi đơn hàng",
    "Giao hàng quanh tiệm và hỗ trợ trực tiếp",
  ]) {
    expect(home).not.toContain(`## ${heading}`);
    expect(about).toContain(`## ${heading}`);
  }
  expect(home).toContain(`[Giới thiệu](${SITE_URL}/about)`);
});

test("delivery heading is sequential on the homepage and preserves the default in sheets", () => {
  expect(renderToStaticMarkup(<DeliveryPolicy headingLevel={2} />)).toContain(
    "<h2 ",
  );
  expect(renderToStaticMarkup(<DeliveryPolicy />)).toContain("<h3 ");
});

test.each(["/about", "/contact", "/privacy"] as InfoPath[])(
  "%s has real content and its own canonical",
  (path) => {
    expect(
      infoSections(path, publicFallbackSettings)
        .flatMap((s) => s.paragraphs)
        .join(" ").length,
    ).toBeGreaterThan(500);
    expect(pageMetadata(path).alternates?.canonical).toBe(`${SITE_URL}${path}`);
    expect(pageMarkdown(path, catalog)).toContain(publicFallbackSettings.phone);
  },
);

test("Organization identity uses published settings with contact and PostalAddress", () => {
  const settings = {
    ...publicFallbackSettings,
    name: "Changed shop",
    phone: "0901234567",
    address: "Changed address",
  };
  const schema = businessSchema(settings);
  expect(schema["@type"]).toContain("Organization");
  expect(schema["@type"]).toContain("FoodEstablishment");
  expect(schema.name).toBe(settings.name);
  expect(schema.contactPoint.telephone).toBe("+84901234567");
  expect(schema.contactPoint.contactType).toBe("customer service");
  expect(schema.address["@type"]).toBe("PostalAddress");
  expect(schema.address.streetAddress).toBe(settings.address);
  expect(schema.url).toBe(`${SITE_URL}/`);
  expect(
    serializeJsonLd({ name: "</script><script>alert(1)</script>" }),
  ).not.toContain("<");
});

test("Markdown reflects current product choices and escapes database text", () => {
  const body = pageMarkdown("/", catalog)!;
  expect(body).toContain("35.000");
  expect(body).toContain("45.000");
  expect(body).toContain("(hết)");
  expect(body).toContain("Oreo: 5.000");
  expect(body).toContain("Còn món");
  expect(body).not.toContain("<script>");
  expect(body).not.toContain("[link](https://malicious.example)");
  expect(markdownText("<x>\n# title")).toBe("&lt;x&gt; \\# title");
  expect(pageMarkdown("/missing", catalog)).toBeNull();
  expect(pageMarkdown("/", { ...catalog, products: [] })).toContain(
    "chưa tải được",
  );
});

test("llms.txt follows the H1, summary, file-list format and gives specific agent jobs", () => {
  const text = agentInstructions();
  expect(text).toStartWith("# Cái Tiệm Sữa\n\n> ");
  expect(text).toContain("## When to use this");
  expect(text).toContain("GET /api/catalog");
  expect(text).toContain("Accept: text/markdown");
  for (const section of text.split(/^## /m).slice(1)) {
    const content = section.slice(section.indexOf("\n")).trim();
    expect(content).toMatch(/^- \[[^\]]+\]\(https:\/\/caitiemsua\.com\//);
  }
});

test("sitemap covers only canonical indexable pages with real dates; robots advertises it", () => {
  const entries = sitemap();
  expect(entries.map((entry) => entry.url)).toEqual([
    `${SITE_URL}/`,
    `${SITE_URL}/about`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/banh-flan`,
    `${SITE_URL}/sua-tuyet-van-nam`,
    `${SITE_URL}/sua-tuoi`,
  ]);
  for (const entry of entries)
    expect(entry.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
});

test("product pages use current matching products and exclude hidden items", () => {
  const base = catalog.products[0];
  const products = [
    {
      ...base,
      id: "flan",
      name: "Flan chén",
      category: "Flan",
      status: "sold_out" as const,
    },
    { ...base, id: "snow", name: "Sữa Tuyết Vân Nam", category: "Sữa tuyết" },
    {
      ...base,
      id: "milk",
      name: "Sữa tươi nguyên chất",
      category: "Sữa tươi",
      price: 27000,
    },
    {
      ...base,
      id: "hidden",
      name: "Flan xô",
      category: "Flan",
      status: "hidden" as const,
    },
  ];
  expect(productsForPage("/banh-flan", products).map((p) => p.id)).toEqual([
    "flan",
  ]);
  expect(
    productsForPage("/sua-tuyet-van-nam", products).map((p) => p.id),
  ).toEqual(["snow"]);
  expect(productsForPage("/sua-tuoi", products).map((p) => p.id)).toEqual([
    "milk",
  ]);
  expect(productsForPage("/about", products)).toEqual([]);
  const markdown = pageMarkdown("/sua-tuoi", { ...catalog, products })!;
  expect(markdown).toContain("27.000");
  expect(markdown).toContain("tiệt trùng");
  expect(markdown).not.toContain("### Flan chén");
  expect(markdown).not.toContain("### Sữa Tuyết Vân Nam");
  const schema = productCollectionSchema(
    "/banh-flan",
    productsForPage("/banh-flan", products),
  );
  expect(schema.mainEntity.numberOfItems).toBe(1);
  expect(schema.mainEntity.itemListElement[0].url).toBe(
    `${SITE_URL}/#mon-flan`,
  );
});

test.each(productPageLinks)(
  "$path has focused content and its own canonical",
  ({ path }) => {
    expect(pageMetadata(path).alternates?.canonical).toBe(`${SITE_URL}${path}`);
    expect(
      infoSections(path, publicFallbackSettings)
        .flatMap((section) => section.paragraphs)
        .join(" ").length,
    ).toBeGreaterThan(500);
    expect(pageMarkdown(path, catalog)).toContain(publicFallbackSettings.phone);
  },
);
