import { expect, test } from "bun:test";
import { calculateCart } from "./cart";
import { defaultSettings, type CartLine, type ShopProduct } from "./types";

const product: ShopProduct = {
  id: "507f1f77bcf86cd799439012", name: "Sữa tuyết", category: "Sữa",
  description: "", price: 25_000, imageUrl: "", badge: "", unit: "ly",
  status: "available", stock: 5, sortOrder: 0,
  sizes: [{ id: "large", name: "L", price: 35_000, available: true }],
  toppings: [{ id: "oreo", name: "Oreo", price: 5_000, available: true }],
};
const line: CartLine = {
  productId: product.id, sizeId: "large", quantity: 2, toppingIds: ["oreo"],
};

test("giỏ tính ngay giá size, topping và tổng tiền sau tăng giảm hoặc xóa món", () => {
  const result = calculateCart([line], [product], defaultSettings);
  expect(result.lines[0].name).toBe("Sữa tuyết · Size L");
  expect(result.lines[0].unitPrice).toBe(40_000);
  expect(result.subtotal).toBe(80_000);
  expect(result.valid).toBe(true);
  const increased = calculateCart([{ ...line, quantity: 3 }], [product], defaultSettings);
  expect(increased.lines[0].quantity).toBe(3);
  expect(increased.subtotal).toBe(120_000);
  expect(calculateCart([], [product], defaultSettings)).toEqual({ lines: [], subtotal: 0, valid: false });
});

test("kiểm tra tổng tồn của cùng sản phẩm qua nhiều lựa chọn và bỏ cảnh báo khi giảm đủ", () => {
  const plain = { ...line, quantity: 3, toppingIds: [] };
  const tooMany = calculateCart([{ ...line, quantity: 3 }, plain], [product], defaultSettings);
  expect(tooMany.valid).toBe(false);
  expect(tooMany.lines.every((row) => row.issue === "Tiệm chỉ còn 5 phần.")).toBe(true);
  expect(calculateCart([line, plain], [product], defaultSettings).valid).toBe(true);
});

test("giỏ chặn món bị xóa, hết hàng hoặc size/topping không còn bán", () => {
  for (const products of [
    [],
    [{ ...product, status: "hidden" as const }],
    [{ ...product, status: "sold_out" as const }],
    [{ ...product, stock: 0 }],
    [{ ...product, sizes: [] }],
    [{ ...product, sizes: [{ ...product.sizes![0], available: false }] }],
    [{ ...product, toppings: [] }],
    [{ ...product, toppings: [{ ...product.toppings[0], available: false }] }],
  ]) {
    const result = calculateCart([line], products, defaultSettings);
    expect(result.valid).toBe(false);
    expect(result.lines[0].available).toBe(false);
    expect(result.lines[0].issue).toBeTruthy();
  }
});

test("giữ quy tắc một topping và chặn đặt hàng khi tiệm nghỉ", () => {
  const anotherTopping = { id: "flan", name: "Flan", price: 6_000, available: true };
  const result = calculateCart(
    [{ ...line, toppingIds: ["oreo", "flan"] }],
    [{ ...product, toppingSelection: "single", toppings: [...product.toppings, anotherTopping] }],
    defaultSettings,
  );
  expect(result.lines[0].issue).toBe("Chỉ được chọn một topping cho mỗi ly.");
  expect(result.valid).toBe(false);
  expect(calculateCart([line], [product], { ...defaultSettings, isOpen: false }).valid).toBe(false);
});
