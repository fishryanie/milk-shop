"use client";

import { StorefrontIcon } from "./storefront-icon";
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
          className="sf-floating-cart"
          onClick={onOpenCart}
        >
          <span className="sf-floating-count">
            <span key={count} className="cart-count inline-block">{count}</span>
          </span>
          <span>
            Xem giỏ hàng<small>Kiểm tra món & đặt hàng</small>
          </span>
          <strong>{money(approximate)}</strong>
          <StorefrontIcon name="arrow-right" size={18} />
        </button>
      )}

      {/* =========================================================
          2. THANH ĐIỀU HƯỚNG NỔI Ở ĐÁY MÀN HÌNH TRÊN MOBILE
          ========================================================= */}
      {!showTour && (
        <nav
          className="sf-mobile-nav"
          aria-label="Điều hướng mua hàng"
        >
          {/* Nút 1: Thực đơn */}
          <a
            href="#menu"
            className="sf-mobile-menu"
          >
            <StorefrontIcon name="milk" size={21} strokeWidth={1.6} />
            <span>Thực đơn</span>
          </a>

          {/* Nút 2: Đơn đã đặt */}
          <button
            className="sf-mobile-orders"
            onClick={onOpenOrders}
            aria-label={`Đơn đã đặt, ${orderCount} đơn đang xử lý`}
          >
            <span className="relative inline-flex">
              <StorefrontIcon name="clock-3" size={21} strokeWidth={1.6} />
              {orderCount > 0 && (
                <span
                  key={orderCount}
                  aria-hidden="true"
                  className="cart-count sf-order-count"
                >
                  {orderCount > 99 ? "99+" : orderCount}
                </span>
              )}
            </span>
            <span>Đơn đã đặt</span>
          </button>

          {/* Nút 3: Giỏ hàng */}
          <button
            className={`sf-mobile-cart ${count ? " text-white! [&>span]:text-[11px]!" : ""}`}
            onClick={onOpenCart}
            aria-label={`Xem giỏ hàng, ${count} món`}
          >
            <span key={count} className="cart-count inline-flex shrink-0 !flex-none"><StorefrontIcon name="shopping-bag" size={20} strokeWidth={1.6} /></span>
            {count ? (
              <span>
                {count} món trong giỏ
                <strong>{money(approximate)}</strong>
              </span>
            ) : (
              <span>Giỏ hàng</span>
            )}
            <StorefrontIcon name="arrow-right" size={18} />
          </button>
        </nav>
      )}
    </>
  );
}
