# Agent readiness

Implemented and deployed on 2026-10-28 to [caitiemsua.com](https://caitiemsua.com/).
Verified against both a local production build and the public production domain.
Deployment: [milk-shop-5ffgeei67](https://milk-shop-5ffgeei67-fishryanies-projects.vercel.app/).
The Ora / Is Agentic score has not been rerun; no new score is claimed.

## Changes

| Audit item | Implementation |
| --- | --- |
| Agent-friendly 404s | Unmatched URLs return real HTTP 404; a Markdown request gets a Markdown explanation and links to llms.txt and sitemap.xml. HTML errors remain HTML. |
| Content without JavaScript | The homepage keeps the server-rendered menu, concise delivery policy and contact links. Detailed introduction, ordering and delivery guidance live on `/about`. Headings are sequential. |
| Markdown negotiation | `/`, `/about`, `/contact`, `/privacy` negotiate HTML or Markdown. Markdown responses include `Content-Type: text/markdown; charset=utf-8` and `Vary: Accept`. Quality values, specificity, q=0, wildcards and 406 are handled. |
| Brand discovery | The homepage title, description and H1 identify Cái Tiệm Sữa and its products. The visible hero design remains intact. Ranking still requires indexing and external signals. |
| Structured identity | The homepage emits escaped Organization / FoodEstablishment JSON-LD with description, canonical URL, logo, phone, ContactPoint and PostalAddress. Contact fields come from the same catalog settings used by the storefront. |
| Agent guidance | `/llms.txt` describes specific best-fit jobs, Markdown requests, read-only catalog use and the browser ordering workflow. It follows the H1, summary and H2 file-list format. |
| Sitemap | `/sitemap.xml` lists the four indexable HTML pages with actual content modification dates. `/robots.txt` advertises it. |
| Canonical / metadata | Every indexable page has its own canonical; Vietnamese language, Open Graph type and image remain present. Metadata always uses the public production domain, even on localhost/previews. |
| Trust pages | `/about`, `/contact`, `/privacy` each contain more than 500 characters and are linked from the storefront footer. |

## Image transport and product behavior

The live baseline embedded five product photos plus the payment QR as data URLs
in catalog JSON and the React hydration payload. The homepage was 1,743,503 bytes.
The new public catalog replaces only embedded image values with versioned URLs:

- `/media/products/{id}?v={content-hash}`
- `/media/payment-qr?v={content-hash}`

These endpoints return the original image bytes, MIME type, ETag and conditional
304 responses. Existing remote image URLs and image fallbacks stay unchanged.
Hidden products are excluded by the existing public catalog query. Prices, sizes,
toppings, cart, stock checks, checkout and order storage retain their commerce
logic. The catalog API still reads the live database; page, Markdown and image
requests share a read-only 15-second catalog cache.

The initial agent-readiness deployment measured 102,985 bytes, 5,168 meaningful
text characters and a 5.26% text-to-HTML character ratio. Response size fell
94.09%. These measurements predate moving the long introduction to `/about`.
The HTTP tests now check useful homepage content and links rather than enforce
a text ratio that encourages unnecessary prose on the storefront.

## Cache handling

Next.js 16.2 overwrites a custom `Vary` header on App Pages, including one set
in Proxy ([upstream issue](https://github.com/vercel/next.js/issues/85852)).
Markdown Route Handlers retain `Vary: Accept`. HTML and Markdown are both marked
`Cache-Control: private, no-store` so downstream caches cannot mix representations.
The server's existing 15-second ISR cache and the catalog data cache remain in use.
After a framework fix, the HTML no-store workaround can be removed only after
verifying the final HTML response includes Accept alongside the framework's Vary
tokens and that the deployment cache respects it.

## Verification

```sh
bun run build
bun run start
AGENT_TEST_BASE_URL=http://localhost:3200 bun test
bun run typecheck
git diff --check
```

Results: production build passed; 101 tests passed, including 10 HTTP contract
tests and the existing commerce tests; TypeScript passed. React Doctor reported
no issues in changed tracked React files. The sitemap also parsed successfully
with an XML parser. Browser checks verified the existing hero layout, product
sheet choices and navigation to the contact page without creating an order.

After deployment, all 10 HTTP contract tests passed against
`https://caitiemsua.com` (201 assertions). Explicit `curl -L -i` checks through
`www.caitiemsua.com` verified the final HTML and Markdown responses and the
Markdown 404 status/body. The public sitemap parsed successfully as XML.
The live product photo loaded successfully through Next.js image optimization.
The public homepage measured 102,609 bytes with 5,168 text characters (5.28%).
Additional public checks covered all four Markdown HEAD responses, the internal
Markdown handler's valid/missing documents, the existing manifest, unauthorized
order reads (401) and receipt GET (405).

The HTTP suite covers HTML and Markdown on all four pages, explicit `.md`
aliases, llms.txt and its links, sitemap.xml, robots.txt, nested missing URLs,
Markdown and HTML 404s, Accept weights, 406, cache safety, HEAD, schema, canonical
metadata, heading order, informational links, catalog JSON and every embedded product/QR
image. The existing `/api/cart` GET remains 405 and static images remain images.

To verify a deployed URL, use the same suite:

```sh
AGENT_TEST_BASE_URL=https://caitiemsua.com bun run test:agent
curl -sS -L -i -H 'Accept: text/markdown' https://www.caitiemsua.com/
curl -sS -L -i -H 'Accept: text/html' https://www.caitiemsua.com/
curl -sS -L -i -H 'Accept: text/markdown' https://caitiemsua.com/__ora-agent-missing
```

Check the **final** status, Content-Type, Vary and body after redirects. Also
verify the production sitemap and llms.txt, then rerun the external Ora audit.

## Owner follow-ups

- Rerun the external Ora audit against the deployed site. Its new score has not
  been measured in this session.
- Submit the sitemap and request indexing through the verified Search Console
  property. This needs owner access; a top-ten brand ranking cannot be guaranteed
  by code changes. Obtain relevant press/business-directory links to the canonical
  domain and consider a verified Google Business Profile.
- The current `www` hostname redirects once to the apex. Consider making that
  redirect permanent (308) in Vercel Domains. Keep `STOREFRONT_ORIGIN` on the apex.
- Choose a business policy for retaining/deleting customer and order data. The
  privacy page describes the current implementation rather than promising an
  automatic deletion schedule that does not exist.
- Supply verified opening hours, support email and official social/profile URLs
  before adding those fields or `sameAs` to schema. No such facts were invented.
- When editing these informational pages, update `CONTENT_UPDATED` to the date of
  the actual change, rather than using the sitemap generation date.

## Protocol references

- [HTTP Accept negotiation, RFC 9110 §12.5.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.1)
- [Markdown negotiation requirements](https://acceptmarkdown.com/start)
- [llms.txt format](https://llmstxt.org/#format)
- [Sitemap XML protocol](https://www.sitemaps.org/protocol.html)
- [Schema.org FoodEstablishment](https://schema.org/FoodEstablishment)
- [Next.js JSON-LD guidance](https://nextjs.org/docs/app/guides/json-ld)
