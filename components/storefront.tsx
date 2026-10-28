"use client";
import { Button } from "./button";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Droplet,
  Heart,
  HelpCircle,
  Leaf,
  MapPin,
  Milk,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  ShoppingCartPlus,
  Snowflake,
} from "lucide-react";
import { api, readSaved, saveLocal } from "@/lib/client";
import {
  cartKey,
  money,
  type CartLine,
  type ShopOrder,
  type ShopProduct,
  type ShopSettings,
} from "@/shared/commerce/types";
import { ProductImage } from "./product-image";
import { storefrontImage, storefrontLogo } from "@/lib/storefront-image";
import introStyles from "./storefront-intro.module.css";
import cardStyles from "./product-card.module.css";
import { DeliveryPolicy } from "./delivery-policy";
import { FloatingFooter } from "./floating-footer";
import { FeedbackToast } from "./feedback-toast";
import { animateCartAddition } from "@/lib/cart-motion";
import { useCartQuote } from "@/lib/use-cart-quote";
import { StoreMap } from "./store-map";
import { productPageLinks, publicFallbackSettings } from "@/lib/site-content";

function SheetLoading() {
  return (
    <div
      role="status"
      className="fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-100 -translate-x-1/2 rounded-lg bg-ink px-5 py-3 text-sm text-white shadow-lg"
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
      setCatalog(data);
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
    if (Array.isArray(saved))
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
    setHydrated(true);
    return () => {
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
    void refreshOrderCount();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshOrderCount();
    };
    const interval = setInterval(refreshWhenVisible, 10000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [orderCountPaused]);
  useEffect(() => {
    if (hydrated) saveLocal("milk-cart", cart);
  }, [cart, hydrated]);
  useEffect(() => {
    setTourSeen(readSaved<boolean>("milk-tour-seen", false));
  }, []);
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
      <div className="flex h-8 items-center justify-between bg-blue-light px-[max(5.5vw,24px)] text-[10px] tracking-[.5px] text-blue-dark [&>span:last-child]:flex [&>span:last-child]:items-center [&>span:last-child]:gap-[7px] mobile:h-[calc(27px+env(safe-area-inset-top,0px))] mobile:justify-center mobile:pt-[env(safe-area-inset-top,0px)] mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:tracking-[.1px] mobile:[&>span:last-child]:hidden">
        <span>Đặt hàng ngay, giao đến tận tay.</span>
        <span>
          <Heart size={12} /> Từ căn bếp nhỏ của tiệm
        </span>
      </div>
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-8 border-b border-line bg-paper/95 px-[5.5vw] backdrop-blur-[18px] [&_nav]:flex [&_nav]:items-center [&_nav]:gap-[31px] [&_nav]:text-xs [&_nav_a]:flex [&_nav_a]:min-h-11 [&_nav_a]:items-center [&_nav_a]:gap-1.5 [&_nav_button]:min-h-11 [&_nav_button]:p-0 wide:px-[max(5.5vw,calc((100vw-1280px)/2))] tablet:[&_nav]:gap-[23px] mobile:top-[env(safe-area-inset-top,0px)] mobile:h-15 mobile:gap-3 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:[&_nav]:hidden">
        <a
          href="#"
          className="block w-[228px] shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue mobile:w-[174px] tiny:w-[156px]"
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
            className="relative text-blue after:absolute after:bottom-px after:left-0 after:h-0.5 after:w-[18px] after:bg-blue after:content-['']"
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
            className="rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-10 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
            onClick={() => {
              setNewOrder(undefined);
              setModal("orders");
            }}
          >
            Đơn của tôi <ArrowUpRight size={15} />
          </button>
          <button
            className="rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px inline-flex h-10 min-h-10 items-center px-2.5 text-muted tablet:hidden!"
            onClick={() => setModal("tour")}
          >
            Ghé tiệm lần đầu?
          </button>
        </nav>
        <button
          className="rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative flex h-10 min-h-10 items-center gap-2.5 border border-blue/25 px-3 text-xs font-semibold hover:border-blue/50 [&_b]:grid [&_b]:h-5 [&_b]:min-w-5 [&_b]:place-items-center [&_b]:rounded-full [&_b]:bg-blue [&_b]:text-[10px] [&_b]:text-white enabled:active:scale-[.96] enabled:active:translate-y-px enabled:active:border-blue enabled:active:bg-blue-light mobile:min-w-[52px] mobile:shrink-0 mobile:gap-1.5 mobile:px-2.5 mobile:[&>span]:hidden mobile:[&_b]:text-[11px]"
          onClick={() => setModal("cart")}
          data-cart-target
          aria-label={`Mở giỏ hàng, ${count} món`}
        >
          <ShoppingBag size={19} />
          <span>Giỏ hàng</span>
          <b key={count} className="cart-count">
            {count}
          </b>
        </button>
      </header>
      <main>
        <section
          className={`${introStyles.intro} mx-auto grid max-w-[1440px] grid-cols-2 items-center gap-[45px] px-[5.5vw] pt-[58px] pb-[54px] [&_h1]:max-w-[550px] [&_h1]:font-serif [&_h1]:text-[clamp(43px,4.8vw,69px)] [&_h1]:leading-[1.16] [&_h1]:font-normal [&_h1]:tracking-[-2.2px] [&_em]:inline [&_em]:font-normal [&_em]:text-blue [&_em]:not-italic tablet:gap-[30px] tablet:pt-10 tablet:[&_h1]:text-[51px] mobile:grid-cols-[minmax(0,1fr)_minmax(105px,.67fr)] mobile:gap-4 mobile:px-3 mobile:pt-[22px] mobile:pb-6 mobile:[&_h1]:text-[clamp(28px,7.5vw,42px)] mobile:[&_h1]:leading-[1.13] mobile:[&_h1]:tracking-[-.9px] tiny:grid-cols-[minmax(0,1fr)_105px] tiny:gap-3 tiny:[&_h1]:text-[27px]`}
        >
          <div className="pt-1.5 pb-4 [&>p]:mt-6 [&>p]:mb-[26px] [&>p]:max-w-[360px] [&>p]:text-xs [&>p]:leading-[1.95] [&>p]:text-muted mobile:min-w-0 mobile:p-0 mobile:[&>p]:hidden">
            <div
              className={`${introStyles.status} mb-[25px] flex items-center gap-2 text-[10px] tracking-[.25px] text-muted mobile:mb-3 mobile:gap-[7px] mobile:text-[11px] mobile:[&>span:last-child]:hidden`}
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
              <span className="sr-only">Cái Tiệm Sữa — Sữa tuyết, sữa tươi và bánh flan. </span>
              Món ngon từ sữa,
              <br />
              tiệm nấu mới <em>mỗi ngày.</em>
            </h1>

            <p>{settings.description}</p>
            <a
              className={`${introStyles.cta} relative inline-flex h-10 min-h-10 items-center justify-center gap-2 overflow-hidden rounded-button px-4 text-[13px] font-semibold select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 active:translate-y-px active:scale-[.96] mobile:[&>svg]:shrink-0 bg-brand text-white hover:-translate-y-px hover:brightness-95 active:translate-y-[1.5px] active:brightness-[.94] active:shadow-[inset_0_1px_4px_#014ba659] gap-3 px-[18px] mobile:mt-[18px] mobile:gap-2 mobile:px-3.5 mobile:[&_svg]:w-4 mobile:[&_svg]:shrink-0 tiny:px-2.5 tiny:text-[11px]`}
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
              Chọn món ngay <ArrowDown size={17} />
            </a>
            <div className="mt-7 flex items-center gap-2.5 text-[9px] leading-[1.9] text-muted [&_b]:font-normal [&_b]:text-ink mobile:hidden">
              <span className="grid size-[31px] place-items-center rounded-full bg-blue-light text-blue">
                <Heart size={18} strokeWidth={1.4} />
              </span>
              <span>
                Chẳng cần đăng ký.
                <br />
                <b>Ghé chơi, chọn món, tiệm lo phần còn lại.</b>
              </span>
            </div>
          </div>
          <div
            className={`${introStyles.visual} relative min-w-0 pr-[13px] tablet:p-0`}
          >
            <Sparkles
              className={introStyles.sparkle}
              strokeWidth={1.1}
              aria-hidden="true"
            />
            <img
              {...storefrontImage}
              className="mx-auto h-[408px] w-full max-w-[447px] object-contain tablet:h-[360px] tablet:max-w-[394px] mobile:h-[205px] mobile:max-w-none tiny:h-[190px]"
              width={1280}
              height={1170}
              alt="Sữa tuyết Oreo và bánh flan caramel"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute right-[-5px] bottom-[41px] flex h-[140px] w-[122px] rotate-[7deg] flex-col justify-between bg-ice px-[13px] py-[18px] text-blue-dark shadow-[0_5px_16px_#014ba614] [&_span]:text-[8px] [&_span]:tracking-[2px] [&_span]:uppercase [&_b]:font-serif [&_b]:text-[22px] [&_b]:leading-[1.15] [&_b]:font-normal [&_svg]:self-end tablet:right-[-7px] tablet:h-[125px] tablet:w-[105px] tablet:[&_b]:text-[19px] mobile:hidden">
              <span>tươi ngon</span>
              <b>
                từ những điều
                <br />
                nhỏ xíu.
              </b>
              <Heart size={17} />
            </div>
            <div
              className={`${introStyles.caption} mt-4 flex items-center justify-center gap-2.5 text-[8px] tracking-[1.2px] text-muted [&_i]:block [&_i]:h-px [&_i]:w-[27px] [&_i]:bg-blue/30 mobile:mt-2.5 mobile:gap-1.5 mobile:text-[9px] mobile:tracking-[.2px] mobile:[&>span]:hidden mobile:[&_i]:w-[18px]`}
            >
              <span>MADE WITH A LITTLE LOVE</span>
              <i />
              Cái Tiệm Sữa
            </div>
          </div>
        </section>
        <div className="flex justify-around gap-6 border-y border-line bg-blue-light/60 px-[8vw] py-[21px] text-muted [&>span]:flex [&>span]:items-center [&>span]:gap-2.5 [&>span]:text-[10px] [&_svg]:text-blue mobile:justify-between mobile:gap-3 mobile:px-3 mobile:py-3.5 mobile:[&>span]:gap-1.5 mobile:[&>span]:leading-[1.4] mobile:[&>span:last-child]:hidden mobile:[&_svg]:w-[17px] mobile:[&_svg]:shrink-0 tiny:[&>span]:gap-1 tiny:[&>span]:text-[9px] tiny:[&_svg]:w-[15px]">
          <span>
            <Milk size={20} strokeWidth={1.35} />
            Ít ngọt, béo thơm
          </span>
          <span>
            <Leaf size={20} strokeWidth={1.35} />
            Làm mới mỗi ngày
          </span>
          <span>
            <Truck size={20} strokeWidth={1.35} />
            Miễn phí giao hàng
          </span>
          <span>
            <Heart size={20} strokeWidth={1.35} />
            Làm bằng cả thương yêu
          </span>
        </div>
        <section
          className="mx-auto max-w-[1440px] px-[5.5vw] pt-[62px] pb-[70px] mobile:overflow-visible mobile:px-3 mobile:pt-[30px] mobile:pb-[38px]"
          id="menu"
        >
          <div className="mb-[30px] flex items-center justify-between [&>div>p:last-child]:mt-[11px] [&>div>p:last-child]:text-[11px] [&>div>p:last-child]:leading-[1.7] [&>div>p:last-child]:text-muted mobile:mb-[18px] mobile:items-start mobile:[&>div>p:last-child]:mt-2.5 mobile:[&>div>p:last-child]:text-xs mobile:[&>div>p:last-child]:leading-[1.6]">
            <div>
              <p className="mb-2.5 text-[9px] font-semibold tracking-[2px] text-blue uppercase mobile:mb-2 mobile:text-[10px] mobile:tracking-[1.4px]">
                MENU TẠI TIỆM
              </p>
              <h2 className="font-serif text-[37px] leading-[1.2] font-normal tracking-[-.7px] mobile:text-[31px]">
                Món ngon, bạn chọn.
              </h2>
              <p>Một món quen, hay một chút mới cho hôm nay?</p>
            </div>
            <span className="rotate-[-7deg] pr-1.5 font-serif text-xl text-blue/70 italic tablet:text-lg mobile:hidden">
              ngon hơn khi có bạn ♡
            </span>
          </div>
          {error && (
            <div
              className="my-3.5 flex items-start gap-2.5 rounded-[5px] px-[17px] py-[15px] text-[11px] leading-[1.8] [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_button]:ml-auto [&_button]:p-0 [&_button]:text-[10px] [&_button]:font-semibold [&_button]:whitespace-nowrap [&_button]:underline mobile:p-3.5 mobile:text-[13px] mobile:leading-[1.75] mobile:[&_button]:h-10 mobile:[&_button]:min-h-10 mobile:[&_button]:text-xs bg-[#fbede8] text-[#9f4a3b]"
              role="alert"
            >
              <span>{error}</span>
              <button
                className="rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-10 px-3 font-medium text-xs border border-line bg-white hover:bg-blue-light"
                onClick={() => void loadCatalog()}
              >
                Thử lại
              </button>
            </div>
          )}
          {loading ? (
            <div
              className="grid grid-cols-3 gap-6 tablet:gap-5 mobile:grid-cols-2 mobile:gap-3 tiny:gap-2.5"
              aria-label="Đang tải thực đơn"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  className={`${cardStyles.card} animate-skeleton min-w-0 flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl p-2.5 sm:p-4`}
                  key={n}
                >
                  <div>
                    <div className="-mx-2.5 -mt-2.5 aspect-square w-[calc(100%+1.25rem)] bg-line/70 sm:-mx-4 sm:-mt-4 sm:w-[calc(100%+2rem)]" />
                    <div className="mt-2.5 sm:mt-3.5 flex items-center justify-between">
                      <span className="h-3 w-12 sm:w-16 rounded bg-line/70" />
                    </div>
                    <span className="mt-2 block h-4 sm:h-5 w-3/4 rounded bg-line/70" />
                    <span className="mt-1.5 block h-3 sm:h-3.5 w-full rounded bg-line/70" />
                  </div>
                  <div className="mt-2.5 sm:mt-4 flex items-center justify-between border-t border-line/60 pt-2 sm:pt-3">
                    <span className="h-4 sm:h-5 w-14 sm:w-20 rounded bg-line/70" />
                    <span className="size-8 sm:size-9 rounded-full bg-line/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : !products.length ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-[17px] px-5 py-10 text-center [&_svg]:text-sky [&_h3]:font-serif [&_h3]:text-[27px] [&_p]:max-w-[350px] [&_p]:text-xs [&_p]:leading-[1.8] [&_p]:text-muted mobile:min-h-[260px] mobile:gap-4 mobile:py-[30px] mobile:[&_h3]:leading-[1.3] mobile:[&_p]:text-sm">
              <Milk size={44} strokeWidth={1} />
              <h3>Tiệm đang chuẩn bị menu mới</h3>
              <p>Bạn ghé lại tiệm một chút nữa nhé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 tablet:gap-5 mobile:grid-cols-2 mobile:gap-2 tiny:gap-2.5">
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
                    className={`${cardStyles.card} group relative min-w-0 flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 select-none outline-none [-webkit-tap-highlight-color:transparent]`}
                  >
                    {/* Ảnh sản phẩm & Badge */}
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      aria-label={`Xem món ${p.name}`}
                      className={`${cardStyles.image} relative -mx-2.5 -mt-2.5 aspect-square w-[calc(100%+1.25rem)] shrink-0 overflow-hidden bg-blue-light/50 block text-left outline-none focus:outline-none [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation sm:-mx-4 sm:-mt-4 sm:w-[calc(100%+2rem)]`}
                    >
                      <ProductImage
                        product={p}
                        eager={index < 2}
                        className="h-full w-full object-cover"
                      />

                      <span className={cardStyles.snow} aria-hidden="true">
                        <svg className={cardStyles.snowcap} viewBox="0 0 400 32" preserveAspectRatio="none" fill="currentColor">
                          <path d="M0 0H400V10C389 6 382 12 374 10C368 9 372 23 364 23C356 23 362 10 351 11C332 14 325 7 308 9C286 12 278 7 262 9C254 10 259 19 252 19C244 19 249 9 238 10C218 12 212 7 194 9C171 12 159 6 139 9C130 10 134 24 126 24C118 24 123 10 112 11C93 13 82 8 64 10C51 12 44 7 33 10C25 13 28 19 21 19C14 18 19 10 11 9C6 9 3 11 0 11Z" />
                        </svg>
                        <svg className={cardStyles.snowbank} viewBox="0 0 400 30" preserveAspectRatio="none" fill="currentColor">
                          <path d="M0 15c14-1 20-9 34-7 15 2 19 10 38 8 20-2 23-7 43-5 19 2 24 10 46 8 21-2 30-6 48-4 25 3 36 7 60 2 20-4 28-8 48-5 19 3 25 5 41 1 17-4 28-4 42 1v16H0Z" />
                        </svg>
                        <Snowflake className={cardStyles.flake} strokeWidth={1.7} />
                        <Snowflake className={`${cardStyles.flake} ${cardStyles.smallFlake}`} strokeWidth={1.6} />
                      </span>

                      {/* Huy hiệu món nổi bật / badge */}
                      {p.badge && (
                        <span
                          className={`absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold tracking-wide shadow-xs backdrop-blur-md ${
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
                        <span className="absolute right-1.5 bottom-1.5 sm:right-2.5 sm:bottom-2.5 z-10 flex items-center gap-1 rounded-full bg-blue px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold text-white shadow-md backdrop-blur-xs animate-fade-in">
                          <Check size={11} strokeWidth={2.5} />
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
                          className="rounded-button block w-full text-left outline-none focus:outline-none [-webkit-tap-highlight-color:transparent] cursor-pointer"
                        >
                          <h3 className="font-serif text-[15px] sm:text-[20px] font-normal leading-[1.25] sm:leading-[1.3] text-ink transition-colors duration-200 group-hover:text-blue line-clamp-1 break-words">
                            {p.name}
                          </h3>
                        </button>

                        {/* Mô tả ngắn */}
                        <p className="mt-1 line-clamp-2 min-h-[30px] sm:min-h-[38px] text-[10.5px] sm:text-xs leading-[1.5] sm:leading-[1.65] text-muted break-words">
                          {p.description}
                        </p>

                        {/* Tag gợi ý tùy chọn size / topping */}
                        {/* {hasOptions && (
                          <div className="mt-1.5 flex items-center gap-1 rounded-md bg-blue-light px-1.5 py-0.5 text-[9px] sm:text-[11px] font-medium text-blue w-fit max-w-full">
                            <Sparkles
                              size={10}
                              className="shrink-0 text-blue"
                            />
                            <span className="truncate">
                              {p.sizes?.length
                                ? "Có size & topping"
                                : "Thêm topping"}
                            </span>
                            <ArrowUpRight
                              size={10}
                              className="shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </div>
                        )} */}
                      </div>

                      {/* Chân card: Giá & Nút chọn món */}
                      <div className="mt-2.5 sm:mt-3.5 flex items-center justify-between gap-1.5 border-t border-line/60 pt-2 sm:pt-2.5">
                        <div className="min-w-0 flex-1">
                          {p.sizes?.length ? (
                            <span className="block text-[8.5px] sm:text-[11px] text-muted leading-tight">
                              Giá từ
                            </span>
                          ) : null}
                          <div className="flex items-baseline gap-0.5 flex-wrap sm:flex-nowrap">
                            <strong className="font-sans text-[14px] sm:text-[18px] font-bold tracking-tight text-ink whitespace-nowrap">
                              {money(minPrice)}
                            </strong>
                            <span className="text-[9.5px] sm:text-xs font-normal text-muted truncate max-w-[50px] sm:max-w-none">
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
                          className="rounded-button flex size-8 md:h-9 md:w-auto md:px-3 items-center justify-center gap-1 bg-brand text-white shadow-xs transition-[transform,box-shadow,filter] duration-200 enabled:hover:brightness-95 group-hover:shadow-sm active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 shrink-0 cursor-pointer"
                        >
                          <ShoppingCartPlus size={13} strokeWidth={2.5} />
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
        <div className="mx-auto max-w-[1440px] px-[5.5vw] mb-[60px] mobile:px-3 mobile:mb-[30px]">
          <DeliveryPolicy title="Tiệm giao đến bạn" headingLevel={2} />
        </div>
      </main>
      <footer
        id="contact"
        className="border-t border-line bg-paper/60 px-[5.5vw] pt-9 pb-11 wide:px-[max(5.5vw,calc((100vw-1280px)/2))] mobile:px-4 mobile:pt-7 mobile:pb-[66px]"
      >
        <div className="mx-auto flex flex-col justify-between gap-8 md:flex-row tablet:gap-6 mobile:flex-col mobile:gap-7">
          {/* Cột 1: Thông tin tiệm & Bản đồ */}
          <div className="flex flex-col items-start max-w-[340px]">
            <a
              className="inline-flex items-center gap-2.5 font-serif text-[26px] text-ink hover:text-blue transition-colors"
              href="#"
            >
              <span>{settings.name}</span>
              <Droplet size={22} className="text-blue" />
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
                  className="group/addr inline-flex items-start gap-1.5 text-xs font-semibold text-blue hover:text-blue transition-colors"
                  title={`Mở Google Maps: ${address}`}
                >
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-blue group-hover/addr:scale-110 transition-transform"
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
                className="inline-flex items-center gap-2 rounded-button border border-line bg-paper-light px-3.5 py-2 text-xs font-medium text-ink hover:border-blue/40 hover:text-blue hover:shadow-xs transition-all active:scale-[0.98]"
              >
                <Phone size={14} className="text-blue" />
                <span>
                  Gọi tiệm: <strong>{settings.phone}</strong>
                </span>
              </a>
            ) : null}

            {settings.deliveryNote && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-light/50 p-2.5 text-[11px] text-blue-dark leading-snug">
                <Truck size={14} className="mt-0.5 shrink-0 text-blue" />
                <span>{settings.deliveryNote}</span>
              </div>
            )}
          </div>

          {/* Cột 3: Hỗ trợ & Theo dõi đơn */}
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="text-[11px] font-semibold tracking-wider text-muted uppercase mb-1 md:self-end">
              Tiện ích
            </span>
            <button
              type="button"
              className="rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-9 px-3 inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-ink hover:bg-paper-light border border-transparent hover:border-line"
              onClick={() => setModal("tour")}
            >
              <HelpCircle size={15} className="text-blue" /> Hướng dẫn đặt hàng
            </button>
            <button
              type="button"
              className="rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-9 px-3 inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-ink hover:bg-paper-light border border-transparent hover:border-line"
              onClick={() => {
                setNewOrder(undefined);
                setModal("orders");
              }}
            >
              <Clock3 size={15} className="text-blue" /> Theo dõi đơn của tôi
            </button>
            <small className="mt-4 text-[11px] text-muted md:text-right">
              © {new Date().getFullYear()} {settings.name}. Mọi quyền được bảo
              lưu.
            </small>
            <nav aria-label="Thông tin về tiệm" className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted">
              {productPageLinks.map((page) => <Link key={page.path} href={page.path} prefetch={false} className="hover:text-blue">{page.label}</Link>)}
              <Link href="/about" prefetch={false} className="hover:text-blue">Giới thiệu & cách đặt hàng</Link>
              <Link href="/contact" prefetch={false} className="hover:text-blue">Liên hệ</Link>
              <Link href="/privacy" prefetch={false} className="hover:text-blue">Quyền riêng tư</Link>
            </nav>
          </div>
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
