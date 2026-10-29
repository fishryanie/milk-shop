"use client";
import { Button } from "./button";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StorefrontIcon } from "./storefront-icon";
import { afterPaint, api, readSaved, saveLocal } from "@/lib/client";
import {
  cartKey,
  money,
  type CartLine,
  type ShopOrder,
  type ShopProduct,
  type ShopSettings,
} from "@/shared/commerce/types";
import { ProductImage } from "./product-image";
import { storefrontAvifImage, storefrontImage, storefrontLogo } from "@/lib/storefront-image";
import { DeliveryPolicy } from "./delivery-policy";
import { FloatingFooter } from "./floating-footer";
import { FeedbackToast } from "./feedback-toast";
import { animateCartAddition } from "@/lib/cart-motion";
import { useCartQuote } from "@/lib/use-cart-quote";
import { StoreMap } from "./store-map";
import { productPageLinks, publicFallbackSettings } from "@/lib/site-content";
import { NoScriptOrdering } from "./no-script-ordering";
import { PolicyLinks } from "./policy-links";

function SheetLoading() {
  return (
    <div
      role="status"
      className="sf-sheet-loading"
    >
      Đang mở…
    </div>
  );
}
const CartSheet = dynamic(
  () => import("./cart-sheet").then((m) => m.CartSheet),
  { loading: SheetLoading },
);
const ProductSheet = dynamic(
  () => import("./product-sheet").then((m) => m.ProductSheet),
  { loading: SheetLoading },
);
const CheckoutSheet = dynamic(
  () => import("./checkout-sheet").then((m) => m.CheckoutSheet),
  { loading: SheetLoading },
);
const OrdersSheet = dynamic(
  () => import("./orders-sheet").then((m) => m.OrdersSheet),
  { loading: SheetLoading },
);
const Tour = dynamic(() => import("./tour").then((m) => m.Tour), {
  loading: SheetLoading,
});

