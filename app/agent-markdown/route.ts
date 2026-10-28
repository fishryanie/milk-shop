import { pageCatalog } from "@/lib/catalog";
import { errorResponse } from "@/lib/content-negotiation";
import { pageMarkdown } from "@/lib/markdown";
import { indexablePages, SITE_URL } from "@/lib/site-content";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("document") ?? "/";
  if (!(indexablePages as readonly string[]).includes(path))
    return errorResponse(request);
  const body = pageMarkdown(path, await pageCatalog());
  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      // Avoid mixing representations in CDNs that do not key on arbitrary Vary.
      "Cache-Control": "private, no-store",
      Link: `<${SITE_URL}${path}>; rel="canonical", </llms.txt>; rel="describedby"`,
      ...(url.searchParams.has("alias") ? { "X-Robots-Tag": "noindex" } : {}),
    },
  });
}

export const HEAD = GET;
