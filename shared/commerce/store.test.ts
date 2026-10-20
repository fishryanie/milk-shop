import { expect, test } from "bun:test";
import type { Db, MongoClient } from "mongodb";
import { CommerceStore } from "./store";
import { defaultSettings, type Quote, type ShopOrder } from "./types";

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
    customer: { name: "Khách thử", phone: "0900000000", address: "123 Đường Thử", note: "", location: null },
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