export type Catalog = { products: ShopProduct[]; settings: ShopSettings };
export function Storefront({
  initialCatalog,
}: {
  initialCatalog?: Catalog;
} = {}) {
  const [catalog, setCatalog] = useState<Catalog>(
    initialCatalog || {
      products: [],
      settings: publicFallbackSettings,
    },
  );
  const [loading, setLoading] = useState(!initialCatalog);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [tourSeen, setTourSeen] = useState(true);
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const [modal, setModal] = useState<
    "cart" | "checkout" | "orders" | "tour" | null
  >(null);
  const [newOrder, setNewOrder] = useState<ShopOrder | undefined>();
  const [orderCount, setOrderCount] = useState(0);
  const { quote, quoteError, refreshQuote } = useCartQuote(
    cart, catalog.products, catalog.settings, modal === "cart",
  );
  const [toast, setToast] = useState<{ message: string; id: number } | null>(
    null,
  );
  const toastSequence = useRef(0);
  const [editingLine, setEditingLine] = useState<CartLine | undefined>();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const loadCatalog = useCallback(async () => {
    try {
      const data = await api<Catalog>("/api/catalog");
      setCatalog((current) => JSON.stringify(current) === JSON.stringify(data) ? current : data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tiệm chưa kết nối được.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadCatalog();
    const saved = readSaved<CartLine[]>("milk-cart", []);
    if (Array.isArray(saved) && saved.length)
      setCart(
        saved
          .filter(
            (l) =>
              l &&
              /^[a-f0-9]{24}$/.test(l.productId) &&
              Number.isInteger(l.quantity) &&
              l.quantity > 0 &&
              l.quantity <= 30 &&
              Array.isArray(l.toppingIds) &&
              l.toppingIds.every((t) => typeof t === "string") &&
              (l.sizeId === undefined ||
                (typeof l.sizeId === "string" &&
                  /^[a-zA-Z0-9_-]{1,40}$/.test(l.sizeId))),
          )
          .slice(0, 30),
      );
    const cancelStartup = afterPaint(() => {
      setHydrated(true);
      setTourSeen(readSaved<boolean>("milk-tour-seen", false));
    });
    return () => {
      cancelStartup();
      clearTimeout(toastTimer.current);
    };
  }, [loadCatalog]);
  const orderCountPaused = modal === "orders" || modal === "checkout";
  useEffect(() => {
    if (orderCountPaused) return;
    let cancelled = false;
    const refreshOrderCount = async () => {
      try {
        const result = await api<{ activeCount: number }>("/api/orders");
        if (!cancelled) setOrderCount(result.activeCount);
      } catch {
        // Keep the last known count when the connection is unavailable.
      }
    };
    const cancelInitialRefresh = afterPaint(() => void refreshOrderCount());
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshOrderCount();
    };
    const interval = setInterval(refreshWhenVisible, 10000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      cancelled = true;
      cancelInitialRefresh();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [orderCountPaused]);
  useEffect(() => {
    if (hydrated) saveLocal("milk-cart", cart);
  }, [cart, hydrated]);
  const settings = catalog.settings;
  const products = catalog.products;
  const address =
    settings.address || "748/30 Thống Nhất, An Hội Đông, Hồ Chí Minh";
  const mapCoordinates = "10.852523902605594,106.66730207366463";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapCoordinates)}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapCoordinates)}&t=m&z=16&output=embed`;
  const { count, approximate, countsByProduct } = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    const countsByProduct = new Map<string, number>();
    let count = 0;
    let approximate = 0;
    for (const line of cart) {
      const product = byId.get(line.productId);
      count += line.quantity;
      countsByProduct.set(
        line.productId,
        (countsByProduct.get(line.productId) || 0) + line.quantity,
      );
      const base =
        product?.sizes?.find((size) => size.id === line.sizeId)?.price ??
        product?.price ??
        0;
      const toppings =
        product?.toppings.reduce(
          (total, topping) =>
            total + (line.toppingIds.includes(topping.id) ? topping.price : 0),
          0,
        ) || 0;
      approximate += line.quantity * (base + toppings);
    }
    return { count, approximate, countsByProduct };
  }, [cart, products]);
  function notify(message: string) {
    setToast({ message, id: ++toastSequence.current });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }
  function updateCart(next: CartLine[]) {
    setCart(next);
  }
  function add(line: CartLine, origin: DOMRect) {
    if (editingLine) {
      const next = cart.filter(
        (l) => cartKey(l) !== cartKey(editingLine),
      );
      const existing = next.find((l) => cartKey(l) === cartKey(line));
      updateCart(
        existing
          ? next.map((l) =>
              cartKey(l) === cartKey(line)
                ? { ...l, quantity: Math.min(30, l.quantity + line.quantity) }
                : l,
            )
          : [...next, line],
      );
      setEditingLine(undefined);
      notify("Đã cập nhật món trong giỏ");
      return true;
    }
    if (count + line.quantity > 100) {
      notify("Mỗi đơn tối đa 100 món. Bạn chia thành nhiều đơn nhé.");
      return false;
    }
    const old = cart.find((l) => cartKey(l) === cartKey(line));
    if (old && old.quantity + line.quantity > 30) {
      notify("Mỗi loại món và topping tối đa 30 phần.");
      return false;
    }
    updateCart(
      old
        ? cart.map((l) =>
            cartKey(l) === cartKey(line)
              ? { ...l, quantity: l.quantity + line.quantity }
              : l,
          )
        : [...cart, line],
    );
    animateCartAddition(origin, line.quantity);
    notify("Đã thêm vào giỏ hàng");
    return true;
  }
  function closeTour() {
    saveLocal("milk-tour-seen", true);
    setTourSeen(true);
    setModal(null);
  }
  const showTour =
    hydrated && !loading && !error && !modal && !selected && !tourSeen;
  return (
    <>
      <div className="sf-announcement">
        <span>Đặt hàng ngay, giao đến tận tay.</span>
        <span>
          <StorefrontIcon name="heart" size={12} /> Từ căn bếp nhỏ của tiệm
        </span>
      </div>
      <header className="sf-header">
        <a
          href="#"
          className="sf-logo"
          aria-label={`${settings.name} — Trang chủ`}
        >
          <img
            {...storefrontLogo}
            alt={settings.name}
            className="block h-auto w-full"
            loading="eager"
            decoding="async"
          />
        </a>
        <nav aria-label="Điều hướng chính">
          <a
            className="sf-menu-link"
            href="#menu"
          >
            Thực đơn
          </a>
          <a
            className="text-muted hover:text-ink transition-colors"
            href="#contact"
          >
            Liên hệ & Bản đồ
          </a>
          <button
            className="sf-orders-button"
            onClick={() => {
              setNewOrder(undefined);
              setModal("orders");
            }}
          >
            Đơn của tôi <StorefrontIcon name="arrow-up-right" size={15} />
          </button>
          <button
            className="sf-tour-button"
            onClick={() => setModal("tour")}
          >
            Ghé tiệm lần đầu?
          </button>
        </nav>
        <button
          className="sf-cart-button"
          onClick={() => setModal("cart")}
          data-cart-target
          aria-label={`Mở giỏ hàng, ${count} món`}
        >
          <StorefrontIcon name="shopping-bag" size={19} />
          <span>Giỏ hàng</span>
          <b key={count} className="cart-count">
            {count}
          </b>
        </button>
      </header>
      <main>
        <section
          className="sf-intro"
        >
          <div className="sf-intro-copy">
            <div
              className="sf-status"
            >
              <span
                className={`size-1.5 rounded-full bg-[#639775] shadow-[0_0_0_3px_#63977512] ${settings.isOpen ? "" : "bg-[#ad795c]!"}`}
              />
              <span>
                {settings.isOpen ? "Tiệm đang nhận đơn" : "Tiệm đang tạm nghỉ"}
              </span>
              <span className="mx-1.5 h-2.5 w-px bg-line mobile:hidden" />
              <span>Nhà làm, mỗi ngày</span>
            </div>
            <h1>
              <span className="sr-only">Cái Tiệm Sữa — Sữa tuyết Vân Nam, sữa tươi và bánh flan. </span>
              Món ngon từ sữa,
              <br />
              tiệm nấu mới <em>mỗi ngày.</em>
            </h1>

            <p>{settings.description}</p>
            <a
              className="sf-cta"
              href="#menu"
              onClick={(e) => {
                const target = document.getElementById("menu");
                if (!target) return;
                e.preventDefault();

                const rootStyles = window.getComputedStyle(document.documentElement);
                const targetStyles = window.getComputedStyle(target);

                const scrollPt = parseFloat(rootStyles.scrollPaddingTop) || 0;
                const scrollMt = parseFloat(targetStyles.scrollMarginTop) || 0;

                // Cuộn thêm 20px nữa so với vị trí scroll thông thường của #menu
                const targetTop =
                  target.getBoundingClientRect().top +
                  window.scrollY -
                  scrollPt -
                  scrollMt +
                  50;

                const prefersReducedMotion = window.matchMedia(
                  "(prefers-reduced-motion: reduce)"
                ).matches;

                window.scrollTo({
                  top: Math.max(0, targetTop),
                  behavior: prefersReducedMotion ? "auto" : "smooth",
                });

                window.history.pushState(null, "", "#menu");
              }}
            >
              Chọn món ngay <StorefrontIcon name="arrow-down" size={17} />
            </a>
            <div className="sf-welcome">
              <span className="grid size-[31px] place-items-center rounded-full bg-blue-light text-blue">
                <StorefrontIcon name="heart" size={18} strokeWidth={1.4} />
              </span>
              <span>
                Chẳng cần đăng ký.
                <br />
                <b>Ghé chơi, chọn món, tiệm lo phần còn lại.</b>
              </span>
            </div>
          </div>
          <div
            className={`sf-intro-visual relative min-w-0 pr-[13px] tablet:p-0`}
          >
            <StorefrontIcon name="sparkles"
              className="sf-intro-sparkle"
              strokeWidth={1.1}
              aria-hidden="true"
            />
            <picture className="contents">
              <source type="image/avif" srcSet={storefrontAvifImage.srcSet} sizes={storefrontAvifImage.sizes} />
              <img
                {...storefrontImage}
                className="sf-hero-image"
                width={1280}
                height={1170}
                alt="Sữa tuyết Oreo và bánh flan caramel"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
              />
            </picture>
            <div className="sf-hero-note">
              <span>tươi ngon</span>
              <b>
                từ những điều
                <br />
                nhỏ xíu.
              </b>
              <StorefrontIcon name="heart" size={17} />
            </div>
            <div
              className="sf-caption"
            >
              <span>MADE WITH A LITTLE LOVE</span>
              <i />
              Cái Tiệm Sữa
            </div>
          </div>
        </section>
        <NoScriptOrdering settings={settings} />
        <div className="sf-benefits">
          <span>
            <StorefrontIcon name="milk" size={20} strokeWidth={1.35} />
            Ít ngọt, béo thơm
          </span>
          <span>
            <StorefrontIcon name="leaf" size={20} strokeWidth={1.35} />
            Làm mới mỗi ngày
          </span>
          <span>
            <StorefrontIcon name="truck" size={20} strokeWidth={1.35} />
            Miễn phí giao hàng
          </span>
          <span>
            <StorefrontIcon name="heart" size={20} strokeWidth={1.35} />
            Làm bằng cả thương yêu
          </span>
        </div>
        <section
          className="sf-menu"
          id="menu"
        >
          <div className="sf-menu-heading">
            <div>
              <p className="sf-eyebrow">
                MENU TẠI TIỆM
              </p>
              <h2 className="sf-menu-title">
                Món ngon, bạn chọn.
              </h2>
              <p>Một món quen, hay một chút mới cho hôm nay?</p>
            </div>
            <span className="sf-menu-note">
              ngon hơn khi có bạn ♡
            </span>
          </div>
          {error && (
            <div
              className="sf-error"
              role="alert"
            >
              <span>{error}</span>
              <button
                className="sf-retry"
                onClick={() => void loadCatalog()}
              >
                Thử lại
              </button>
            </div>
          )}
          {loading ? (
            <div
              className="sf-skeleton-grid"
              aria-label="Đang tải thực đơn"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  className={`sf-card-skin sf-card-skeleton`}
                  key={n}
                >
                  <div>
                    <div className="sf-skeleton-image" />
                    <div className="mt-2.5 sm:mt-3.5 flex items-center justify-between">
                      <span className="h-3 w-12 sm:w-16 rounded bg-line/70" />
                    </div>
                    <span className="mt-2 block h-4 sm:h-5 w-3/4 rounded bg-line/70" />
                    <span className="mt-1.5 block h-3 sm:h-3.5 w-full rounded bg-line/70" />
                  </div>
                  <div className="sf-skeleton-price">
                    <span className="h-4 sm:h-5 w-14 sm:w-20 rounded bg-line/70" />
                    <span className="size-8 sm:size-9 rounded-full bg-line/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : !products.length ? (
            <div className="sf-empty-menu">
              <StorefrontIcon name="milk" size={44} strokeWidth={1} />
              <h3>Tiệm đang chuẩn bị menu mới</h3>
              <p>Bạn ghé lại tiệm một chút nữa nhé.</p>
            </div>
          ) : (
            <div className="sf-product-grid">
              {products.map((p, index) => {
                const available = p.status === "available" && p.stock !== 0;
                const inCart = countsByProduct.get(p.id) || 0;
                const minPrice = p.sizes?.length
                  ? Math.min(...p.sizes.map((s) => s.price))
                  : p.price;
                const hasOptions =
                  (p.sizes && p.sizes.length > 0) ||
                  (p.toppings && p.toppings.length > 0);

                return (
                  <article
                    key={p.id}
                    id={`mon-${p.id}`}
                    className={`sf-card-skin group sf-product-card`}
                  >
                    {/* Ảnh sản phẩm & Badge */}
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      aria-label={`Xem món ${p.name}`}
                      className={`sf-card-image-isolation sf-product-image`}
                    >
                      <ProductImage
                        product={p}
                        eager={index === 0}
                        className="h-full w-full object-cover"
                      />

                      <span className="sf-card-snow" aria-hidden="true">
                        <StorefrontIcon name="snowcap" className="sf-card-snowcap" viewBox="0 0 400 32" preserveAspectRatio="none" fill="currentColor" stroke="none" />
                        <StorefrontIcon name="snowbank" className="sf-card-snowbank" viewBox="0 0 400 30" preserveAspectRatio="none" fill="currentColor" stroke="none" />
                        <StorefrontIcon name="snowflake" className="sf-card-flake" strokeWidth={1.7} />
                        <StorefrontIcon name="snowflake" className={`sf-card-flake sf-card-small-flake`} strokeWidth={1.6} />
                      </span>

                      {/* Huy hiệu món nổi bật / badge */}
                      {p.badge && (
                        <span
                          className={`sf-badge ${
                            [
                              "bg-[#faf6e8]/95 text-[#7d6d42] border border-[#e8dcb8]",
                              "bg-[#edf3e9]/95 text-[#476a4a] border border-[#cfe2cc]",
                              "bg-[#fcf0ea]/95 text-[#9a5441] border border-[#f2d0c2]",
                            ][index % 3]
                          }`}
                        >
                          {p.badge}
                        </span>
                      )}

                      {/* Số lượng đã có trong giỏ hàng */}
                      {inCart > 0 && (
                        <span className="sf-in-cart">
                          <StorefrontIcon name="check" size={11} strokeWidth={2.5} />
                          <span>{inCart}</span>
                          <span className="hidden sm:inline"> trong giỏ</span>
                        </span>
                      )}
                    </button>

                    {/* Thông tin sản phẩm */}
                    <div className="flex flex-1 flex-col justify-between pt-2 sm:pt-3 min-w-0">
                      <div className="min-w-0">
                        {/* Tên sản phẩm */}
                        <button
                          type="button"
                          onClick={() => setSelected(p)}
                          className="sf-product-link"
                        >
                          <h3 className="sf-product-name">
                            {p.name}
                          </h3>
                        </button>

                        {/* Mô tả ngắn */}
                        <p className="sf-product-description">
                          {p.description}
                        </p>

                        {/* Tag gợi ý tùy chọn size / topping */}
                        {/* {hasOptions && (
                          <div className="mt-1.5 flex items-center gap-1 rounded-md bg-blue-light px-1.5 py-0.5 text-[9px] sm:text-[11px] font-medium text-blue w-fit max-w-full">
                            <StorefrontIcon name="sparkles"
                              size={10}
                              className="shrink-0 text-blue"
                            />
                            <span className="truncate">
                              {p.sizes?.length
                                ? "Có size & topping"
                                : "Thêm topping"}
                            </span>
                            <StorefrontIcon name="arrow-up-right"
                              size={10}
                              className="shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </div>
                        )} */}
                      </div>

                      {/* Chân card: Giá & Nút chọn món */}
                      <div className="sf-product-footer">
                        <div className="min-w-0 flex-1">
                          {p.sizes?.length ? (
                            <span className="block text-[8.5px] sm:text-[11px] text-muted leading-tight">
                              Giá từ
                            </span>
                          ) : null}
                          <div className="flex items-baseline gap-0.5 flex-wrap sm:flex-nowrap">
                            <strong className="sf-price">
                              {money(minPrice)}
                            </strong>
                            <span className="sf-unit">
                              /{p.unit}
                            </span>
                          </div>
                        </div>

                        {/* Nút chọn món */}
                        <button
                          type="button"
                          disabled={!available}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(p);
                          }}
                          aria-label={`Chọn ${p.name}`}
                          className="sf-choose"
                        >
                          <StorefrontIcon name="shopping-cart-plus" size={13} strokeWidth={2.5} />
                          <span className="hidden md:inline text-xs font-semibold">
                            Chọn món
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <div className="sf-delivery">
          <DeliveryPolicy title="Tiệm giao đến bạn" headingLevel={2} />
        </div>
      </main>
      <footer
        id="contact"
        className="sf-footer"
      >
        <div className="sf-footer-columns">
          {/* Cột 1: Thông tin tiệm & Bản đồ */}
          <div className="flex flex-col items-start max-w-[340px]">
            <a
              className="sf-footer-brand"
              href="#"
            >
              <span>{settings.name}</span>
              <StorefrontIcon name="droplet" size={22} className="text-blue" />
            </a>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              {settings.tagline}
            </p>
            {address && (
              <div className="mt-2 flex w-full flex-col items-start gap-1">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/addr sf-address"
                  title={`Mở Google Maps: ${address}`}
                >
                  <StorefrontIcon name="map-pin"
                    size={14}
                    className="sf-address-pin"
                  />
                  <span className="leading-snug">{address}</span>
                </a>

                {/* Map nhỏ dưới chữ mở trên google map */}
                <StoreMap src={embedUrl} title={`Bản đồ vị trí ${settings.name}`} />
              </div>
            )}
          </div>

          {/* Cột 2: Liên hệ & Thời gian phục vụ */}
          <div className="flex flex-col items-start gap-3 md:max-w-[280px]">
            <span className="text-[11px] font-semibold tracking-wider text-muted uppercase">
              Liên hệ tiệm
            </span>
            {settings.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className="sf-phone"
              >
                <StorefrontIcon name="phone" size={14} className="text-blue" />
                <span>
                  Gọi tiệm: <strong>{settings.phone}</strong>
                </span>
              </a>
            ) : null}

            {settings.deliveryNote && (
              <div className="sf-delivery-note">
                <StorefrontIcon name="truck" size={14} className="mt-0.5 shrink-0 text-blue" />
                <span>{settings.deliveryNote}</span>
              </div>
            )}
          </div>

          {/* Cột 3: Hỗ trợ & Theo dõi đơn */}
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="sf-utilities-label">
              Tiện ích
            </span>
            <button
              type="button"
              className="sf-utility-button"
              onClick={() => setModal("tour")}
            >
              <StorefrontIcon name="help-circle" size={15} className="text-blue" /> Hướng dẫn đặt hàng
            </button>
            <button
              type="button"
              className="sf-utility-button"
              onClick={() => {
                setNewOrder(undefined);
                setModal("orders");
              }}
            >
              <StorefrontIcon name="clock-3" size={15} className="text-blue" /> Theo dõi đơn của tôi
            </button>
            <small className="mt-4 text-[11px] text-muted md:text-right">
              © {new Date().getFullYear()} {settings.name}. Mọi quyền được bảo
              lưu.
            </small>
            <nav aria-label="Thông tin về tiệm" className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted">
              {productPageLinks.map((page) => <a key={page.path} href={page.path} className="hover:text-blue">{page.label}</a>)}
            </nav>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px]">
          <PolicyLinks />
        </div>
      </footer>
      <FloatingFooter
        count={count}
        orderCount={orderCount}
        approximate={approximate}
        visible={!modal && !selected}
        showTour={showTour}
        onOpenCart={() => setModal("cart")}
        onOpenOrders={() => {
          setNewOrder(undefined);
          setModal("orders");
        }}
      />
      {toast && <FeedbackToast key={toast.id} message={toast.message} />}
      {selected && (
        <ProductSheet
          key={selected.id}
          product={
            catalog.products.find((p) => p.id === selected.id) || selected
          }
          initialLine={editingLine}
          onClose={() => {
            setSelected(null);
            setEditingLine(undefined);
          }}
          onAdd={add}
        />
      )}
      {modal === "cart" && !selected && (
        <CartSheet
          cart={cart}
          quote={quote}
          error={quoteError}
          settings={settings}
          onChange={updateCart}
          onRetry={() => void refreshQuote()}
          onCheckout={() => setModal("checkout")}
          onClose={() => setModal(null)}
          onEdit={(line) => {
            const p = catalog.products.find((p) => p.id === line.productId);
            if (p) {
              setEditingLine(line);
              setSelected(p);
            }
          }}
        />
      )}
      {modal === "checkout" && quote && (
        <CheckoutSheet
          cart={cart}
          quote={quote}
          settings={settings}
          onBack={() => setModal("cart")}
          onClose={() => setModal(null)}
          onChanged={() => {
            setModal("cart");
            void refreshQuote();
          }}
          onSuccess={(order) => {
            updateCart([]);
            setNewOrder(order);
            setOrderCount((current) => current + 1);
            setModal("orders");
          }}
        />
      )}
      {modal === "orders" && (
        <OrdersSheet
          settings={settings}
          initialOrder={newOrder}
          onClose={() => {
            setModal(null);
            setNewOrder(undefined);
          }}
        />
      )}
      {(modal === "tour" || showTour) && <Tour onClose={closeTour} />}
    </>
  );
}
