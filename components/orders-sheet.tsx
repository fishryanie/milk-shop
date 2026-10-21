"use client";
import { Button } from "./button";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Upload,
} from "lucide-react";
import { Modal, useModalMotion } from "./modal";
import { api } from "@/lib/client";
import { OrderCelebration } from "./order-celebration";
import { OrderDetails } from "./order-details";
import {
  money,
  statusLabels,
  formatDate,
  formatClock,
  type ShopOrder,
  type ShopSettings,
} from "@/shared/commerce/types";
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

  async function copyCode() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Bạn có thể chọn và sao chép mã đơn bên dưới.");
    }
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
      compact
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
            <p className="text-xs leading-5 text-muted">
              Đã chuyển khoản? Gửi ảnh bill (JPG, PNG, WebP · tối đa 3 MB).
            </p>
            <label
              className={`relative inline-flex h-10 min-h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue px-4 text-[13px] font-semibold text-white transition-colors hover:bg-blue-dark focus-within:outline-2 focus-within:outline-blue/50 focus-within:outline-offset-2 [&_input]:absolute [&_input]:inset-0 [&_input]:size-full [&_input]:cursor-pointer [&_input]:opacity-0 ${isUploading ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
            >
              <Upload size={18} />
              {isUploading ? "Đang gửi bill…" : "Tôi đã chuyển khoản · Gửi bill"}
              <input
                type="file"
                aria-label="Gửi bill chuyển khoản"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploading}
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        ) : celebrating && detailReady ? (
          <Button variant="primary" className="w-full" disabled={isUploading} onClick={() => dismiss()}>Về thực đơn</Button>
        ) : undefined
      }
    >
      <div className="px-5 py-4 mobile:px-3">
        {initialOrder && celebrating && (
          <OrderCelebration awaitingPayment={active?.status === "awaiting_payment"} />
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
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line/70 bg-white p-4 text-left transition-colors hover:border-blue/35 hover:bg-blue-light/40 active:bg-blue-light"
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
                            {order.quote.delivery?.mode === "pending" && " · chưa gồm ship"}
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
              <OrderDetails
                order={active}
                settings={settings}
                copied={copied}
                onCopy={() => void copyCode()}
                onRefresh={() => void refresh()}
              />
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
        <p className="mt-4 text-xs leading-5 text-muted">
          Đơn tự cập nhật mỗi 10 giây. Bạn giữ trình duyệt này để theo dõi đơn nhé.
        </p>
      </div>
    </Modal>
  );
}
