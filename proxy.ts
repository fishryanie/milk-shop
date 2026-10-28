import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, negotiateContent } from "@/lib/content-negotiation";
import { markdownAliases } from "@/lib/markdown";

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
          return NextResponse.rewrite(target);
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
    `</llms.txt>; rel="describedby", <${alias ? path : path === "/" ? "/index.md" : `${path}.md`}>; rel="alternate"; type="text/markdown"`,
  );
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
    "/index.md",
    "/about.md",
    "/contact.md",
    "/privacy.md",
    "/banh-flan.md",
    "/sua-tuyet-van-nam.md",
    "/sua-tuoi.md",
  ],
};
