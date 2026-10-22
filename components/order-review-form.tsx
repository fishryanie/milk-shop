"use client";

import type { RefObject } from "react";
import { money, paymentMethodLabels, type Customer, type PaymentMethod, type Quote } from "@/shared/commerce/types";

export type CheckoutReview = { quote: Quote; customer: Customer; paymentMethod: PaymentMethod };

const distanceFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const editClass = "min-h-9 shrink-0 cursor-pointer rounded-button px-2 text-xs font-medium text-blue transition-colors hover:bg-blue-light disabled:cursor-not-allowed disabled:opacity-45";

export function OrderReviewForm({ formId, review, introRef, pickupAddress, busy, action, onEditCustomer, onEditLocation, onEditPayment, onEditCart }: {
  formId: string;
  review: CheckoutReview;
  introRef: RefObject<HTMLDivElement | null>;
  pickupAddress: string;
  busy: boolean;
  action: (data: FormData) => void;
  onEditCustomer: () => void;
  onEditLocation: () => void;
  onEditPayment: () => void;
  onEditCart: () => void;
}) {
  const { quote, customer, paymentMethod } = review;
  const delivery = quote.delivery;
  const shippingLabel = delivery?.mode === "pending" ? "Tiệm xác nhận sau"
    : delivery?.mode === "external" ? "Bạn tự book, trả phí riêng"
    : quote.deliveryFee ? money(quote.deliveryFee) : "Freeship";

  return (
    <form id={formId} action={action} className="space-y-4 px-5 py-2 mobile:px-3">

      <section aria-label="Thông tin giao hàng">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-ink">Thông tin giao hàng</h3>
          <button type="button" className={editClass} disabled={busy} onClick={onEditCustomer}>Sửa thông tin</button>
        </div>
        <dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[13px] leading-6 [&_dt]:text-muted [&_dd]:min-w-0 [&_dd]:break-words">
          <dt>Người nhận</dt><dd>{customer.name}</dd>
          <dt>Điện thoại</dt><dd>{customer.phone}</dd>
          <dt>Địa chỉ</dt><dd className="whitespace-pre-line">{customer.address}</dd>
          <dt>Ghi chú</dt><dd className="whitespace-pre-line">{customer.note || "Không có ghi chú"}</dd>
          <dt>Vị trí nhận</dt>
          <dd>
            <div className="flex flex-wrap items-center gap-x-2">
              {customer.location ? <a className="text-blue underline underline-offset-2" href={`https://maps.google.com/?q=${customer.location.lat},${customer.location.lng}`} target="_blank" rel="noreferrer">Xem điểm nhận trên bản đồ</a> : <span>Đã bỏ qua chia sẻ vị trí</span>}
              <button type="button" className={`${editClass} px-0!`} disabled={busy} onClick={onEditLocation}>Đổi vị trí</button>
            </div>
            {delivery && delivery.mode !== "pending" && <p className="text-xs leading-5 text-muted">Cách tiệm {distanceFormatter.format(delivery.distanceKm)} km theo đường chim bay.</p>}
          </dd>
        </dl>
      </section>

      <section aria-label="Món đã chọn" className="border-t border-line/70 pt-3">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-ink">Món đã chọn · {quote.lines.reduce((sum, line) => sum + line.quantity, 0)} món</h3>
          <button type="button" className={editClass} disabled={busy} onClick={onEditCart}>Sửa giỏ hàng</button>
        </div>
        <ul className="divide-y divide-line/60">
          {quote.lines.map((line) => <li key={line.key} className="py-2.5 text-[13px] leading-6">
            <div className="flex items-start justify-between gap-3"><span className="min-w-0 break-words font-medium">{line.name}</span><span className="shrink-0">{money(line.total)}</span></div>
            {line.toppings.length > 0 && <p className="text-xs leading-5 text-muted">Topping: {line.toppings.map((topping) => `${topping.name} (+${money(topping.price)})`).join(", ")}</p>}
            <p className="text-xs leading-5 text-muted">{line.quantity} × {money(line.unitPrice)}</p>
          </li>)}
        </ul>
      </section>

      <section aria-label="Thanh toán và tổng tiền" className="border-t border-line/70 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-ink">Thanh toán & tổng tiền</h3>
          <button type="button" className={editClass} disabled={busy} onClick={onEditPayment}>Đổi thanh toán</button>
        </div>
        <dl className="space-y-2.5 text-[13px] leading-6 [&>div]:flex [&>div]:justify-between [&>div]:gap-4 [&_dt]:text-muted [&_dd]:min-w-0 [&_dd]:text-right">
          <div><dt>Phương thức</dt><dd>{paymentMethodLabels[paymentMethod]}</dd></div>
          <div><dt>Tiền món</dt><dd>{money(quote.subtotal)}</dd></div>
          <div><dt>Phí giao hàng</dt><dd>{shippingLabel}</dd></div>
          <div className="border-t border-line/70 pt-3 text-sm font-medium"><dt className="text-ink!">{delivery?.mode === "pending" ? "Tiền món · chưa gồm ship" : delivery?.mode === "external" ? "Tiền món · ship trả riêng" : "Tổng thanh toán"}</dt><dd className="text-base text-blue">{money(quote.total)}</dd></div>
        </dl>
        <div className="mt-3 space-y-2 rounded-lg bg-blue-light/50 px-3 py-2.5 text-xs leading-6 text-muted">
          {delivery?.mode === "pending" && <p>Tiệm sẽ liên hệ xác nhận phí ship theo địa chỉ bạn nhập. Số tiền trên chỉ gồm tiền món.</p>}
          {delivery?.mode === "external" && <p>Bạn tự book shipper đến lấy tại {pickupAddress} và thanh toán phí ship riêng.{paymentMethod === "cod" && " Bạn nhớ thống nhất việc thu hộ tiền món với shipper nhé."}</p>}
          <p>{paymentMethod === "bank_transfer" ? "Mã QR sẽ hiện sau khi bạn xác nhận đặt hàng. Bạn chuyển đúng số tiền và ghi mã đơn trong nội dung chuyển khoản nhé." : "Bạn thanh toán khi nhận hàng nhé."}</p>
        </div>
      </section>
    </form>
  );
}
