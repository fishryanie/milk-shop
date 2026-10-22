"use client";

import { ArrowRight, Clock3, Milk, ShoppingBag } from "lucide-react";
import { money } from "@/shared/commerce/types";

export interface FloatingFooterProps {
  count: number;
  orderCount: number;
  approximate: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  visible?: boolean;
  showTour?: boolean;
}

export function FloatingFooter({
  count,
  orderCount,
  approximate,
  onOpenCart,
  onOpenOrders,
  visible = true,
  showTour = false,
}: FloatingFooterProps) {
  if (!visible) return null;

  return (
    <>
      {/* =========================================================
          1. NÚT GIỎ HÀNG NỔI TRÊN MÀN HÌNH LỚN / DESKTOP (Góc phải)
          ========================================================= */}
      {count > 0 && (
        <button
          className="rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] fixed right-6 bottom-1 z-22 flex h-10 min-h-10 animate-slide-in items-center gap-2.5 bg-brand px-3.5 text-white shadow-[0_7px_25px_#014ba62e] [&>span:nth-child(2)]:text-left [&>span:nth-child(2)]:text-xs [&_small]:mt-0.5 [&_small]:block [&_small]:text-[8px] [&_small]:opacity-70 [&_strong]:ml-3 [&_strong]:text-[13px] active:translate-y-0.5 active:scale-95 active:brightness-[.92] active:shadow-[0_4px_15px_#014ba659] mobile:hidden"
          onClick={onOpenCart}
        >
          <span className="grid h-[26px] min-w-[26px] place-items-center rounded-xl bg-white/14 px-1.5 text-[11px] font-bold">
            <span key={count} className="cart-count inline-block">{count}</span>
          </span>
          <span>
            Xem giỏ hàng<small>Kiểm tra món & đặt hàng</small>
          </span>
          <strong>{money(approximate)}</strong>
          <ArrowRight size={18} />
        </button>
      )}

      {/* =========================================================
          2. THANH ĐIỀU HƯỚNG NỔI Ở ĐÁY MÀN HÌNH TRÊN MOBILE
          ========================================================= */}
      {!showTour && (
        <nav
          className="hidden mobile:fixed mobile:inset-x-0 mobile:bottom-0 mobile:z-22 mobile:grid mobile:grid-cols-[58px_64px_minmax(0,1fr)] mobile:items-stretch mobile:gap-2.5 mobile:border-t mobile:border-line mobile:bg-paper/98 mobile:pt-2 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pb-[max(2px,env(safe-area-inset-bottom,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:shadow-[0_-5px_24px_#15345408]"
          aria-label="Điều hướng mua hàng"
        >
          {/* Nút 1: Thực đơn */}
          <a
            href="#menu"
            className="relative overflow-hidden select-none flex h-11 min-h-11 flex-col items-center justify-center gap-0.5 rounded-button p-0 text-[10px] text-muted active:translate-y-px active:scale-90 active:bg-blue-light"
          >
            <Milk size={21} strokeWidth={1.6} />
            <span>Thực đơn</span>
          </a>

          {/* Nút 2: Đơn đã đặt */}
          <button
            className="rounded-button cursor-pointer overflow-visible select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative flex h-11 min-h-11 flex-col items-center justify-center gap-0.5 p-0 text-[10px] text-muted active:translate-y-px active:scale-90 active:bg-blue-light"
            onClick={onOpenOrders}
            aria-label={`Đơn đã đặt, ${orderCount} đơn đang xử lý`}
          >
            <span className="relative inline-flex">
              <Clock3 size={21} strokeWidth={1.6} />
              {orderCount > 0 && (
                <span
                  key={orderCount}
                  aria-hidden="true"
                  className="cart-count absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[9px] font-bold leading-none text-white ring-2 ring-paper"
                >
                  {orderCount > 99 ? "99+" : orderCount}
                </span>
              )}
            </span>
            <span>Đơn đã đặt</span>
          </button>

          {/* Nút 3: Giỏ hàng */}
          <button
            className={`rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px flex h-11 min-h-11 min-w-0 items-center justify-between gap-[9px] px-3 text-left [&>svg]:shrink-0 [&>span]:min-w-0 [&>span]:flex-1 [&>span]:text-[13px] [&>span]:leading-[1.6] [&>span]:font-semibold [&_strong]:block [&_strong]:text-[13px] [&_strong]:leading-[1.2] [&_strong]:font-semibold [&_strong]:whitespace-nowrap active:scale-[.96] active:brightness-[.94] tiny:gap-1.5 tiny:px-[9px] tiny:[&>svg:last-child]:hidden bg-brand text-white ${count ? " text-white! [&>span]:text-[11px]!" : ""}`}
            onClick={onOpenCart}
            aria-label={`Xem giỏ hàng, ${count} món`}
          >
            <span key={count} className="cart-count inline-flex shrink-0 !flex-none"><ShoppingBag size={20} strokeWidth={1.6} /></span>
            {count ? (
              <span>
                {count} món trong giỏ
                <strong>{money(approximate)}</strong>
              </span>
            ) : (
              <span>Giỏ hàng</span>
            )}
            <ArrowRight size={18} />
          </button>
        </nav>
      )}
    </>
  );
}
