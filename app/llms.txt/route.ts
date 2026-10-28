import { agentInstructions } from "@/lib/markdown";

export const dynamic = "force-static";
export function GET() {
  return new Response(agentInstructions(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Link: '</sitemap.xml>; rel="sitemap"',
    },
  });
}
