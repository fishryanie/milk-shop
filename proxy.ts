import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, negotiateContent } from "@/lib/content-negotiation";
import { markdownAliases } from "@/lib/markdown";
import { SITE_URL } from "@/lib/site-content";

export function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD")
    return NextResponse.next();
  // Next.js client navigation requests its Flight representation separately.
  if (request.headers.get("accept") === "text/x-component")
    return NextResponse.next();
  const path = request.nextUrl.pathname;
  const alias = markdownAliases[path];
  const representation = alias
    ? "markdown"
    : negotiateContent(request.headers.get("accept"));
  if (representation === null) return errorResponse(request, 406);
  const response =
    representation === "markdown"
      ? (() => {
          const target = new URL("/agent-markdown", request.url);
          target.searchParams.set("document", alias ?? path);
          if (alias) target.searchParams.set("alias", "1");
          // Next 16 route handlers can retain the original request URL after a
          // rewrite. Carry the selected document explicitly as request headers.
          const headers = new Headers(request.headers);
          headers.set("x-storefront-markdown-path", alias ?? path);
          headers.set("x-storefront-markdown-alias", alias ? "1" : "0");
          return NextResponse.rewrite(target, { request: { headers } });
        })()
      : NextResponse.next();
  response.headers.set("Vary", "Accept");
  // Next 16 overwrites custom Vary values on App Pages (next.js#85852).
  // Keep the ISR page cache, but do not let downstream caches store HTML under
  // a URL that also negotiates Markdown. Route handlers retain Vary: Accept.
  if (representation === "html")
    response.headers.set("Cache-Control", "private, no-store");
  response.headers.set(
    "Link",
    `<${SITE_URL}${alias ?? path}>; rel="canonical", </llms.txt>; rel="describedby", <${alias ? path : path === "/" ? "/index.md" : `${path}.md`}>; rel="alternate"; type="text/markdown"`,
  );
  if (alias) response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/contact",
    "/privacy",
    "/banh-flan",
    "/sua-tuyet-van-nam",
    "/sua-tuoi",
    "/terms-and-conditions",
    "/payment-policy",
    "/shipping-policy",
    "/return-refund-policy",
    "/pricing-policy",
    "/complaint-policy",
    "/cookie-policy",
    "/index.md",
    "/about.md",
    "/contact.md",
    "/privacy.md",
    "/banh-flan.md",
    "/sua-tuyet-van-nam.md",
    "/sua-tuoi.md",
    "/about-us.md",
    "/privacy-policy.md",
    "/terms-and-conditions.md",
    "/payment-policy.md",
    "/shipping-policy.md",
    "/return-refund-policy.md",
    "/pricing-policy.md",
    "/complaint-policy.md",
    "/cookie-policy.md",
  ],
};
