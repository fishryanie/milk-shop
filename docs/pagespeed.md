# PageSpeed review — 28 October 2026

Reviewed the supplied mobile report and reproduced its console error, restricted
viewport, logo compression warning, and framework JavaScript warnings in a fresh
local production build.

| Finding | Result |
| --- | --- |
| `/api/orders` returns 401 on first visit | The order list returns an empty private response when no valid guest session exists. It does not create a competing session cookie. Signed sessions retain their owner-scoped lookup; checkout and individual order reads still require authentication. |
| Pinch zoom disabled | Removed the minimum/maximum scale and `userScalable: false` settings. Mobile zoom works while a sheet is open. |
| Logo image delivery | Rebuilt all five transparent logo sizes using a palette followed by lossless WebP encoding. The 348px mobile asset fell from 11,292 to 6,468 bytes (43%). The image-delivery audit passes. |
| Forced layout | Coalesced viewport/focus events into animation frames, skip unchanged sheet dimensions, and measure focused fields on the following frame. The final forced-layout audit passes. |
| Legacy JavaScript, about 14 KiB estimated | Remains in Next.js's precompiled client runtime, including its standard feature fallbacks. The app already targets ES2022. Changing the TypeScript target does not rebuild framework dependencies. |
| Unused JavaScript, about 44 KiB estimated | The two flagged chunks contain Next.js routing/hydration and React runtime code. Shopping sheets are already loaded dynamically. These coverage estimates do not mean the framework code can safely be deleted. |
| CSS dependency tree | The initial document loads same-origin global CSS and page CSS directly, with no nested stylesheet imports. This shallow render-blocking chain remains. Kept separately cached stylesheets; Next.js currently documents CSS inlining as experimental and not recommended for production. |

The isolated local mobile Lighthouse run scored **90 Performance, 100
Accessibility, and 100 Best Practices**, with FCP 0.9s, LCP 3.6s, TBT 20ms, and
CLS 0. The zoom, console-error, image-delivery, and forced-layout audits passed.
Local lab measurements are not a deployed PageSpeed result; LCP and the remaining
framework/CSS findings still leave room for improvement.

Validation: production build, TypeScript, 99 unit tests, six production HTTP
contracts, React Doctor (no diagnostics), and browser checks at 390px and 1440px.
Browser checks deliberately delayed catalog session creation until after the
orders response, and covered focus trapping, scroll restoration, cart and
checkout, reduced motion, simulated keyboard resizing, and 2× mobile zoom. No
orders were submitted.

The local HTML/JSON Lighthouse reports, browser results, and screenshots are in
`artifacts/performance/pagespeed-*` (ignored by Git). The HTTP contracts run with
`AGENT_TEST_BASE_URL` pointed at a production build; its `STOREFRONT_ORIGIN` must
match the server configuration.

References: [Next.js browser support](https://nextjs.org/docs/architecture/supported-browsers)
and [CSS inlining and its tradeoffs](https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss).
