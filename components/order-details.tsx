"use client";

import { Check, CheckCircle2, ChevronDown, Clock3, Copy, PackageCheck, RefreshCw, ShoppingBag, Truck, Upload, XCircle } from "lucide-react";
import { Button } from "./button";
import { formatClock, formatDate, money, paymentMethodLabels, statusLabels, type OrderStatus, type ShopOrder, type ShopSettings } from "@/shared/commerce/types";

const transferFlow: OrderStatus[] = ["awaiting_payment", "payment_review", "paid", "preparing", "delivering", "completed"];
const transferIcons = [Clock3, Upload, CheckCircle2, ShoppingBag, Truck, PackageCheck];
const codFlow: OrderStatus[] = ["preparing", "delivering", "completed"];
const codIcons = [ShoppingBag, Truck, PackageCheck];
const summaryClass = "flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden";

type OrderDetailsProps = {
  order: ShopOrder;
  settings: ShopSettings;
  copied: boolean;
  onCopy: () => void;
  onRefresh: () => void;
};

export function OrderDetails(props: OrderDetailsProps) {
  const { order, onRefresh } = props;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs leading-5 text-muted">Mã đơn · {formatDate(order.createdAt)} · {formatClock(order.createdAt)}</p>
          <p className="mt-1 break-all text-sm font-medium tracking-wide">{order.code}</p>
        </div>
        <Button variant="icon" aria-label="Cập nhật đơn" onClick={onRefresh}><RefreshCw size={17} /></Button>
      </div>

      <OrderPayment order={order} settings={props.settings} copied={props.copied} onCopy={props.onCopy} />
      <OrderProgress order={order} />
      {order.status === "payment_review" && <div role="status" className="flex items-start gap-2.5 rounded-lg bg-blue-light/50 p-3 text-[13px] leading-6"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-blue" /><div><p className="font-medium">Đã nhận bill chuyển khoản</p><p className="text-muted">Tiệm đang kiểm tra. Trạng thái sẽ tự cập nhật ở đây.</p></div></div>}

      <OrderReceipt order={order} />
    </div>
  );
}

function OrderPayment({ order, settings, copied, onCopy }: Omit<OrderDetailsProps, "onRefresh">) {
  const { quote } = order;
  const pendingShipping = quote.delivery?.mode === "pending";
  const externalShipping = quote.delivery?.mode === "external";
  const qrImage = order.payment?.qrImage || settings.qrImage;
  return <>
      {order.status === "awaiting_payment" && (
        <section aria-label="Hướng dẫn chuyển khoản" className="space-y-3 rounded-xl bg-blue-light/50 p-4 mobile:p-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">{pendingShipping ? "Chuyển khoản tiền món" : "Chuyển khoản cho tiệm"}</h3>
            <strong className="shrink-0 text-xl font-semibold text-blue">{money(quote.total)}</strong>
          </div>
          {pendingShipping && <p className="text-xs leading-5 text-muted">Chưa gồm phí ship. Tiệm sẽ liên hệ xác nhận, bạn thanh toán phí ship riêng sau nhé.</p>}
          <div className="grid grid-cols-[minmax(0,1fr)_160px] items-start gap-4 mobile:grid-cols-[minmax(0,1fr)_128px] mobile:gap-3">
            <div className="space-y-3">
              <p className="text-[13px] leading-6 text-muted">{order.payment?.note || settings.paymentNote}</p>
              <button type="button" onClick={onCopy} className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-line/70 bg-white px-3 py-2.5 text-left transition-colors hover:border-blue/35 hover:bg-blue-light/40">
                <span className="min-w-0"><span className="block text-xs text-muted">{copied ? "Đã sao chép nội dung" : "Nội dung chuyển khoản"}</span><span className="mt-1 block break-all text-[13px] font-medium">{order.code}</span></span>
                {copied ? <Check size={17} className="shrink-0 text-blue" /> : <Copy size={17} className="shrink-0 text-blue" />}
              </button>
              <p className="flex items-start gap-2 text-xs leading-5 text-muted"><Clock3 size={15} className="mt-0.5 shrink-0" />Gửi bill trước {formatClock(order.expiresAt)} để tiệm giữ món cho bạn.</p>
            </div>
            {qrImage && <a href={qrImage} download="qr-tiem-sua.png" className="block rounded-lg border border-line/70 bg-white p-2 text-center">
              <img src={qrImage} alt="Mã QR chuyển khoản do tiệm cung cấp" className="aspect-square w-full object-contain" />
              <span className="mt-2 block text-xs text-muted">Chạm để lưu QR</span>
            </a>}
          </div>
          <p className="border-t border-line/70 pt-3 text-xs leading-5 text-muted">Tiệm kiểm tra bill trước khi xác nhận thanh toán. Nếu đã chuyển khoản mà đơn hết hạn, bạn liên hệ tiệm kèm mã đơn nhé.</p>
        </section>
      )}

      {order.paymentMethod === "cod" && order.status === "preparing" && (
        <section aria-label="Thanh toán khi nhận hàng" className="space-y-2 rounded-xl bg-blue-light/50 p-4 mobile:p-3">
          <div className="flex items-center justify-between gap-3 text-sm"><h3 className="font-medium">Thanh toán khi nhận hàng</h3><strong className="shrink-0 text-xl font-semibold text-blue">{money(quote.total)}</strong></div>
          <p className="text-xs leading-6 text-muted">{pendingShipping ? "Số tiền trên chỉ gồm tiền món. Tiệm sẽ liên hệ xác nhận phí ship, bạn thanh toán khi nhận hàng nhé." : externalShipping ? "Bạn tự book shipper và trả phí ship riêng. Nhớ thống nhất việc thu hộ tiền món với shipper nhé." : "Bạn chuẩn bị tiền mặt để thanh toán khi shipper giao đến nhé."}</p>
        </section>
      )}

  </>;
}

