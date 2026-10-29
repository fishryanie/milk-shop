# Agent readiness

Updated on 2026-10-28. The latest follow-up is implemented and verified in a local
production build; it has **not been deployed**. The public domain was checked
separately and still serves the previous implementation. The supplied Ora / Is
Agentic score is 97/100; the external audit has not been rerun and no new score
is claimed.

## Latest audit follow-up

- Brand discovery: retain the descriptive brand-and-product title, description,
  canonical and Open Graph metadata; include the full product name in the H1.
  Add a separate Schema.org `WebSite` JSON-LD object with the exact site name,
  canonical homepage URL, Vietnamese language and a publisher reference to the
  existing business identity. No unverified social profiles or business facts
  were added.
- Content without JavaScript: retain the server-rendered menu and add a native
  `noscript` ordering guide with current phone/address, product information,
  delivery terms and links to the detailed pages. It explains which shopping
  controls need JavaScript and provides a usable phone-ordering alternative.
  It is visible when JavaScript is disabled; the normal storefront stays intact.
- Reduce non-content markup: replace long repeated utility lists with compact
  CSS classes using the same Tailwind utilities and responsive states. Replace
  repeated inline icon/snow paths with a same-origin SVG symbol sprite, keeping
  the original artwork, sizes, colors and Lucide/Feather license notices.

Measurements with the current five-product catalog:

| Metric | Before (local production) | After (local production) |
| --- | ---: | ---: |
| Raw HTML bytes | 88,985 | 62,812 |
| Body text characters without JavaScript | 2,024 | 3,175 |
| Text / HTML character ratio | approximately 2.3% | 5.22% |

The numerator includes the real no-JavaScript fallback and server-rendered menu;
scripts, styles, SVG markup and head metadata are excluded. The denominator is
the complete raw HTML response. Catalog changes can change these measurements.
The HTTP regression test enforces at least 500 body characters, at least 1,000
characters of no-JavaScript guidance and the 5% ratio.

Latest verification: production build, TypeScript and **117 tests / 1,025
assertions** passed against `http://localhost:3202`. Coverage includes all seven
HTML/Markdown pages and HEAD responses, aliases, llms.txt and its links, sitemap,
robots, manifest and icons, the SVG sprite, internal Markdown handler, 404/406,
catalog/photos/QR, and safe GET checks of every shopping API route. XML parsing
passed for both sitemaps and the SVG sprite. Browser checks passed with JavaScript
enabled and disabled, including adding a product and viewing its cart without
placing an order. Computed layout/typography/color styles matched the baseline
at widths 390, 768, 844 (landscape) and 1440 pixels. React Doctor's diff scan found
no issues. Its full scan also reported existing project warnings and intentional
plain anchors inside `noscript` (native navigation must work without JavaScript).

Public verification of `https://caitiemsua.com` after the local implementation:
16 HTTP tests passed; the two tests for the new homepage content/schema and
sprite correctly failed because the changes are not deployed. The existing
sitemap parsed as XML. HTTPS `www` still redirects once with **307** to the apex;
both HTML and Markdown reach the correct final representation. Change this to a
permanent redirect in Vercel Domains when authorized; adding a second redirect
in application code would not fix the hosting-level redirect.

Deploy the revision, rerun the HTTP suite against the domain, then rerun Ora.
Use owner access to submit the sitemap and inspect/request indexing in Search
Console. Relevant press/directory links and a verified Business Profile require
owner action. A code change cannot establish or guarantee a top-ten ranking.

References: Google's [site-name requirements](https://developers.google.com/search/docs/appearance/site-names)
and [title-link guidance](https://developers.google.com/search/docs/appearance/title-link).

## Existing agent support

| Audit item | Implementation |
| --- | --- |
| Agent-friendly 404s | Unmatched URLs return real HTTP 404; a Markdown request gets a Markdown explanation and links to llms.txt and sitemap.xml. HTML errors remain HTML. |
| Content without JavaScript | The homepage keeps the server-rendered menu, concise delivery policy, no-JavaScript ordering guide and contact links. Detailed introduction, ordering and delivery guidance live on `/about`. Headings are sequential. |
| Markdown negotiation | All seven indexable pages negotiate HTML or Markdown. Markdown responses include `Content-Type: text/markdown; charset=utf-8` and `Vary: Accept`. Quality values, specificity, q=0, wildcards and 406 are handled. |
| Brand discovery | The homepage title, description and H1 identify Cái Tiệm Sữa and its products. The visible hero design remains intact. Ranking still requires indexing and external signals. |
| Structured identity | The homepage emits escaped Organization / FoodEstablishment and WebSite JSON-LD. Contact fields come from the same catalog settings used by the storefront. |
| Agent guidance | `/llms.txt` describes specific best-fit jobs, Markdown requests, read-only catalog use and the browser ordering workflow. It follows the H1, summary and H2 file-list format. |
| Sitemap | `/sitemap.xml` lists all seven indexable HTML pages with actual content modification dates. `/robots.txt` advertises it. |
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
The latest follow-up restores the 5% ratio through markup reduction and useful
no-JavaScript guidance, without restoring the long introduction to the normal
storefront.

## Cache handling

Next.js 16.2 overwrites a custom `Vary` header on App Pages, including one set
in Proxy ([upstream issue](https://github.com/vercel/next.js/issues/85852)).
Markdown Route Handlers retain `Vary: Accept`. HTML and Markdown are both marked
`Cache-Control: private, no-store` so downstream caches cannot mix representations.
The server's existing 15-second ISR cache and the catalog data cache remain in use.
After a framework fix, the HTML no-store workaround can be removed only after
verifying the final HTML response includes Accept alongside the framework's Vary
tokens and that the deployment cache respects it.

## Previous deployment verification (historical)

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
