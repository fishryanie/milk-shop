import type { Customer, DeliveryQuote } from "./types";

// The same pin used by the storefront map at 748/30 Thống Nhất.
export const SHOP_LOCATION = { lat: 10.852523902605594, lng: 106.66730207366463 };

export function deliveryForDistance(distanceKm: number): DeliveryQuote {
  if (!Number.isFinite(distanceKm) || distanceKm < 0)
    throw new Error("Khoảng cách giao hàng không hợp lệ.");
  const mode = distanceKm < 1 ? "free" : distanceKm <= 3 ? "local" : "external";
  return { mode, distanceKm, fee: mode === "local" ? 10_000 : 0 };
}

export function quoteDelivery(location: NonNullable<Customer["location"]>): DeliveryQuote {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latDiff = radians(location.lat - SHOP_LOCATION.lat);
  const lngDiff = radians(location.lng - SHOP_LOCATION.lng);
  const a = Math.sin(latDiff / 2) ** 2 +
    Math.cos(radians(SHOP_LOCATION.lat)) * Math.cos(radians(location.lat)) *
    Math.sin(lngDiff / 2) ** 2;
  return deliveryForDistance(6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a)))));
}

export function deliveryMessage(delivery: DeliveryQuote): string {
  if (delivery.mode === "free")
    return "Bạn yêu ở gần tiệm quá nè, chưa đến 1 km thôi! Tiệm thương tặng bạn một chuyến freeship, chỉ cần chờ món ngon đến tận tay nhé 💙";
  if (delivery.mode === "local")
    return "Bạn yêu cách tiệm từ 1–3 km nè. Bạn phụ tiệm 10.000đ phí ship nhé, còn món ngon cứ để tiệm mang đến tận tay 💙";
  return "Bạn yêu ở xa tiệm hơn 3 km rồi nè. Bạn vui lòng tự book shipper đến tiệm lấy món giúp tiệm nhé! Phí ship bạn thanh toán riêng với bên giao hàng, tổng đơn tại tiệm chỉ gồm tiền món thôi 💙";
}