function OrderProgress({ order }: { order: ShopOrder }) {
  const flow = order.paymentMethod === "cod" ? codFlow : transferFlow;
  const icons = order.paymentMethod === "cod" ? codIcons : transferIcons;
  const current = flow.indexOf(order.status);
  const stopped = order.status === "cancelled" || order.status === "expired";
  return <>
      {stopped ? <div className="flex items-start gap-2.5 rounded-lg bg-[#fbede8] p-3 text-[13px] leading-6 text-[#9f4a3b]"><XCircle size={20} className="mt-0.5 shrink-0" /><div><p className="font-medium">{statusLabels[order.status]}</p><p>{order.events.at(-1)?.note}</p></div></div> : (
        <details className="group/progress border-y border-line/70">
          <summary className={summaryClass}><span>Theo dõi đơn</span><span className="flex min-w-0 items-center gap-2 text-right text-[13px] font-normal text-blue">{statusLabels[order.status]}<ChevronDown size={16} className="shrink-0 transition-transform group-open/progress:rotate-180" /></span></summary>
          <ol className="pb-2">
            {flow.map((status, index) => {
              const Icon = icons[index];
              const event = order.events.find((item) => item.status === status);
              return <li key={status} aria-current={index === current ? "step" : undefined} className="relative flex gap-3 pb-4 text-muted [&:not(:last-child)]:before:absolute [&:not(:last-child)]:before:top-8 [&:not(:last-child)]:before:bottom-0 [&:not(:last-child)]:before:left-4 [&:not(:last-child)]:before:w-px [&:not(:last-child)]:before:bg-line">
                <span className={`relative grid size-8 shrink-0 place-items-center rounded-full ${index === current ? "bg-blue text-white" : index < current ? "bg-blue-light text-blue" : "bg-line/40 text-muted"}`}>{index < current ? <Check size={15} /> : <Icon size={16} />}</span>
                <div className="min-w-0 pt-1 text-[13px] leading-6"><p className={index === current ? "font-medium text-ink" : ""}>{statusLabels[status]}</p>{event && <p className="mt-0.5 text-xs leading-5 text-muted">{formatClock(event.at)} · {event.note || "Tiệm đã cập nhật đơn."}</p>}</div>
              </li>;
            })}
          </ol>
        </details>
      )}

  </>;
}

function OrderReceipt({ order }: { order: ShopOrder }) {
  const { quote, customer } = order;
  const pendingShipping = quote.delivery?.mode === "pending";
  const externalShipping = quote.delivery?.mode === "external";
  const totalLabel = pendingShipping ? "Tiền món · chưa gồm ship" : externalShipping ? "Tiền món · ship trả riêng" : "Tổng thanh toán";
  return (
      <details className="group/receipt border-b border-line/70">
        <summary className={`${summaryClass} pt-0`}><span>Chi tiết đơn hàng <span className="font-normal text-muted">· {quote.lines.reduce((sum, line) => sum + line.quantity, 0)} món</span></span><ChevronDown size={16} className="shrink-0 text-muted transition-transform group-open/receipt:rotate-180" /></summary>
        <div className="space-y-4 pb-4 text-[13px] leading-6">
          <ul className="divide-y divide-line/60">{quote.lines.map((line) => <li key={line.key} className="flex items-start justify-between gap-3 py-2.5 first:pt-0"><div className="min-w-0"><p className="break-words font-medium">{line.quantity} × {line.name}</p>{line.toppings.length > 0 && <p className="text-xs leading-5 text-muted">{line.toppings.map((topping) => topping.name).join(", ")}</p>}</div><span className="shrink-0">{money(line.total)}</span></li>)}</ul>
          <dl className="space-y-2 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 [&_dt]:text-muted [&_dd]:text-right">
            <div><dt>Tiền món</dt><dd>{money(quote.subtotal)}</dd></div>
            <div><dt>Phí giao hàng</dt><dd>{pendingShipping ? "Tiệm xác nhận sau" : externalShipping ? "Bạn tự book, trả phí riêng" : quote.deliveryFee ? money(quote.deliveryFee) : "Freeship"}</dd></div>
            <div><dt>Thanh toán</dt><dd>{paymentMethodLabels[order.paymentMethod]}</dd></div>
            <div className="border-t border-line/70 pt-3 font-medium"><dt className="text-ink!">{totalLabel}</dt><dd className="text-base text-blue">{money(quote.total)}</dd></div>
          </dl>
          <section aria-label="Thông tin giao hàng" className="border-t border-line/70 pt-3">
            <h3 className="mb-2 font-medium">Thông tin giao hàng</h3>
            <dl className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-3 gap-y-2 [&_dt]:text-muted [&_dd]:min-w-0 [&_dd]:break-words">
              <dt>Người nhận</dt><dd>{customer.name}</dd><dt>Điện thoại</dt><dd>{customer.phone}</dd><dt>Địa chỉ</dt><dd className="whitespace-pre-line">{customer.address}</dd><dt>Ghi chú</dt><dd className="whitespace-pre-line">{customer.note || "Không có ghi chú"}</dd>
            </dl>
          </section>
        </div>
      </details>
  );
}
