import { errorResponse } from "@/lib/content-negotiation";

// This fallback runs only after real pages, API routes and public files match.
export const GET = (request: Request) => errorResponse(request);
export const HEAD = GET;
