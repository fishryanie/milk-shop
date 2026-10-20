"use client";
import { Button } from "./button";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  Upload,
  XCircle,
} from "lucide-react";
import { Modal, useModalMotion } from "./modal";
import { api } from "@/lib/client";
import { OrderCelebration } from "./order-celebration";
import {
  money,
  statusLabels,
  paymentMethodLabels,
  formatDate,
  formatClock,
  type ShopOrder,
  type ShopSettings,
  type OrderStatus,
} from "@/shared/commerce/types";
const transferFlow: OrderStatus[] = [
  "awaiting_payment",
  "payment_review",
  "paid",
  "preparing",
  "delivering",
  "completed",
];
const transferIcons = [
  Clock3,
  Upload,
  CheckCircle2,
  ShoppingBag,
  Truck,
  PackageCheck,
];
const codFlow: OrderStatus[] = ["preparing", "delivering", "completed"];
const codIcons = [ShoppingBag, Truck, PackageCheck];
export function OrdersSheet({
  settings,
  initialOrder,
  onClose,
  onRefreshCatalog,
}: {
  settings: ShopSettings;
  initialOrder?: ShopOrder;
  onClose: () => void;
  onRefreshCatalog: () => void;
}) {
  const { dialogRef, dismiss } = useModalMotion(onClose);
  const [orders, setOrders] = useState<ShopOrder[]>(
    initialOrder ? [initialOrder] : [],
  );
  const [activeId, setActiveId] = useState(initialOrder?.id || "");
  const [detailReadyId, setDetailReadyId] = useState(initialOrder?.id || "");
  const refreshSequence = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const [isLoadingMore, startLoadMoreTransition] = useTransition();

  const refresh = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    try {
      const result = await api<{
        orders: ShopOrder[];
        nextCursor: string | null;
      }>("/api/orders");
      const detailId = activeId || (
        result.orders.length === 1 && !result.nextCursor
          ? result.orders[0].id
          : undefined
      );
      const detail = detailId
        ? await api<ShopOrder>(`/api/orders/${detailId}`)
        : undefined;
      if (sequence !== refreshSequence.current) return;
      const incoming = detail
        ? result.orders.some((o) => o.id === detail.id)
          ? result.orders.map((o) => (o.id === detail.id ? detail : o))
          : [...result.orders, detail]
        : result.orders;
      setOrders((old) => [
        ...incoming,
        ...old.filter((o) => !incoming.some((n) => n.id === o.id)),
      ]);
      setCursor(result.nextCursor);
      if (detail) {
        setActiveId(detail.id);
        setDetailReadyId(detail.id);
      }
      setError("");
    } catch (err) {
      if (sequence === refreshSequence.current)
        setError(err instanceof Error ? err.message : "Chưa tải được đơn.");
    } finally {
      if (sequence === refreshSequence.current) setLoading(false);
    }
  }, [activeId]);
  useEffect(() => {
    void refresh();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 10000);
    return () => {
      clearInterval(id);
      refreshSequence.current++;
    };
  }, [refresh]);
  const active = orders.find((o) => o.id === activeId);
  const hasMultipleOrders = orders.length > 1 || Boolean(cursor);
  const detailReady = Boolean(active && detailReadyId === active.id);
  const celebrating = Boolean(initialOrder && active?.id === initialOrder.id);

  function loadMore() {
    if (!cursor || isLoadingMore) return;
    startLoadMoreTransition(async () => {
      try {
        const result = await api<{
          orders: ShopOrder[];
          nextCursor: string | null;
        }>(`/api/orders?before=${cursor}`);
        setOrders((old) => [
          ...old,
          ...result.orders.filter((o) => !old.some((n) => n.id === o.id)),
        ]);
        setCursor(result.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chưa tải được đơn cũ.");
      }
    });
  }

  function upload(file?: File) {
    if (!file || !active || isUploading) return;
    if (
      file.size > 3_000_000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setError("Chọn ảnh JPG, PNG hoặc WebP, tối đa 3 MB.");
      return;
    }
    setError("");
    startUploadTransition(async () => {
      try {
        await api(`/api/orders/${active.id}/receipt`, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        await refresh();
        onRefreshCatalog();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Chưa gửi được bill. Ảnh vẫn ở thiết bị, bạn thử lại nhé.",
        );
      }
    });
  }
  return (
    <Modal
      dialogRef={dialogRef}
      title={celebrating ? "Tiệm đã nhận đơn!" : "Đơn của bạn"}
      eyebrow={
        celebrating
          ? "Cảm ơn bạn đã ghé tiệm"
          : !activeId
            ? "Chọn đơn để xem chi tiết"
            : "Theo dõi đơn hàng của bạn"
      }
      onClose={() => dismiss()}
      wide
      busy={isUploading}
      footer={
        detailReady && active?.status === "awaiting_payment" ? (
          <div className="[&>p]:mt-0 [&>p]:mb-3">
            {error && (
              <p
                className="mt-2.5 text-[11px] leading-[1.6] mobile:text-xs text-red!"
                role="alert"
              >
                {error}
              </p>
            )}
            <p className="mt-2.5 text-[11px] leading-[1.6] mobile:text-xs">
              Đã chuyển khoản? Gửi ảnh bill để tiệm xác nhận.
            </p>
            <label
              className={`relative inline-flex h-10 min-h-10 items-center justify-center gap-2 overflow-hidden rounded-lg px-4 text-[13px] font-semibold select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 enabled:active:translate-y-px enabled:active:scale-[.96] mobile:[&>svg]:shrink-0 bg-blue text-white enabled:hover:-translate-y-px enabled:hover:bg-blue-dark enabled:active:translate-y-[1.5px] enabled:active:bg-blue-dark enabled:active:brightness-[.94] enabled:active:shadow-[inset_0_1px_4px_#203d4559] col-span-full w-full cursor-pointer focus-within:outline-3 focus-within:outline-[#64aabc] focus-within:outline-offset-3 [&_input]:absolute [&_input]:inset-0 [&_input]:w-full [&_input]:cursor-pointer [&_input]:opacity-0 mobile:min-h-[52px] mobile:text-sm ${isUploading ? "cursor-not-allowed! opacity-55!" : ""}`}
            >
              <Upload size={18} />
              {isUploading ? "Đang gửi bill…" : "Tôi đã chuyển khoản · Gửi bill"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploading}
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        ) : undefined
      }
    >
      <div className="px-7 pt-[22px] pb-7 mobile:pt-[18px] mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pb-6 mobile:pl-[max(12px,env(safe-area-inset-left,0px))]">
        {initialOrder && celebrating && (
          <OrderCelebration transfer={initialOrder.paymentMethod === "bank_transfer"} />
        )}
        {loading && !orders.length ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-[17px] px-5 py-10 text-center [&_svg]:text-[#8aa5ab] [&_h3]:font-serif [&_h3]:text-[27px] [&_p]:max-w-[350px] [&_p]:text-xs [&_p]:leading-[1.8] [&_p]:text-muted mobile:min-h-[260px] mobile:gap-4 mobile:py-[30px] mobile:[&_h3]:leading-[1.3] mobile:[&_p]:text-sm">
            <RefreshCw className="animate-spin" />
            <p>Tiệm đang tìm đơn của bạn…</p>
          </div>
        ) : !orders.length ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-[17px] px-5 py-10 text-center [&_svg]:text-[#8aa5ab] [&_h3]:font-serif [&_h3]:text-[27px] [&_p]:max-w-[350px] [&_p]:text-xs [&_p]:leading-[1.8] [&_p]:text-muted mobile:min-h-[260px] mobile:gap-4 mobile:py-[30px] mobile:[&_h3]:leading-[1.3] mobile:[&_p]:text-sm">
            <ShoppingBag size={46} strokeWidth={1} />
            <h3>Bạn chưa đặt đơn nào</h3>
            <p>Những món ngon đang chờ bạn ở menu.</p>
            <Button variant="primary" onClick={() => dismiss()}>
              Chọn món thôi
            </Button>
          </div>
        ) : (
          <>
            {!activeId && (
              <>
                <ul aria-label="Danh sách đơn hàng" className="grid list-none gap-3 p-0">
                  {orders.map((order) => (
                    <li key={order.id}>
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-blue hover:bg-blue-light active:bg-blue-light"
                        onClick={() => {
                          setActiveId(order.id);
                          setDetailReadyId("");
                          setCopied(false);
                          setError("");
                        }}
                        aria-label={`Xem đơn ${order.code}`}
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-light text-blue">
                          <ShoppingBag size={20} strokeWidth={1.6} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block break-all text-sm font-semibold text-ink">{order.code}</span>
                          <span className="mt-1 block text-xs text-muted">
                            {formatDate(order.createdAt)} · {formatClock(order.createdAt)}
                          </span>
                          <span className="mt-2 block text-xs font-medium text-blue">{statusLabels[order.status]}</span>
                          <span className="mt-1 block text-xs text-muted">
                            {order.quote.lines.reduce((total, line) => total + line.quantity, 0)} món · {money(order.quote.total)}
                          </span>
                        </span>
                        <ChevronRight size={18} className="shrink-0 text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
                {cursor && (
                  <Button className="mt-4 w-full" onClick={loadMore} disabled={isLoadingMore}>
                    {isLoadingMore ? "Đang tải…" : "Xem thêm đơn hàng"}
                  </Button>
                )}
              </>
            )}
            {activeId && hasMultipleOrders && (
              <Button
                variant="text"
                className="mb-4"
                disabled={isUploading}
                onClick={() => {
                  setActiveId("");
                  setDetailReadyId("");
                  setCopied(false);
                  setError("");
                }}
              >
                <ArrowLeft size={16} /> Danh sách đơn hàng
              </Button>
            )}
            {activeId && !detailReady && !error && (
              <div role="status" className="flex min-h-40 items-center justify-center gap-3 text-sm text-muted">
                <RefreshCw size={18} className="animate-spin" /> Đang tải chi tiết đơn…
              </div>
            )}
            {active && detailReady && (
              <>
                <div className="my-[21px] flex items-center justify-between [&_p]:text-[8px] [&_h3]:text-base [&_h3]:tracking-[1px] mobile:my-[18px] mobile:gap-[9px] mobile:[&_p]:text-[10px] mobile:[&_h3]:leading-[1.6] mobile:[&_h3]:tracking-[.4px] mobile:[&_h3]:[overflow-wrap:anywhere]">
                  <div>
                    <p className="mb-2.5 text-[9px] font-semibold tracking-[2px] text-blue uppercase mobile:mb-2 mobile:text-[10px] mobile:tracking-[1.4px]">
                      Mã đơn · {formatDate(active.createdAt)}
                    </p>
                    <h3>{active.code}</h3>
                  </div>
                  <Button
                    variant="icon"
                    aria-label="Cập nhật đơn"
                    onClick={() => void refresh()}
                  >
                    <RefreshCw size={18} />
                  </Button>
                </div>
                {active.status === "awaiting_payment" && (
                  <section className="grid grid-cols-[1fr_155px] gap-[18px] rounded-[7px] border border-[#d9e7e9] bg-[#edf4f5] p-[21px] [&_h3]:text-[25px] [&_h3]:font-semibold [&_h3]:tracking-[-.5px] [&>small]:col-span-full [&>small]:text-[8px] [&>small]:leading-[1.9] [&>small]:text-[#819396] mobile:grid-cols-1 mobile:gap-5 mobile:rounded-[11px] mobile:p-[18px] mobile:[&_h3]:text-[30px] mobile:[&_h3]:leading-[1.5] mobile:[&>small]:text-xs mobile:[&>small]:leading-[1.8]">
                    <div className="[&>p:not(:first-child)]:my-[11px] [&>p:not(:first-child)]:text-[10px] [&>p:not(:first-child)]:leading-[1.8] [&>p:not(:first-child)]:text-muted mobile:[&>p:not(:first-child)]:text-[13px]">
                      <p className="mb-2.5 text-[9px] font-semibold tracking-[2px] text-blue uppercase mobile:mb-2 mobile:text-[10px] mobile:tracking-[1.4px]">
                        Chuyển khoản cho tiệm
                      </p>
                      <h3>{money(active.quote.total)}</h3>
                      <p>{active.payment?.note || settings.paymentNote}</p>
                      <button
                        className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative grid w-full grid-cols-[1fr_auto] gap-1.5 rounded border border-dashed border-[#9ebfc5] bg-white p-2.5 text-left [&_span]:text-[10px] [&_span]:select-all [&_span]:[overflow-wrap:anywhere] [&_small]:text-[8px] [&_small]:text-blue active:scale-[.96] active:border-blue active:bg-[#edf4f5] mobile:min-h-[68px] mobile:gap-[7px] mobile:rounded-lg mobile:p-[13px] mobile:[&_span]:text-[13px] mobile:[&_small]:text-xs"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(active.code);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          } catch {
                            setError(
                              "Bạn có thể chọn và sao chép mã đơn bên dưới.",
                            );
                          }
                        }}
                      >
                        <span>{active.code}</span>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <small>
                          {copied ? "Đã sao chép" : "Sao chép nội dung"}
                        </small>
                      </button>
                      <p className="text-[9px]! mobile:text-xs!">
                        Gửi bill trước {formatClock(active.expiresAt)} để giữ
                        món.
                      </p>
                    </div>
                    {(active.payment?.qrImage || settings.qrImage) && (
                      <a
                        href={active.payment?.qrImage || settings.qrImage}
                        download="qr-tiem-sua.png"
                        className="self-start rounded-[5px] border border-line bg-white p-2 text-center [&_img]:max-h-[190px] [&_img]:w-full [&_img]:object-contain [&_span]:mt-[7px] [&_span]:block [&_span]:text-[8px] [&_span]:text-muted mobile:w-[min(100%,240px)] mobile:justify-self-center mobile:rounded-[10px] mobile:p-2.5 mobile:[&_img]:max-h-[290px] mobile:[&_span]:mt-2.5 mobile:[&_span]:text-xs mobile:[&_span]:leading-[1.5]"
                      >
                        <img
                          src={active.payment?.qrImage || settings.qrImage}
                          alt="Mã QR chuyển khoản do tiệm cung cấp"
                        />
                        <span>Chạm để lưu QR</span>
                      </a>
                    )}

                    <small>
                      Ảnh tối đa 3 MB. Tiệm sẽ kiểm tra bill trước khi xác nhận
                      đã thanh toán. Nếu đã chuyển khoản mà đơn hết hạn, hãy
                      liên hệ tiệm và cung cấp mã đơn.
                    </small>
                  </section>
                )}
                {active.paymentMethod === "cod" &&
                  active.status === "preparing" && (
                    <section className="grid grid-cols-[1fr_155px] gap-[18px] rounded-[7px] border border-[#d9e7e9] bg-[#edf4f5] p-[21px] [&_h3]:text-[25px] [&_h3]:font-semibold [&_h3]:tracking-[-.5px] [&>small]:col-span-full [&>small]:text-[8px] [&>small]:leading-[1.9] [&>small]:text-[#819396] mobile:grid-cols-1 mobile:gap-5 mobile:rounded-[11px] mobile:p-[18px] mobile:[&_h3]:text-[30px] mobile:[&_h3]:leading-[1.5] mobile:[&>small]:text-xs mobile:[&>small]:leading-[1.8] grid-cols-1! border-[#cde6cc]! bg-[#f2f8f2]! [&_p:first-child]:text-[#2e7d32] [&_h3]:text-[#1e5a22]">
                      <div className="[&>p:not(:first-child)]:my-[11px] [&>p:not(:first-child)]:text-[10px] [&>p:not(:first-child)]:leading-[1.8] [&>p:not(:first-child)]:text-muted mobile:[&>p:not(:first-child)]:text-[13px]">
                        <p className="mb-2.5 text-[9px] font-semibold tracking-[2px] text-blue uppercase mobile:mb-2 mobile:text-[10px] mobile:tracking-[1.4px]">
                          Thanh toán khi nhận hàng (COD)
                        </p>
                        <h3>{money(active.quote.total)}</h3>
                        <p>
                          Tiệm đã nhận đơn và đang chuẩn bị món. Vui lòng chuẩn
                          bị đúng số tiền mặt khi shipper giao hàng đến nhé.
                        </p>
                      </div>
                    </section>
                  )}
                {["cancelled", "expired"].includes(active.status) ? (
                  <div className="my-3.5 flex items-start gap-2.5 rounded-[5px] px-[17px] py-[15px] text-[11px] leading-[1.8] [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_button]:ml-auto [&_button]:p-0 [&_button]:text-[10px] [&_button]:font-semibold [&_button]:whitespace-nowrap [&_button]:underline mobile:p-3.5 mobile:text-[13px] mobile:leading-[1.75] mobile:[&_button]:h-10 mobile:[&_button]:min-h-10 mobile:[&_button]:text-xs bg-[#fbede8] text-[#9f4a3b]">
                    <XCircle size={22} />
                    <div>
                      <strong>{statusLabels[active.status]}</strong>
                      <p>{active.events.at(-1)?.note}</p>
                    </div>
                  </div>
                ) : (
                  <ol className="my-6 list-none p-0 [&_li]:relative [&_li]:flex [&_li]:min-h-[54px] [&_li]:items-start [&_li]:gap-3 [&_li]:pb-[15px] [&_li]:text-[#95a4a7] [&_li:not(:last-child)]:before:absolute [&_li:not(:last-child)]:before:top-[29px] [&_li:not(:last-child)]:before:bottom-0 [&_li:not(:last-child)]:before:left-4 [&_li:not(:last-child)]:before:w-px [&_li:not(:last-child)]:before:bg-line [&_li:not(:last-child)]:before:content-[''] [&_li>div]:pt-2 [&_strong]:block [&_strong]:text-[11px] [&_strong]:font-normal [&_li>div>span]:mt-[5px] [&_li>div>span]:block [&_li>div>span]:text-[9px] [&_li>div>span]:leading-[1.8] [&_li>div>span]:text-[#869599] mobile:mt-7 mobile:mb-4 mobile:[&_li]:min-h-[62px] mobile:[&_li]:gap-3.5 mobile:[&_li]:pb-[18px] mobile:[&_li:not(:last-child)]:before:top-[33px] mobile:[&_li:not(:last-child)]:before:left-[18px] mobile:[&_strong]:text-sm mobile:[&_strong]:leading-[1.5] mobile:[&_li>div>span]:text-xs">
                    {(active.paymentMethod === "cod"
                      ? codFlow
                      : transferFlow
                    ).map((status, index) => {
                      const currentFlow =
                        active.paymentMethod === "cod" ? codFlow : transferFlow;
                      const currentIcons =
                        active.paymentMethod === "cod"
                          ? codIcons
                          : transferIcons;
                      const Icon = currentIcons[index];
                      const current = currentFlow.indexOf(active.status);
                      const event = active.events.find(
                        (e) => e.status === status,
                      );
                      return (
                        <li
                          key={status}
                          className={
                            index < current
                              ? "text-blue! [&>span]:border-[#c7dcdf] [&>span]:bg-[#e5f0f0] [&>span]:text-blue"
                              : index === current
                                ? "text-ink! [&>span]:border-blue [&>span]:bg-blue [&>span]:text-white [&>span]:shadow-[0_0_0_4px_#e7f0f1] [&_strong]:font-semibold!"
                                : ""
                          }
                        >
                          <span className="z-1 grid size-[33px] shrink-0 place-items-center rounded-full border border-[#e0e6e1] bg-[#edf0ed] mobile:size-9">
                            {index < current ? (
                              <Check size={16} />
                            ) : (
                              <Icon size={17} />
                            )}
                          </span>
                          <div>
                            <strong>{statusLabels[status]}</strong>
                            {event && (
                              <span>
                                {formatClock(event.at)} ·{" "}
                                {event.note || "Tiệm đã cập nhật đơn."}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
                {active.status === "payment_review" && (
                  <div className="my-3.5 flex items-start gap-2.5 rounded-[5px] px-[17px] py-[15px] text-[11px] leading-[1.8] [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_button]:ml-auto [&_button]:p-0 [&_button]:text-[10px] [&_button]:font-semibold [&_button]:whitespace-nowrap [&_button]:underline mobile:p-3.5 mobile:text-[13px] mobile:leading-[1.75] mobile:[&_button]:h-10 mobile:[&_button]:min-h-10 mobile:[&_button]:text-xs bg-[#edf3ea] text-[#587b55]">
                    <CheckCircle2 size={22} />
                    <div>
                      <strong>Đã nhận bill chuyển khoản</strong>
                      <p>
                        Tiệm đang kiểm tra. Trạng thái sẽ tự cập nhật ở đây.
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-[27px] [&_h3]:mb-[18px] [&_h3]:font-serif [&_h3]:text-2xl [&>div]:my-[13px] [&>div]:flex [&>div]:items-start [&>div]:justify-between [&>div]:gap-[15px] [&>div]:text-[11px] [&_small]:mt-[5px] [&_small]:block [&_small]:text-[9px] [&_small]:text-muted [&_b]:font-semibold [&>p]:mt-[22px] [&>p]:border-t [&>p]:border-line [&>p]:pt-[15px] [&>p]:text-[10px] [&>p]:leading-[2] [&>p]:text-muted mobile:[&_h3]:text-[27px] mobile:[&>div]:my-4 mobile:[&>div]:text-sm mobile:[&>div]:leading-[1.7] mobile:[&_small]:text-xs mobile:[&_small]:leading-[1.7] mobile:[&>p]:text-[13px] mobile:[&>p]:leading-[1.9]">
                  <h3>Món ngon của bạn</h3>
                  {active.quote.lines.map((l) => (
                    <div key={l.key}>
                      <span>
                        {l.quantity} × {l.name}
                        <small>
                          {l.toppings.map((t) => t.name).join(", ")}
                        </small>
                      </span>
                      <b>{money(l.total)}</b>
                    </div>
                  ))}
                  <div>
                    <span>Phí giao hàng</span>
                    <span>{money(active.quote.deliveryFee)}</span>
                  </div>
                  <div>
                    <span>Thanh toán</span>
                    <b>
                      {paymentMethodLabels[active.paymentMethod] ||
                        (active.paymentMethod === "cod"
                          ? "Thanh toán khi nhận hàng (COD)"
                          : "Chuyển khoản (QR)")}
                    </b>
                  </div>
                  <div className="mt-[18px] border-t border-line pt-[18px] text-[15px]! [&_strong]:text-[19px] [&_strong]:text-blue">
                    <strong>Tổng thanh toán</strong>
                    <strong>{money(active.quote.total)}</strong>
                  </div>
                  <p>
                    <b>{active.customer.name}</b> · {active.customer.phone}
                    <br />
                    {active.customer.address}
                    {active.customer.note && (
                      <>
                        <br />
                        Ghi chú: {active.customer.note}
                      </>
                    )}
                  </p>
                </div>
              </>
            )}
          </>
        )}
        {error && (!detailReady || active?.status !== "awaiting_payment") && (
          <div
            className="my-3.5 flex items-start gap-2.5 rounded-[5px] px-[17px] py-[15px] text-[11px] leading-[1.8] [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_button]:ml-auto [&_button]:p-0 [&_button]:text-[10px] [&_button]:font-semibold [&_button]:whitespace-nowrap [&_button]:underline mobile:p-3.5 mobile:text-[13px] mobile:leading-[1.75] mobile:[&_button]:h-10 mobile:[&_button]:min-h-10 mobile:[&_button]:text-xs bg-[#fbede8] text-[#9f4a3b]"
            role="alert"
          >
            {error}
            <button
              className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-10 px-3 rounded-lg font-medium text-xs border border-line bg-white hover:bg-blue-light"
              onClick={() => void refresh()}
            >
              Tải lại đơn
            </button>
          </div>
        )}
        <p className="mt-6 text-center text-[9px] leading-[1.9] text-[#92a0a3] mobile:text-xs mobile:leading-[1.8]">
          Đơn tự cập nhật mỗi 10 giây. Giữ trình duyệt này để theo dõi đơn; số
          điện thoại không dùng làm mật khẩu tra cứu.
        </p>
      </div>
    </Modal>
  );
}
