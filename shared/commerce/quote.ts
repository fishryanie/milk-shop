import { createHash } from "node:crypto";
import type {
  CartLine,
  Quote,
  QuotedLine,
  ShopProduct,
  ShopSettings,
  Customer,
} from "./types";
import { cartKey } from "./types";
import { quoteDelivery } from "./delivery";
export function quoteCart(
  cart: CartLine[],
  products: ShopProduct[],
  settings: ShopSettings,
  location?: Customer["location"],
): Quote {
  const amounts = new Map<string, number>();
  for (const line of cart)
    amounts.set(
      line.productId,
      (amounts.get(line.productId) || 0) + line.quantity,
    );
  const lines: QuotedLine[] = cart.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    const size = product?.sizes?.find((s) => s.id === line.sizeId);
    const invalidSize = product?.sizes?.length
      ? !size || !size.available
      : Boolean(line.sizeId);
    const toppings = line.toppingIds
      .map((id) => product?.toppings.find((t) => t.id === id))
      .filter((t) => t != null);
    const issue =
      !product || product.status === "hidden"
        ? "Món này đã ngừng bán."
        : product.status === "sold_out" || product.stock === 0
          ? "Món này vừa hết hàng."
          : product.stock != null &&
              product.stock < (amounts.get(line.productId) || 0)
            ? `Tiệm chỉ còn ${product.stock} phần.`
            : invalidSize
              ? "Size đã thay đổi hoặc hết hàng. Vui lòng chọn lại."
              : product.toppingSelection === "single" && line.toppingIds.length > 1
                ? "Chỉ được chọn một topping cho mỗi ly."
                : toppings.length !== line.toppingIds.length ||
                    toppings.some((t) => !t.available)
                  ? "Topping đã thay đổi hoặc hết hàng. Vui lòng chọn lại."
                  : undefined;
    const unitPrice =
      (size?.price ?? product?.price ?? 0) +
      toppings.reduce((sum, t) => sum + t.price, 0);
    return {
      ...line,
      key: cartKey(line),
      name: product
        ? `${product.name}${size ? ` · Size ${size.name}` : ""}`
        : "Món đã ngừng bán",
      imageUrl: product?.imageUrl || "",
      toppings,
      ...(size ? { size } : {}),
      unitPrice,
      total: unitPrice * line.quantity,
      available: !issue,
      ...(issue ? { issue } : {}),
    };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const delivery = location ? quoteDelivery(location) : undefined;
  const deliveryFee = delivery?.fee ?? 0;
  const valid =
    settings.isOpen && lines.length > 0 && lines.every((l) => l.available);
  const digest = createHash("sha256")
    .update(
      JSON.stringify({ lines, delivery, location, deliveryFee, valid, qrImage: settings.qrImage }),
    )
    .digest("hex");
  return {
    lines,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    valid,
    digest,
    ...(delivery ? { delivery } : {}),
  };
}
export { orderTransitions as transitions } from "./types";
