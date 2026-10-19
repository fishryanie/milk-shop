import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { CommerceError } from "@/shared/commerce/validation";
import { store } from "./db";
function secret() {
  const value = process.env.STOREFRONT_SESSION_SECRET;
  if (!value || value.length < 32)
    throw new CommerceError("Cửa hàng chưa hoàn tất cấu hình bảo mật.", 503);
  return value;
}
const sign = (token: string) =>
  createHmac("sha256", secret()).update(token).digest("hex");
export async function session(create = false) {
  const jar = await cookies();
  const value = jar.get("milk_guest")?.value || "";
  const [token, signature] = value.split(".");
  if (
    token &&
    /^[a-f0-9]{64}$/.test(token) &&
    signature &&
    /^[a-f0-9]{64}$/.test(signature) &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(sign(token)))
  )
    return token;
  if (!create)
    throw new CommerceError(
      "Phiên mua hàng đã hết hạn. Vui lòng tải lại trang.",
      401,
    );
  const next = randomBytes(32).toString("hex");
  jar.set("milk_guest", `${next}.${sign(next)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 180 * 86400,
  });
  return next;
}
export function sameOrigin(request: Request) {
  const expected = process.env.STOREFRONT_ORIGIN;
  if (!expected)
    throw new CommerceError("Chưa cấu hình địa chỉ cửa hàng.", 503);
  const origin = request.headers.get("origin");
  const isLocalOrigin = (url?: string | null) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      return (
        ["localhost", "127.0.0.1"].includes(u.hostname) ||
        u.hostname.startsWith("192.168.") ||
        u.hostname.startsWith("10.") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(u.hostname)
      );
    } catch {
      return false;
    }
  };
  const localDev = process.env.NODE_ENV === "development" && isLocalOrigin(origin);
  if (
    (!localDev && origin !== new URL(expected).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new CommerceError("Yêu cầu không hợp lệ.", 403);
}
export async function rateLimit(
  request: Request,
  scope: string,
  max: number,
  windowSeconds = 60,
  identity?: string,
) {
  const clientIp =
    process.env.STOREFRONT_TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"
      : "direct";
  const key = createHmac("sha256", secret())
    .update(
      `${scope}:${identity || clientIp}:${Math.floor(Date.now() / (windowSeconds * 1000))}`,
    )
    .digest("hex");
  const { db } = await store();
  const result = await db
    .collection<{
      _id: string;
      count: number;
      expiresAt: Date;
    }>("storefront_limits")
    .findOneAndUpdate(
      { _id: key },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          expiresAt: new Date(Date.now() + windowSeconds * 2000),
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  if (!result || result.count > max)
    throw new CommerceError(
      "Bạn thao tác hơi nhanh. Vui lòng thử lại sau ít phút.",
      429,
    );
}
export async function jsonBody(request: Request, max = 24000) {
  const reader = request.body?.getReader();
  if (!reader) throw new CommerceError("Thiếu dữ liệu.");
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) {
        await reader.cancel();
        throw new CommerceError("Dữ liệu quá lớn.", 413);
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString("utf8"));
  } catch {
    throw new CommerceError("Dữ liệu JSON không hợp lệ.");
  }
}
