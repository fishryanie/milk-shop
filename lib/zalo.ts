import "server-only";
import {
  formatStamp,
  money,
  paymentMethodLabels,
  type ShopOrder,
} from "@/shared/commerce/types";

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

export function formatZaloOrder(order: ShopOrder): string[] {
  const { customer, quote } = order;
  const header = `🧾 Mã đơn hàng: ${order.code}`;
  const blocks = [
    `💳 ${paymentMethodLabels[order.paymentMethod]}`,
    [
      "👤 KHÁCH HÀNG",
      `Tên: ${oneLine(customer.name)}`,
      `SĐT: ${customer.phone}`,
      `Địa chỉ: ${oneLine(customer.address)}`,
      ...(customer.location
        ? [`📍 Bản đồ: https://maps.google.com/?q=${customer.location.lat},${customer.location.lng}`]
        : []),
    ].join("\n"),
    `🛍 CHI TIẾT · ${quote.lines.reduce((sum, line) => sum + line.quantity, 0)} phần`,
    ...quote.lines.map((line, index) => [
      `${index + 1}. ${oneLine(line.name)}`,
      ...(line.toppings.length
        ? [`   Topping mỗi phần: ${line.toppings.map((t) => `${oneLine(t.name)} (+${money(t.price)})`).join(", ")}`]
        : []),
      `   ${line.quantity} × ${money(line.unitPrice)} = ${money(line.total)}`,
    ].join("\n")),
    [
      "💰 TỔNG TIỀN",
      `Tiền món: ${money(quote.subtotal)}`,
      quote.delivery?.mode === "pending"
        ? "Phí giao hàng: Tiệm liên hệ xác nhận sau theo địa chỉ khách nhập (khách bỏ qua vị trí)."
        : quote.delivery?.mode === "external"
        ? "Giao hàng: Khách tự book ship ngoài đến lấy, phí ship trả riêng."
        : `Phí giao hàng: ${money(quote.deliveryFee)}`,
      `${quote.delivery?.mode === "pending" ? "TIỀN MÓN (chưa gồm ship)" : "TỔNG ĐƠN"}: ${money(quote.total)}`,
      ...(order.paymentMethod === "bank_transfer"
        ? ["Chưa xác nhận nhận tiền; chờ khách chuyển khoản và gửi bill.",
          `Giữ món đến: ${formatStamp(order.expiresAt)}`]
        : []),
    ].join("\n"),
    `📝 GHI CHÚ\n${oneLine(customer.note) || "Không có"}`,
  ];

  // Zalo limits each message to 2,000 characters. Keep all order details,
  // split at section/item boundaries and repeat the order code on each part.
  const messages: string[] = [];
  let current = header;
  for (const block of blocks) {
    if (current && current.length + block.length + 2 > 1960) {
      messages.push(current);
      current = header;
    }
    current += `${current ? "\n\n" : ""}${block}`;
  }
  messages.push(current);
  return messages.length === 1 ? messages : messages.map(
    (message, index) => `${message}\n\n📄 ${index + 1}/${messages.length}`,
  );
}

export async function notifyZaloOrder(order: ShopOrder): Promise<void> {
  const token = process.env.ZALO_BOT_TOKEN?.trim();
  const chatId = process.env.ZALO_GROUP_ID?.trim();
  try {
    if (!token || !chatId) throw new Error("Thiếu ZALO_BOT_TOKEN hoặc ZALO_GROUP_ID.");
    for (const text of formatZaloOrder(order)) {
      const response = await fetch(
        `https://bot-api.zaloplatforms.com/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text }),
          signal: AbortSignal.timeout(10000),
          cache: "no-store",
        },
      );
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.description || `HTTP ${response.status}`);
      }
    }
  } catch (error) {
    // An unavailable notification service must not turn a saved order into a
    // failed checkout. Never log request URLs containing the bot token.
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[zalo] Đơn ${order.code}: ${token ? message.split(token).join("[TOKEN]") : message}`);
  }
}
