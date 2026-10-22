import { createHash } from "node:crypto";
import type {
  CartLine,
  Quote,
  ShopProduct,
  ShopSettings,
  Customer,
  DeliveryQuote,
} from "./types";
import { calculateCart } from "./cart";
import { quoteDelivery } from "./delivery";
export function quoteCart(
  cart: CartLine[],
  products: ShopProduct[],
  settings: ShopSettings,
  location?: Customer["location"],
  shippingDeferred = false,
): Quote {
  const { lines, subtotal, valid } = calculateCart(cart, products, settings);
  const delivery: DeliveryQuote | undefined = location
    ? quoteDelivery(location)
    : shippingDeferred ? { mode: "pending", fee: 0 } : undefined;
  const deliveryFee = delivery?.fee ?? 0;
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
