import { expect, test } from "bun:test";
import type { Db, MongoClient } from "mongodb";
import { CommerceStore } from "./store";
import { defaultSettings, type Quote, type ShopOrder } from "./types";
import { SHOP_LOCATION } from "./delivery";
import { quoteCart } from "./quote";

function fixture(options: { retry?: boolean; failCommit?: boolean } = {}) {
  let saved: unknown;
  let committed = false;
  let writes = 0;
  const orders = {
    findOne: async () => saved,
    insertOne: async (doc: unknown) => { saved = doc; },
  };
  const db = { collection: (name: string) => name === "storefront_orders" ? orders : {
    updateOne: async () => { writes++; return { matchedCount: 1 }; },
  } } as unknown as Db;
  const client = { startSession: () => ({
    withTransaction: async (fn: () => Promise<unknown>) => {
      if (options.retry) { await fn(); saved = undefined; }
      const result = await fn();
      if (options.failCommit) { saved = undefined; throw new Error("commit failed"); }
      committed = true;
      return result;
    },
    endSession: async () => {},
  }) } as unknown as MongoClient;
  const store = new CommerceStore(db, client, "test-store");
  store.expire = async () => {};
  store.settings = async () => ({ ...defaultSettings });
  store.quote = async () => ({ valid: true, digest: "a".repeat(64) } as Quote);
  const input = {
    cart: [{ productId: "507f1f77bcf86cd799439012", quantity: 1, toppingIds: [] }],
    customer: { name: "Khách thử", phone: "0900000000", address: "123 Đường Thử", note: "", location: { ...SHOP_LOCATION, accuracy: 10 } },
    shippingConfirmed: true,
    paymentMethod: "cod", digest: "a".repeat(64),
    idempotencyKey: "8c03c9e1-54ea-4b19-bbca-b55d57313303",
  };
  return { store, input, committed: () => committed, writes: () => writes };
}

test("chỉ lên lịch thông báo sau commit; gửi lại cùng đơn không thông báo trùng", async () => {
  const f = fixture();
  const notified: ShopOrder[] = [];
  const onCreated = (order: ShopOrder) => {
    expect(f.committed()).toBe(true);
    notified.push(order);
  };
  const first = await f.store.checkout(f.input, "owner", onCreated);
  const second = await f.store.checkout(f.input, "owner", onCreated);
  expect(second.id).toBe(first.id);
  expect(notified).toHaveLength(1);
  expect(f.writes()).toBe(1);
});

test("transaction được MongoDB thử lại vẫn chỉ thông báo một lần", async () => {
  const f = fixture({ retry: true });
  let notifications = 0;
  await f.store.checkout(f.input, "owner", () => {
    expect(f.committed()).toBe(true);
    notifications++;
  });
  expect(notifications).toBe(1);
});

test("commit thất bại không gửi thông báo đơn hàng", async () => {
  const f = fixture({ failCommit: true });
  let notifications = 0;
  await expect(f.store.checkout(f.input, "owner", () => { notifications++; })).rejects.toThrow("commit failed");
  expect(notifications).toBe(0);
});

test("yêu cầu trùng mã nhưng khác nội dung không gửi thông báo", async () => {
  const f = fixture();
  let notifications = 0;
  const onCreated = () => { notifications++; };
  await f.store.checkout(f.input, "owner", onCreated);
  await expect(f.store.checkout({ ...f.input, customer: { ...f.input.customer, note: "đổi" } }, "owner", onCreated))
    .rejects.toThrow("Mã gửi đơn đã dùng cho nội dung khác");
  expect(notifications).toBe(1);
});

test("checkout tính lại ship từ tọa độ, lưu đúng tổng tiền cho COD và QR", async () => {
  const product = {
    id: "507f1f77bcf86cd799439012", name: "Sữa", category: "Sữa", description: "",
    price: 25_000, imageUrl: "", badge: "", unit: "ly", status: "available" as const,
    stock: 10, toppings: [], sortOrder: 0,
  };
  for (const paymentMethod of ["cod", "bank_transfer"] as const) {
    for (const km of [0.5, 2, 4]) {
      const f = fixture();
      const settings = { ...defaultSettings, qrImage: "https://example.com/qr.png" };
      f.store.settings = async () => settings;
      f.store.quote = async (cart, _session, currentSettings, location) =>
        quoteCart(cart, [product], currentSettings ?? settings, location);
      const customer = { ...f.input.customer, location: {
        ...SHOP_LOCATION, lat: SHOP_LOCATION.lat + km / 6371 * 180 / Math.PI, accuracy: 10,
      } };
      const quote = quoteCart(f.input.cart, [product], settings, customer.location);
      const order = await f.store.checkout({ ...f.input, customer, paymentMethod, digest: quote.digest }, "owner");
      expect(order.quote.total).toBe(km === 2 ? 35_000 : 25_000);
      expect(order.quote.delivery?.mode).toBe(km < 1 ? "free" : km <= 3 ? "local" : "external");
      expect(order.status).toBe(paymentMethod === "cod" ? "preparing" : "awaiting_payment");
      expect(Boolean(order.payment?.qrImage)).toBe(paymentMethod === "bank_transfer");
    }
  }
});

test("không trừ tồn khi khách dùng báo giá chưa tính vị trí hoặc đổi vị trí sau khi xác nhận", async () => {
  const f = fixture();
  f.store.quote = async () => ({ valid: true, digest: "b".repeat(64) } as Quote);
  await expect(f.store.checkout(f.input, "owner")).rejects.toThrow("Giá, topping hoặc tồn hàng vừa thay đổi");
  expect(f.writes()).toBe(0);
});
