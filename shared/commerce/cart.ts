import {
  cartKey,
  type CartLine,
  type QuotedLine,
  type ShopProduct,
  type ShopSettings,
} from "./types";

// Shared by the instant cart preview and the server's authoritative quote.
export function calculateCart(
  cart: CartLine[],
  products: ShopProduct[],
  settings: ShopSettings,
) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const amounts = new Map<string, number>();
  for (const line of cart)
    amounts.set(
      line.productId,
      (amounts.get(line.productId) || 0) + line.quantity,
    );
  const lines: QuotedLine[] = cart.map((line) => {
    const product = byId.get(line.productId);
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
  return {
    lines,
    subtotal: lines.reduce((sum, line) => sum + line.total, 0),
    valid: settings.isOpen && lines.length > 0 && lines.every((line) => line.available),
  };
}
