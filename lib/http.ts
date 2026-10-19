import { ZodError } from "zod";
import { CommerceError } from "@/shared/commerce/validation";
export function ok(data: unknown, status = 200) {
  return Response.json(
    { success: true, data },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}
export function fail(error: unknown) {
  if (error instanceof CommerceError)
    return Response.json(
      { success: false, message: error.message, code: error.code },
      {
        status: error.status,
        headers: {
          "Cache-Control": "no-store",
          ...(error.status === 429 ? { "Retry-After": "60" } : {}),
        },
      },
    );
  if (error instanceof ZodError)
    return Response.json(
      {
        success: false,
        message: error.issues[0]?.message || "Kiểm tra lại thông tin.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  console.error(
    "Storefront request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json(
    {
      success: false,
      message:
        "Tiệm đang gặp sự cố kết nối. Dữ liệu của bạn vẫn được giữ, hãy thử lại.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
