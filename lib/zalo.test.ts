import { afterEach, expect, mock, spyOn, test } from "bun:test";
import type { ShopOrder } from "@/shared/commerce/types";

mock.module("server-only", () => ({}));
const { formatZaloOrder, notifyZaloOrder } = await import("./zalo");

const originalFetch = globalThis.fetch;
const originalToken = process.env.ZALO_BOT_TOKEN;
const originalGroup = process.env.ZALO_GROUP_ID;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalToken === undefined) delete process.env.ZALO_BOT_TOKEN;
  else process.env.ZALO_BOT_TOKEN = originalToken;
  if (originalGroup === undefined) delete process.env.ZALO_GROUP_ID;
  else process.env.ZALO_GROUP_ID = originalGroup;
  mock.restore();
});

function order(): ShopOrder {
  return {
    id: "507f1f77bcf86cd799439011", code: "SUA261020TEST",
    status: "preparing", paymentMethod: "cod",
    createdAt: "2026-10-20T03:15:00Z", updatedAt: "2026-10-20T03:15:00Z",
    expiresAt: "2026-10-20T03:45:00Z", events: [], hasReceipt: false,
    customer: {
      name: "Khách thử", phone: "0900000000", address: "123 Đường Thử, TP.HCM",
      note: "Ít đá\nGọi trước khi giao", location: { lat: 10.8, lng: 106.6, accuracy: 10 },
    },
    quote: {
      subtotal: 70000, deliveryFee: 10000, total: 80000, valid: true, digest: "a".repeat(64),
      lines: [{
        productId: "507f1f77bcf86cd799439012", key: "milk", name: "Sữa tươi · Size L",
        imageUrl: "", quantity: 2, toppingIds: ["pearl"],
        toppings: [{ id: "pearl", name: "Trân châu", price: 5000, available: true }],
        unitPrice: 35000, total: 70000, available: true,
      }],
    },
  };
}

test("thông báo giữ thông tin giao hàng và bỏ tiêu đề, giờ đặt, trạng thái, dòng thu COD", () => {
  const text = formatZaloOrder(order()).join("\n");
  for (const value of ["Khách thử", "0900000000",
    "123 Đường Thử", "10.8,106.6", "Size L", "Trân châu", "Ít đá Gọi trước khi giao",
    "2 ×", "Thanh toán khi nhận hàng (COD)", "80.000"]) expect(text).toContain(value);
  for (const value of ["ĐƠN HÀNG MỚI", "SUA261020TEST", "20/10/2026 10:15", "🕒", "📌", "Tiệm đang chuẩn bị", "Cần thu khi giao:"])
    expect(text).not.toContain(value);
  expect(text.startsWith("\n")).toBe(false);
  expect(text).not.toContain("Đã thanh toán");
});

test("chuyển khoản chưa được coi là đã nhận tiền", () => {
  const value = order();
  value.paymentMethod = "bank_transfer";
  value.status = "awaiting_payment";
  const text = formatZaloOrder(value).join("\n");
  expect(text).toContain("Chuyển khoản ngân hàng");
  expect(text).toContain("Chưa xác nhận nhận tiền");
  expect(text).toContain("Giữ món đến: 20/10/2026 10:45");
  expect(text).not.toContain("Cần thu khi giao:");
});

test("đơn bỏ qua vị trí nhắc tiệm xác nhận ship, không báo phí ship bằng 0", () => {
  const value = order();
  value.customer.location = null;
  value.quote.delivery = { mode: "pending", fee: 0 };
  value.quote.deliveryFee = 0;
  value.quote.total = value.quote.subtotal;
  const text = formatZaloOrder(value).join("\n");
  expect(text).toContain("Tiệm liên hệ xác nhận sau");
  expect(text).toContain("TIỀN MÓN (chưa gồm ship)");
  expect(text).not.toContain("Phí giao hàng: 0");
  expect(text).not.toContain("📍 Bản đồ:");
});

test("đơn tối đa 30 dòng và 12 topping không mất thông tin hoặc vượt giới hạn Zalo", () => {
  const value = order();
  value.customer.name = "K".repeat(80);
  value.customer.address = "Đ".repeat(300);
  value.customer.note = "N".repeat(500);
  value.quote.lines = Array.from({ length: 30 }, (_, i) => ({
    ...value.quote.lines[0], key: `line-${i}`,
    name: `Món ${i + 1} ` + "S".repeat(120) + " · Size " + "L".repeat(40),
    toppings: Array.from({ length: 12 }, (_, t) => ({
      id: `top-${t}`, name: `Topping ${t} ` + "T".repeat(50), price: 10000000, available: true,
    })),
  }));
  const messages = formatZaloOrder(value);
  expect(messages.length).toBeGreaterThan(1);
  for (const [index, text] of messages.entries()) {
    expect(text.length).toBeLessThanOrEqual(2000);
    expect(text).not.toContain(value.code);
    expect(text).toContain(`📄 ${index + 1}/${messages.length}`);
  }
  const full = messages.join("\n");
  for (const line of value.quote.lines) expect(full).toContain(line.name);
  expect(full).toContain(value.customer.note);
  expect(full).toContain("TỔNG ĐƠN:");
});

test("gửi từng phần vào đúng nhóm bằng API server", async () => {
  process.env.ZALO_BOT_TOKEN = "mock-token";
  process.env.ZALO_GROUP_ID = "mock-group";
  const requests: { chat_id: string; text: string }[] = [];
  globalThis.fetch = (async (url, options) => {
    expect(String(url)).toBe("https://bot-api.zaloplatforms.com/botmock-token/sendMessage");
    requests.push(JSON.parse(String(options?.body)));
    return Response.json({ ok: true, result: { message_id: "mock" } });
  }) as typeof fetch;
  const value = order();
  await notifyZaloOrder(value);
  expect(requests.map((r) => r.text)).toEqual(formatZaloOrder(value));
  expect(requests.every((r) => r.chat_id === "mock-group")).toBe(true);
});

test("lỗi gửi không làm hỏng checkout và không lộ token trong log", async () => {
  process.env.ZALO_BOT_TOKEN = "mock-secret";
  process.env.ZALO_GROUP_ID = "mock-group";
  const log = spyOn(console, "error").mockImplementation(() => {});
  globalThis.fetch = (async () => { throw new Error("URL chứa mock-secret"); }) as unknown as typeof fetch;
  await notifyZaloOrder(order());
  expect(log).toHaveBeenCalledTimes(1);
  expect(String(log.mock.calls[0])).toContain("[TOKEN]");
  expect(String(log.mock.calls[0])).not.toContain("mock-secret");
});

test("API trả lỗi trong HTTP 200 vẫn ghi nhận gửi thất bại", async () => {
  process.env.ZALO_BOT_TOKEN = "mock-token";
  process.env.ZALO_GROUP_ID = "mock-group";
  const log = spyOn(console, "error").mockImplementation(() => {});
  globalThis.fetch = (async () => Response.json({ ok: false, description: "Quota exceeded" })) as unknown as typeof fetch;
  await notifyZaloOrder(order());
  expect(String(log.mock.calls[0])).toContain("Quota exceeded");
});
