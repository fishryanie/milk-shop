"use client";
import { Button } from "./button";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
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
} from "lucide-react";
import { api, readSaved, saveLocal } from "@/lib/client";
import {
  cartKey,
  defaultSettings,
  money,
  type CartLine,
  type Quote,
  type ShopOrder,
  type ShopProduct,
  type ShopSettings,
} from "@/shared/commerce/types";
import { ProductImage } from "./product-image";
import { storefrontImage } from "@/lib/storefront-image";
import introStyles from "./storefront-intro.module.css";
import { DeliveryPolicy } from "./delivery-policy";
import { FloatingFooter } from "./floating-footer";
import { FeedbackToast } from "./feedback-toast";
import { animateCartAddition } from "@/lib/cart-motion";

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
const ProductSheet = dynamic(
  () => import("./product-sheet").then((m) => m.ProductSheet),
  { loading: SheetLoading },
);
const CartSheet = dynamic(
  () => import("./cart-sheet").then((m) => m.CartSheet),
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
      settings: defaultSettings,
    },
  );
  const [loading, setLoading] = useState(!initialCatalog);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    cart,
    (_current, next: CartLine[]) => next,
  );
  const [, startCartTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);
  const [tourSeen, setTourSeen] = useState(true);
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const [modal, setModal] = useState<
    "cart" | "checkout" | "orders" | "tour" | null
  >(null);
  const [newOrder, setNewOrder] = useState<ShopOrder | undefined>();
  const [orderCount, setOrderCount] = useState(0);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const toastSequence = useRef(0);
  const [editingLine, setEditingLine] = useState<CartLine | undefined>();
  const quoteSeq = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const refreshCatalog = useCallback(async () => {
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
    void refreshCatalog();
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
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refreshCatalog();
    }, 45000);
    const focus = () => {
      if (document.visibilityState === "visible") void refreshCatalog();
    };
    document.addEventListener("visibilitychange", focus);
    return () => {
      clearInterval(interval);
      clearTimeout(toastTimer.current);
      document.removeEventListener("visibilitychange", focus);
    };
  }, [refreshCatalog]);
  useEffect(() => {
    if (modal === "orders" || modal === "checkout") return;
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
  }, [modal]);
  useEffect(() => {
    if (hydrated) saveLocal("milk-cart", cart);
  }, [cart, hydrated]);
  useEffect(() => {
    setTourSeen(readSaved<boolean>("milk-tour-seen", false));
  }, []);
  const refreshQuote = useCallback(async () => {
    const sequence = ++quoteSeq.current;
    if (!cart.length) {
      setQuote(null);
      setQuoting(false);
      return;
    }
    setQuoting(true);
    try {
      const data = await api<Quote>("/api/cart", {
        method: "POST",
        body: JSON.stringify(cart),
      });
      if (quoteSeq.current === sequence) {
        setQuote(data);
        setQuoteError("");
      }
    } catch (err) {
      if (quoteSeq.current === sequence)
        setQuoteError(
          err instanceof Error ? err.message : "Chưa kiểm tra được giỏ hàng.",
        );
    } finally {
      if (quoteSeq.current === sequence) setQuoting(false);
    }
  }, [cart]);
  useEffect(() => {
    if (modal !== "cart" && modal !== "checkout") return;
    void refreshQuote();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refreshQuote();
    }, 15000);
    const focus = () => {
      if (document.visibilityState === "visible") void refreshQuote();
    };
    document.addEventListener("visibilitychange", focus);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", focus);
      quoteSeq.current++;
    };
  }, [modal, refreshQuote]);
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
    for (const line of optimisticCart) {
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
  }, [optimisticCart, products]);
  function notify(message: string) {
    setToast({ message, id: ++toastSequence.current });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }
  function updateCart(next: CartLine[]) {
    if (!next.length) setQuote(null);
    setQuoteError("");
    startCartTransition(() => {
      setOptimisticCart(next);
      setCart(next);
    });
  }
  function add(line: CartLine, origin: DOMRect) {
    if (editingLine) {
      const next = optimisticCart.filter(
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
    const old = optimisticCart.find((l) => cartKey(l) === cartKey(line));
    if (old && old.quantity + line.quantity > 30) {
      notify("Mỗi loại món và topping tối đa 30 phần.");
      return false;
    }
    updateCart(
      old
        ? optimisticCart.map((l) =>
            cartKey(l) === cartKey(line)
              ? { ...l, quantity: l.quantity + line.quantity }
              : l,
          )
        : [...optimisticCart, line],
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
      <div className="flex h-8 items-center justify-between bg-[#deedf0] px-[max(5.5vw,24px)] text-[10px] tracking-[.5px] text-[#3d6b77] [&>span:last-child]:flex [&>span:last-child]:items-center [&>span:last-child]:gap-[7px] mobile:h-[calc(27px+env(safe-area-inset-top,0px))] mobile:justify-center mobile:pt-[env(safe-area-inset-top,0px)] mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:tracking-[.1px] mobile:[&>span:last-child]:hidden">
        <span>Một chút ngọt lành, giao đến tận tay.</span>
        <span>
          <Heart size={12} /> Từ căn bếp nhỏ của tiệm
        </span>
      </div>
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-8 border-b border-line bg-paper/95 px-[5.5vw] backdrop-blur-[18px] [&_nav]:flex [&_nav]:items-center [&_nav]:gap-[31px] [&_nav]:text-xs [&_nav_a]:flex [&_nav_a]:min-h-11 [&_nav_a]:items-center [&_nav_a]:gap-1.5 [&_nav_button]:min-h-11 [&_nav_button]:p-0 wide:px-[max(5.5vw,calc((100vw-1280px)/2))] tablet:[&_nav]:gap-[23px] mobile:top-[env(safe-area-inset-top,0px)] mobile:h-15 mobile:gap-3 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:[&_nav]:hidden">
        <div className="flex shrink-0 items-center gap-2 mobile:min-w-0 mobile:flex-1 mobile:gap-[9px]">
          <a
            href="#"
            className="flex shrink-0 items-center"
            aria-label={`${settings.name} — Trang chủ`}
          >
            <span className="relative grid size-[43px] place-items-center rounded-full border border-[#9ebec5] text-blue hover:border-blue transition-colors [&_i]:absolute [&_i]:top-[7px] [&_i]:right-[5px] [&_i]:size-[5px] [&_i]:rounded-full [&_i]:bg-blue mobile:size-[38px] mobile:shrink-0 tiny:size-[34px]">
              <Droplet size={28} strokeWidth={1.35} />
              <i />
            </span>
          </a>
          <div className="min-w-0 flex flex-col justify-center">
            <a
              href="#"
              className="font-serif text-[27px] leading-[1.15] tracking-[-1px] text-ink hover:text-blue transition-colors mobile:truncate mobile:text-[22px] tiny:text-[19px]"
            >
              {settings.name}
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/addr mt-0.5 inline-flex max-w-[340px] items-center gap-1 text-[11px] font-normal tracking-normal text-muted hover:text-blue transition-colors mobile:max-w-[210px] mobile:text-[10px] tiny:max-w-[155px]"
              title="Mở Google Maps: 748/30 Thống Nhất, An Hội Đông, Hồ Chí Minh"
            >
              <MapPin
                size={11}
                className="shrink-0 text-blue group-hover/addr:scale-110 transition-transform"
              />
              <span className="truncate">{address}</span>
            </a>
          </div>
        </div>
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
            className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-10 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink rounded-lg"
            onClick={() => {
              setNewOrder(undefined);
              setModal("orders");
            }}
          >
            Đơn của tôi <ArrowUpRight size={15} />
          </button>
          <button
            className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px inline-flex h-10 min-h-10 items-center px-2.5 text-muted tablet:hidden!"
            onClick={() => setModal("tour")}
          >
            Ghé tiệm lần đầu?
          </button>
        </nav>
        <button
          className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative flex h-10 min-h-10 items-center gap-2.5 rounded-lg border border-[#bdcfd3] px-3 text-xs font-semibold hover:border-blue/50 [&_b]:grid [&_b]:h-5 [&_b]:min-w-5 [&_b]:place-items-center [&_b]:rounded-full [&_b]:bg-blue [&_b]:text-[10px] [&_b]:text-white enabled:active:scale-[.96] enabled:active:translate-y-px enabled:active:border-blue enabled:active:bg-blue-light mobile:min-w-[52px] mobile:shrink-0 mobile:gap-1.5 mobile:px-2.5 mobile:[&>span]:hidden mobile:[&_b]:text-[11px]"
          onClick={() => setModal("cart")}
          data-cart-target
          aria-label={`Mở giỏ hàng, ${count} món`}
        >
          <ShoppingBag size={19} />
          <span>Giỏ hàng</span>
          <b key={count} className="cart-count">{count}</b>
        </button>
      </header>
      <main>
        <section className={`${introStyles.intro} mx-auto grid max-w-[1440px] grid-cols-2 items-center gap-[45px] px-[5.5vw] pt-[58px] pb-[54px] [&_h1]:max-w-[550px] [&_h1]:font-serif [&_h1]:text-[clamp(43px,4.8vw,69px)] [&_h1]:leading-[1.16] [&_h1]:font-normal [&_h1]:tracking-[-2.2px] [&_em]:inline [&_em]:font-normal [&_em]:text-blue [&_em]:not-italic tablet:gap-[30px] tablet:pt-10 tablet:[&_h1]:text-[51px] mobile:grid-cols-[minmax(0,1fr)_minmax(105px,.67fr)] mobile:gap-4 mobile:px-3 mobile:pt-[22px] mobile:pb-6 mobile:[&_h1]:text-[clamp(28px,7.5vw,42px)] mobile:[&_h1]:leading-[1.13] mobile:[&_h1]:tracking-[-.9px] tiny:grid-cols-[minmax(0,1fr)_105px] tiny:gap-3 tiny:[&_h1]:text-[27px]`}>
          <div className="pt-1.5 pb-4 [&>p]:mt-6 [&>p]:mb-[26px] [&>p]:max-w-[360px] [&>p]:text-xs [&>p]:leading-[1.95] [&>p]:text-muted mobile:min-w-0 mobile:p-0 mobile:[&>p]:hidden">
            <div className={`${introStyles.status} mb-[25px] flex items-center gap-2 text-[10px] tracking-[.25px] text-[#5d7376] mobile:mb-3 mobile:gap-[7px] mobile:text-[11px] mobile:[&>span:last-child]:hidden`}>
              <span
                className={`size-1.5 rounded-full bg-[#639775] shadow-[0_0_0_3px_#63977512] ${settings.isOpen ? "" : "bg-[#ad795c]!"}`}
              />
              <span>
                {settings.isOpen ? "Tiệm đang nhận đơn" : "Tiệm đang tạm nghỉ"}
              </span>
              <span className="mx-1.5 h-2.5 w-px bg-[#becfd1] mobile:hidden" />
              <span>Nhà làm, mỗi ngày</span>
            </div>
            <h1>
              Hôm nay,
              <br />
              mình uống chút <em>ngọt lành.</em>
            </h1>
            <p>{settings.description}</p>
            <a
              className={`${introStyles.cta} relative inline-flex h-10 min-h-10 items-center justify-center gap-2 overflow-hidden rounded-lg px-4 text-[13px] font-semibold select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 active:translate-y-px active:scale-[.96] mobile:[&>svg]:shrink-0 bg-blue text-white hover:-translate-y-px hover:bg-blue-dark active:translate-y-[1.5px] active:bg-blue-dark active:brightness-[.94] active:shadow-[inset_0_1px_4px_#203d4559] gap-3 px-[18px] mobile:mt-[18px] mobile:gap-2 mobile:px-3.5 mobile:[&_svg]:w-4 mobile:[&_svg]:shrink-0 tiny:px-2.5 tiny:text-[11px]`}
              href="#menu"
            >
              Chọn món bạn thích <ArrowDown size={17} />
            </a>
            <div className="mt-7 flex items-center gap-2.5 text-[9px] leading-[1.9] text-[#71838a] [&_b]:font-normal [&_b]:text-[#4c626a] mobile:hidden">
              <span className="grid size-[31px] place-items-center rounded-full bg-[#f4ede5] text-[#a57753]">
                <Heart size={18} strokeWidth={1.4} />
              </span>
              <span>
                Chẳng cần đăng ký.
                <br />
                <b>Ghé chơi, chọn món, tiệm lo phần còn lại.</b>
              </span>
            </div>
          </div>
          <div className={`${introStyles.visual} relative min-w-0 pr-[13px] tablet:p-0`}>
            <Sparkles className={introStyles.sparkle} strokeWidth={1.1} aria-hidden="true" />
            <img
              {...storefrontImage}
              className="h-[408px] w-full object-contain tablet:h-[360px] mobile:h-[205px] tiny:h-[190px]"
              width={1280}
              height={1170}
              sizes="(max-width: 760px) 50vw, 45vw"
              alt="Sữa tuyết Oreo và bánh flan caramel"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute right-[-5px] bottom-[41px] flex h-[140px] w-[122px] rotate-[7deg] flex-col justify-between bg-[#f4e8cf] px-[13px] py-[18px] text-[#766447] shadow-[0_5px_16px_#604a1c0c] [&_span]:text-[8px] [&_span]:tracking-[2px] [&_span]:uppercase [&_b]:font-serif [&_b]:text-[22px] [&_b]:leading-[1.15] [&_b]:font-normal [&_svg]:self-end tablet:right-[-7px] tablet:h-[125px] tablet:w-[105px] tablet:[&_b]:text-[19px] mobile:hidden">
              <span>tươi ngon</span>
              <b>
                từ những điều
                <br />
                nhỏ xíu.
              </b>
              <Heart size={17} />
            </div>
            <div className={`${introStyles.caption} mt-4 flex items-center justify-center gap-2.5 text-[8px] tracking-[1.2px] text-[#71868b] [&_i]:block [&_i]:h-px [&_i]:w-[27px] [&_i]:bg-[#a7bec4] mobile:mt-2.5 mobile:gap-1.5 mobile:text-[9px] mobile:tracking-[.2px] mobile:[&>span]:hidden mobile:[&_i]:w-[18px]`}>
              <span>MADE WITH A LITTLE LOVE</span>
              <i />
              Cái Tiệm Sữa
            </div>
          </div>
        </section>
        <div className="flex justify-around gap-6 border-y border-line bg-[#f2f7f6] px-[8vw] py-[21px] text-[#607b80] [&>span]:flex [&>span]:items-center [&>span]:gap-2.5 [&>span]:text-[10px] [&_svg]:text-blue mobile:justify-between mobile:gap-3 mobile:px-3 mobile:py-3.5 mobile:[&>span]:gap-1.5 mobile:[&>span]:leading-[1.4] mobile:[&>span:last-child]:hidden mobile:[&_svg]:w-[17px] mobile:[&_svg]:shrink-0 tiny:[&>span]:gap-1 tiny:[&>span]:text-[9px] tiny:[&_svg]:w-[15px]">
          <span>
            <Milk size={20} strokeWidth={1.35} />
            Ngọt dịu, béo thơm
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
                MENU NHÀ TIỆM
              </p>
              <h2 className="font-serif text-[37px] leading-[1.2] font-normal tracking-[-.7px] mobile:text-[31px]">
                Món ngon, bạn chọn.
              </h2>
              <p>Một món quen, hay một chút mới cho hôm nay?</p>
            </div>
            <span className="rotate-[-7deg] pr-1.5 font-serif text-xl text-[#8f9a87] italic tablet:text-lg mobile:hidden">
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
                className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-10 px-3 rounded-lg font-medium text-xs border border-line bg-white hover:bg-blue-light"
                onClick={() => void refreshCatalog()}
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
                  className="animate-skeleton min-w-0 flex flex-col justify-between rounded-xl sm:rounded-3xl border border-[#e6eded] bg-white p-2.5 sm:p-4 shadow-xs"
                  key={n}
                >
                  <div>
                    <div className="aspect-[1.16] w-full rounded-lg sm:rounded-2xl bg-[#e6edeb]" />
                    <div className="mt-2.5 sm:mt-3.5 flex items-center justify-between">
                      <span className="h-3 w-12 sm:w-16 rounded bg-[#e6edeb]" />
                      <span className="h-3 w-10 sm:w-14 rounded-full bg-[#e6edeb]" />
                    </div>
                    <span className="mt-2 block h-4 sm:h-5 w-3/4 rounded bg-[#e6edeb]" />
                    <span className="mt-1.5 block h-3 sm:h-3.5 w-full rounded bg-[#e6edeb]" />
                  </div>
                  <div className="mt-2.5 sm:mt-4 flex items-center justify-between border-t border-[#f0f4f4] pt-2 sm:pt-3">
                    <span className="h-4 sm:h-5 w-14 sm:w-20 rounded bg-[#e6edeb]" />
                    <span className="size-8 sm:size-9 rounded-full bg-[#e6edeb]" />
                  </div>
                </div>
              ))}
            </div>
          ) : !products.length ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-[17px] px-5 py-10 text-center [&_svg]:text-[#8aa5ab] [&_h3]:font-serif [&_h3]:text-[27px] [&_p]:max-w-[350px] [&_p]:text-xs [&_p]:leading-[1.8] [&_p]:text-muted mobile:min-h-[260px] mobile:gap-4 mobile:py-[30px] mobile:[&_h3]:leading-[1.3] mobile:[&_p]:text-sm">
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
                    className="group relative min-w-0 flex flex-col justify-between rounded-xl sm:rounded-2xl border border-[#e8eeee] bg-white p-2.5 sm:p-4 shadow-[0_2px_10px_rgba(32,61,69,0.03)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#287f96]/35 hover:shadow-[0_10px_24px_rgba(40,127,150,0.1)] select-none outline-none [-webkit-tap-highlight-color:transparent]"
                  >
                    {/* Ảnh sản phẩm & Badge */}
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      aria-label={`Xem món ${p.name}`}
                      className="relative aspect-[1.16] w-full overflow-hidden rounded-lg sm:rounded-xl bg-[#f4f7f6] block text-left outline-none focus:outline-none [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation"
                    >
                      <ProductImage
                        product={p}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />

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

                      {/* Lớp phủ khi hết hàng */}
                      {!available && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 p-2 text-center backdrop-blur-[2px]">
                          <span className="rounded-full bg-paper px-2.5 py-1 sm:px-3.5 sm:py-1.5 font-serif text-[11px] sm:text-sm font-medium text-ink shadow-sm border border-line">
                            Hẹn mẻ sau nhé
                          </span>
                        </div>
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
                        {/* Thanh thể loại & Trạng thái còn hàng */}
                        <div className="flex items-center justify-between gap-1 text-[9.5px] sm:text-[11px]">
                          <span className="truncate max-w-[65px] sm:max-w-none rounded bg-[#f0f5f5] px-1.5 py-0.5 font-medium uppercase tracking-wider text-muted text-[8.5px] sm:text-[10px]">
                            {p.category}
                          </span>
                          <span
                            className={`shrink-0 flex items-center gap-1 font-medium ${
                              available ? "text-green" : "text-[#9a8275]"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                available
                                  ? "bg-green animate-pulse"
                                  : "bg-[#9a8275]"
                              }`}
                            />
                            <span>{available ? "Còn hàng" : "Tạm hết"}</span>
                          </span>
                        </div>

                        {/* Tên sản phẩm */}
                        <button
                          type="button"
                          onClick={() => setSelected(p)}
                          className="mt-1.5 block w-full text-left outline-none focus:outline-none [-webkit-tap-highlight-color:transparent] cursor-pointer"
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
                          <div className="mt-1.5 flex items-center gap-1 rounded-md bg-[#eaf3f5] px-1.5 py-0.5 text-[9px] sm:text-[11px] font-medium text-blue w-fit max-w-full">
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
                      <div className="mt-2.5 sm:mt-3.5 flex items-center justify-between gap-1.5 border-t border-[#f0f4f4] pt-2 sm:pt-2.5">
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
                          className="flex size-8 md:h-9 md:w-auto md:px-3 items-center justify-center gap-1 rounded-full bg-blue text-white md:bg-[#eaf3f5] md:text-blue shadow-xs transition-all duration-200 md:group-hover:bg-blue md:group-hover:text-white group-hover:shadow-sm active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 shrink-0 cursor-pointer"
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
          <DeliveryPolicy />
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
                <div className="relative mt-2 w-full max-w-[340px] h-[145px] overflow-hidden rounded-xl border border-line bg-[#eaf0f2] shadow-[0_2px_8px_#203d450a] transition-all hover:border-blue/50 hover:shadow-md">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="145"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ vị trí ${settings.name}`}
                    className="h-full w-full block"
                  />
                </div>
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
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper-light px-3.5 py-2 text-xs font-medium text-ink hover:border-blue/40 hover:text-blue hover:shadow-xs transition-all active:scale-[0.98]"
              >
                <Phone size={14} className="text-blue" />
                <span>
                  Gọi tiệm: <strong>{settings.phone}</strong>
                </span>
              </a>
            ) : null}

            {settings.deliveryNote && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-light/50 p-2.5 text-[11px] text-[#285d6b] leading-snug">
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
              className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-9 px-3 inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-ink hover:bg-paper-light rounded-lg border border-transparent hover:border-line"
              onClick={() => setModal("tour")}
            >
              <HelpCircle size={15} className="text-blue" /> Hướng dẫn đặt hàng
            </button>
            <button
              type="button"
              className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-9 px-3 inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-ink hover:bg-paper-light rounded-lg border border-transparent hover:border-line"
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
          cart={optimisticCart}
          quote={quote}
          loading={quoting}
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
          cart={optimisticCart}
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
            void refreshCatalog();
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
          onRefreshCatalog={() => void refreshCatalog()}
        />
      )}
      {(modal === "tour" || showTour) && <Tour onClose={closeTour} />}
    </>
  );
}
