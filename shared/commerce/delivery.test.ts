import { expect, test } from "bun:test";
import { deliveryForDistance, quoteDelivery, SHOP_LOCATION } from "./delivery";
import { quoteCart } from "./quote";
import { checkoutSchema } from "./validation";
import { defaultSettings, type ShopProduct } from "./types";

const product: ShopProduct = {
  id: "507f1f77bcf86cd799439012", name: "Sữa tươi", category: "Sữa",
  description: "", price: 25_000, imageUrl: "", badge: "", unit: "ly",
  status: "available", stock: 10, toppings: [], sortOrder: 0,
};
const cart = [{ productId: product.id, quantity: 1, toppingIds: [] }];
const atDistance = (km: number) => ({
  lat: SHOP_LOCATION.lat + km / 6371 * 180 / Math.PI,
  lng: SHOP_LOCATION.lng,
  accuracy: 10,
});

test("phân mức ship theo khoảng cách chưa làm tròn, bao gồm đúng 1 km và 3 km", () => {
  for (const [distance, mode, fee] of [
    [0, "free", 0], [0.999999, "free", 0], [1, "local", 10_000],
    [2, "local", 10_000], [3, "local", 10_000], [3.000001, "external", 0],
  ] as const) {
    expect(deliveryForDistance(distance)).toEqual({ mode, distanceKm: distance, fee });
  }
});

test("tính khoảng cách từ tọa độ shop và khách", () => {
  expect(quoteDelivery({ ...SHOP_LOCATION, accuracy: 10 }).distanceKm).toBe(0);
  expect(quoteDelivery(atDistance(2)).distanceKm).toBeCloseTo(2, 8);
  expect(quoteDelivery(atDistance(4)).mode).toBe("external");
});

test("tổng tiền theo khoảng cách, không dùng phí cũ hoặc điều kiện miễn ship theo giá trị đơn", () => {
  const settings = { ...defaultSettings, deliveryFee: 50_000, freeDeliveryFrom: 1 };
  const near = quoteCart(cart, [product], settings, atDistance(0.5));
  const local = quoteCart(cart, [product], settings, atDistance(2));
  const external = quoteCart(cart, [product], settings, atDistance(4));
  expect(near.total).toBe(25_000);
  expect(local.total).toBe(35_000);
  expect(local.deliveryFee).toBe(10_000);
  expect(external.total).toBe(25_000);
  expect(external.delivery?.mode).toBe("external");
});

test("báo giá gắn với vị trí đã xác nhận, kể cả cùng mức phí", () => {
  const base = quoteCart(cart, [product], defaultSettings);
  const first = quoteCart(cart, [product], defaultSettings, atDistance(0.2));
  const second = quoteCart(cart, [product], defaultSettings, atDistance(0.4));
  expect(base.delivery).toBeUndefined();
  expect(first.digest).not.toBe(base.digest);
  expect(first.digest).not.toBe(second.digest);
});

test("không nhận đơn thiếu vị trí hoặc chưa đồng ý phí ship", () => {
  const input = {
    cart, customer: { name: "Khách yêu", phone: "0900000000", address: "123 Thống Nhất", note: "", location: atDistance(2) },
    shippingConfirmed: true, paymentMethod: "cod", digest: "a".repeat(64),
    idempotencyKey: "8c03c9e1-54ea-4b19-bbca-b55d57313303",
  };
  expect(checkoutSchema.safeParse(input).success).toBe(true);
  expect(checkoutSchema.safeParse({ ...input, shippingConfirmed: false }).success).toBe(false);
  const { shippingConfirmed: _confirmed, ...unconfirmed } = input;
  expect(checkoutSchema.safeParse(unconfirmed).success).toBe(false);
  expect(checkoutSchema.safeParse({ ...input, customer: { ...input.customer, location: null } }).success).toBe(false);
  expect(checkoutSchema.safeParse({ ...input, customer: { ...input.customer, location: { ...atDistance(2), lat: 91 } } }).success).toBe(false);
});
