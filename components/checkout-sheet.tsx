"use client";
import { Button } from "./button";
import dynamic from "next/dynamic";
import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  LocateFixed,
  LoaderCircle,
  MapPin,
  QrCode,
} from "lucide-react";
import { Modal, useModalMotion } from "./modal";
import { DeliveryPolicy } from "./delivery-policy";
import { DeliveryDetailsForm } from "./delivery-details-form";
import {
  api,
  ApiError,
  newCheckoutKey,
  readSaved,
  saveLocal,
} from "@/lib/client";
import {
  money,
  type CartLine,
  type Customer,
  type PaymentMethod,
  type Quote,
  type ShopOrder,
  type ShopSettings,
} from "@/shared/commerce/types";
import { deliveryMessage } from "@/shared/commerce/delivery";
import { requestDeliveryLocation } from "@/lib/delivery-location";
const blank: Customer = {
  name: "",
  phone: "",
  address: "",
  note: "",
  location: null,
};
const distanceFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
type CheckoutStep = "customer" | "permission" | "details";
const DeliveryLocationPicker = dynamic(
  () => import("./delivery-location-picker").then((m) => m.DeliveryLocationPicker),
  { ssr: false, loading: () => <p role="status" className="mb-6 text-sm text-muted">Đang mở bản đồ…</p> },
);
export function CheckoutSheet({
  cart,
  quote,
  settings,
  onBack,
  onClose,
  onSuccess,
  onChanged,
}: {
  cart: CartLine[];
  quote: Quote;
  settings: ShopSettings;
  onBack: () => void;
  onClose: () => void;
  onSuccess: (order: ShopOrder) => void;
  onChanged: () => void;
}) {
  const { dialogRef, dismiss } = useModalMotion(onClose);
  const formId = useId();
  const [customer, setCustomer] = useState<Customer>(blank);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [ready, setReady] = useState(false);
  const [locationState, setLocationState] = useState("");
  const [step, setStep] = useState<CheckoutStep>("customer");
  const [locationMode, setLocationMode] = useState<"current" | "other" | "skipped">("current");
  const acceptedQuote = useRef(quote).current;
  const [locating, setLocating] = useState(false);
  const [review, setReview] = useState<{
    quote: Quote;
    customer: Customer;
    paymentMethod: PaymentMethod;
  } | null>(null);
  const key = useRef("");
  const locationGeneration = useRef(0);
  const locationAbort = useRef<AbortController | null>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!review) return;
    dialogRef.current?.querySelector("[data-modal-scroll]")?.scrollTo({ top: 0 });
    reviewRef.current?.focus();
  }, [review, dialogRef]);
  useEffect(() => {
    if (review) return;
    dialogRef.current?.querySelector("[data-modal-scroll]")?.scrollTo({ top: 0 });
    const intro = step === "details" ? detailsRef.current : dialogRef.current?.querySelector<HTMLElement>("[data-step-intro]");
    intro?.focus();
  }, [step, review, dialogRef]);

  const [error, formAction, isPending] = useActionState(
    async (_prevState: string | null, _formData?: FormData) => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      try {
        if (!review) {
          if (!customer.location && locationMode !== "skipped")
            return locationMode === "other"
              ? "Bạn chọn và xác nhận nơi nhận trên bản đồ để tiệm tính phí ship nhé."
              : "Bạn yêu bật định vị tại nơi nhận hàng để tiệm tính phí ship trước nhé.";
          const deliveryQuote = await api<Quote>("/api/cart", {
            method: "POST",
            body: JSON.stringify({ cart, customer, shippingDeferred: locationMode === "skipped" }),
          });
          if (!deliveryQuote.valid || !deliveryQuote.delivery) {
            dismiss(onChanged);
            return "Giỏ hàng vừa thay đổi. Bạn kiểm tra lại giúp tiệm nhé.";
          }
          setReview({ quote: deliveryQuote, customer, paymentMethod });
          return null;
        }
        const order = await api<ShopOrder>("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            cart,
            customer: review.customer,
            paymentMethod: review.paymentMethod,
            digest: review.quote.digest,
            shippingConfirmed: true,
            shippingDeferred: review.quote.delivery?.mode === "pending",
            idempotencyKey: key.current,
          }),
        });
        saveLocal("milk-checkout-key", "");
        dismiss(() => onSuccess(order));
        return null;
      } catch (err) {
        if (err instanceof ApiError && err.code === "CART_CHANGED")
          dismiss(onChanged);
        return err instanceof Error ? err.message : "Chưa đặt được đơn.";
      }
    },
    null,
  );

  function changeStep(nextStep: CheckoutStep, update?: () => void) {
    const enter = () => {
      update?.();
      setStep(nextStep);
    };
    if (nextStep === step) enter();
    else dismiss(enter);
  }

  async function locate() {
    const generation = ++locationGeneration.current;
    locationAbort.current?.abort();
    const controller = new AbortController();
    locationAbort.current = controller;
    setLocating(true);
    setCustomer((c) => ({ ...c, location: null }));
    setLocationState("Đang lấy vị trí của bạn…");
    try {
      const location = await requestDeliveryLocation({
        isSecureContext: window.isSecureContext,
        geolocation: navigator.geolocation,
        signal: controller.signal,
      });
      if (generation !== locationGeneration.current) return;
      changeStep("details", () => {
        setCustomer((c) => ({ ...c, location }));
        setLocationMode("current");
        setLocationState(`Đã ghim vị trí · độ chính xác khoảng ${Math.round(location.accuracy)} m`);
      });
    } catch (err) {
      if (generation !== locationGeneration.current) return;
      setLocationState(err instanceof Error ? err.message : "Chưa lấy được vị trí. Bạn nhấn thử lại nhé.");
    } finally {
      if (generation === locationGeneration.current) setLocating(false);
    }
  }
  useEffect(() => {
    const saved = readSaved<Customer>("milk-customer", blank);
    setCustomer({ ...blank, ...saved, location: null });
    key.current =
      readSaved<string>("milk-checkout-key", "") || newCheckoutKey();
    saveLocal("milk-checkout-key", key.current);
    setReady(true);
    return () => {
      locationGeneration.current++;
      locationAbort.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (ready) saveLocal("milk-customer", { ...customer, location: null });
  }, [customer, ready]);
  const field = (name: keyof Omit<Customer, "location">, value: string) =>
    setCustomer((c) => ({ ...c, [name]: value }));
  function clearLocation() {
    locationGeneration.current++;
    locationAbort.current?.abort();
    setLocating(false);
    setCustomer((c) => ({ ...c, location: null }));
    setLocationState("Bạn ghim lại vị trí tại nơi nhận hàng để tiệm tính phí ship nhé.");
  }
  function deliverElsewhere() {
    clearLocation();
    changeStep("details", () => {
      setLocationMode("other");
      setLocationState("Chọn nơi nhận trên bản đồ để shipper tìm đúng địa chỉ và tiệm tính phí ship.");
    });
  }
  function skipLocation() {
    clearLocation();
    changeStep("details", () => {
      setLocationMode("skipped");
      setLocationState("Tiệm sẽ giao theo địa chỉ bạn đã nhập và liên hệ xác nhận phí ship sau.");
    });
  }
  const selectDeliveryLocation = useCallback((location: Customer["location"]) => {
    setCustomer((c) => ({ ...c, location }));
    setLocationState(location
      ? "Đã ghim nơi nhận bạn chọn. Tiệm sẽ tính phí ship theo điểm này."
      : "Bạn xác nhận điểm nhận mới trên bản đồ bên dưới nhé.");
  }, []);
  function backToDetails() {
    setReview(null);
    key.current = newCheckoutKey();
    saveLocal("milk-checkout-key", key.current);
  }
  function backToCustomer() {
    clearLocation();
    changeStep("customer", backToDetails);
  }
  const currentQuote = review?.quote ?? acceptedQuote;
  if (step === "customer") return (
    <Modal
      key="customer"
      dialogRef={dialogRef}
      title="Thông tin giao hàng"
      compact
      className="max-w-[480px]! mobile:max-w-full!"
      onClose={() => dismiss()}
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" type="button" onClick={() => dismiss(onBack)}><ArrowLeft size={16} /> Giỏ hàng</Button>
          <Button variant="primary" type="submit" form={formId} disabled={!ready}>Tiếp tục <ArrowRight size={16} /></Button>
        </div>
      }
    >
      <DeliveryDetailsForm formId={formId} customer={customer} onChange={field} onContinue={(details) => {
        changeStep("permission", () => {
          setCustomer({ ...details, location: null });
          setLocationState("");
        });
      }} />
    </Modal>
  );
  if (step === "permission") return (
    <Modal
      key="permission"
      dialogRef={dialogRef}
      title="Cho tiệm xin vị trí nhé!"
      compact
      className="max-w-[480px]! mobile:max-w-full!"
      onClose={() => dismiss()}
      footer={
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_auto] gap-2 [&>button]:min-w-0 [&>button]:gap-1 [&>button]:px-2 [&>button]:whitespace-nowrap [&>button>svg]:shrink-0 mobile:gap-1.5 tiny:[&>button]:px-1 tiny:[&>button]:text-xs">
          <Button variant="primary" type="button" onClick={() => void locate()} disabled={!ready || locating} aria-busy={locating}>
            {locating ? <LoaderCircle size={16} className="animate-spin" /> : <LocateFixed size={16} />}
            {locating ? "Định vị…" : "Cho phép"}
          </Button>
          <Button variant="secondary" type="button" onClick={deliverElsewhere}>
            <MapPin size={16} /> Giao nơi khác
          </Button>
          <Button variant="text" type="button" onClick={skipLocation}>
            Bỏ qua
          </Button>
        </div>
      }
    >
      <div className="space-y-3 px-5 py-4 mobile:px-3 landscape:grid landscape:grid-cols-[.8fr_1.2fr] landscape:items-center landscape:gap-4 landscape:space-y-0 landscape:py-2">
        <div className="flex items-start gap-2.5 text-[13px] leading-[1.7] text-muted">
          <MapPin size={22} className="mt-0.5 shrink-0 text-blue" aria-hidden="true" />
          <p data-step-intro tabIndex={-1}>Chia sẻ vị trí để shipper dễ tìm bạn và tiệm tính đúng phí giao hàng.{" "}
            <button type="button" onClick={backToCustomer} className="cursor-pointer text-blue underline underline-offset-2">Sửa thông tin</button>
          </p>
        </div>
        <DeliveryPolicy compact />
        {locationState && <p role="status" aria-live="polite" className="rounded-lg bg-blue-light p-2.5 text-xs leading-5 text-blue landscape:col-span-2">{locationState}</p>}
      </div>
    </Modal>
  );
  return (
    <Modal
      key="details"
      dialogRef={dialogRef}
      title={review ? "Chuyện ship, tiệm nhắn bạn nè 💙" : "Vị trí & thanh toán"}
      eyebrow={review ? "Bạn đồng ý rồi tiệm mới lên đơn nhé" : locationMode === "skipped" ? "Phí ship tiệm xác nhận sau" : "Kiểm tra trước khi tính phí ship"}
      onClose={review ? backToDetails : () => dismiss()}
      busy={isPending}
      footer={
        <div className="[&>div[role=alert]]:mt-0 [&>div[role=alert]]:mb-3 [&>div[role=alert]]:max-h-[25dvh] [&>div[role=alert]]:overflow-y-auto landscape:[&_small]:hidden mobile:group-data-[compact=true]/sheet:[&_small]:hidden">
          {error && (
            <div
              className="my-3.5 flex items-start gap-2.5 rounded-[5px] px-[17px] py-[15px] text-[11px] leading-[1.8] [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_button]:ml-auto [&_button]:p-0 [&_button]:text-[10px] [&_button]:font-semibold [&_button]:whitespace-nowrap [&_button]:underline mobile:p-3.5 mobile:text-[13px] mobile:leading-[1.75] mobile:[&_button]:h-10 mobile:[&_button]:min-h-10 mobile:[&_button]:text-xs bg-[#fbede8] text-[#9f4a3b]"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="flex items-center justify-between pb-3.5 text-[13px] [&_strong]:text-xl [&_strong]:text-blue mobile:gap-3 mobile:text-sm mobile:[&_strong]:text-[22px] mobile:[&_strong]:whitespace-nowrap mobile:group-data-[compact=true]/sheet:pb-2.5">
            <span>{review?.quote.delivery?.mode === "pending" ? "Tiền món · chưa gồm ship" : review ? "Tổng thanh toán tại tiệm" : "Tiền món · chưa gồm ship"}</span>
            <strong>{money(currentQuote.total)}</strong>
          </div>
          <div className="flex items-center gap-2.5 [&>button[type=submit]]:flex-1 mobile:gap-2 mobile:[&>button]:gap-[7px] mobile:[&>button]:p-3 mobile:[&>button]:text-[13px] mobile:[&>button[type=button]]:min-w-12 tiny:[&>button[type=button]]:gap-0 tiny:[&>button[type=button]]:px-2.5 tiny:[&>button[type=button]]:text-[0px] tiny:[&>button[type=button]_svg]:w-5 tiny:[&>button[type=submit]]:px-[9px] tiny:[&>button[type=submit]]:text-xs">
            <Button
              variant="secondary"
              type="button"
              onClick={review ? backToDetails : backToCustomer}
              disabled={isPending}
            >
              <ArrowLeft size={18} />
              {review ? "Sửa thông tin" : "Thông tin"}
            </Button>
            <Button
              variant="primary"
              type={review || customer.location || locationMode !== "current" ? "submit" : "button"}
              onClick={!review && !customer.location && locationMode === "current" ? () => void locate() : undefined}
              form={formId}
              aria-busy={isPending}
              disabled={isPending || !ready || locating}
            >
              {isPending
                ? review ? "Tiệm đang nhận đơn…" : "Tiệm đang tính ship…"
                : locating
                  ? "Đang lấy vị trí…"
                  : review
                    ? "Đồng ý & đặt hàng"
                    : locationMode === "skipped" ? "Tiếp tục" : customer.location || locationMode === "other" ? "Xem phí giao hàng" : "Cho phép lấy vị trí"}
              {isPending || locating ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
            </Button>
          </div>
        </div>
      }
    >
      {review && review.quote.delivery ? (
        <form id={formId} action={formAction} className="space-y-5 p-7 mobile:p-4">
          <div ref={reviewRef} tabIndex={-1} className="rounded-xl border border-line bg-blue-light p-5">
            <p className="text-base leading-8 text-ink">{deliveryMessage(review.quote.delivery)}</p>
            {review.quote.delivery.mode !== "pending" && <p className="mt-3 text-xs leading-6 text-muted">
              Khoảng cách theo đường chim bay: {distanceFormatter.format(review.quote.delivery.distanceKm)} km.
              {" "}Tiệm tính phí theo khoảng cách thực tế trước khi làm tròn số hiển thị.
            </p>}
          </div>
          <div className="text-sm leading-7 text-muted">
            <p className="font-semibold text-ink">{review.customer.name} · {review.customer.phone}</p>
            <p>{review.customer.address}</p>
            {review.customer.note && <p className="text-xs">Ghi chú: {review.customer.note}</p>}
          </div>
          <ul className="divide-y divide-line text-sm">
            {review.quote.lines.map((line) => (
              <li key={line.key} className="flex justify-between gap-4 py-2">
                <span>{line.quantity} × {line.name}{line.toppings.length ? ` · ${line.toppings.map((t) => t.name).join(", ")}` : ""}</span>
                <span className="shrink-0">{money(line.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-4"><dt>Tiền món</dt><dd>{money(review.quote.subtotal)}</dd></div>
            <div className="flex justify-between gap-4">
              <dt>{review.quote.delivery.mode === "external" ? "Ship ngoài" : "Phí giao hàng"}</dt>
              <dd>{review.quote.delivery.mode === "pending" ? "Tiệm xác nhận sau" : review.quote.delivery.mode === "external" ? "Bạn tự book, trả phí riêng" : review.quote.deliveryFee ? money(review.quote.deliveryFee) : "Tiệm freeship 💙"}</dd>
            </div>
          </dl>
          <p className="text-sm leading-7 text-muted">
            {review.quote.delivery.mode === "pending"
              ? review.paymentMethod === "bank_transfer"
                ? "Sau khi đặt đơn, bạn chuyển khoản tiền món theo mã QR. Phí ship được tiệm xác nhận và thanh toán riêng sau nhé."
                : "Tiệm sẽ liên hệ xác nhận phí ship. Bạn thanh toán tiền món và phí ship khi nhận hàng nhé."
              : review.paymentMethod === "bank_transfer"
              ? "Sau khi bạn đồng ý, tiệm sẽ lên đơn và hiện mã QR cùng tổng tiền cuối để bạn chuyển khoản nhé."
              : "Bạn thanh toán tổng tiền tại tiệm khi nhận món nhé."}
          </p>
          {review.quote.delivery.mode === "external" && (
            <p className="text-sm leading-7 text-ink">Shipper đến lấy tại {settings.address}. Bạn nhớ thống nhất việc thu hộ tiền món với shipper nếu chọn COD nhé.</p>
          )}
        </form>
      ) : <form
        id={formId}
        action={formAction}
        className="space-y-5 p-7 mobile:p-4"
      >
        <p ref={detailsRef} tabIndex={-1} className="text-sm leading-6 text-muted">
          {locationMode === "skipped" ? "Chọn cách thanh toán. Tiệm sẽ liên hệ xác nhận phí ship theo địa chỉ của bạn nhé." : "Kiểm tra vị trí nhận hàng và chọn cách thanh toán nhé."}
        </p>
        <div className="rounded-xl border border-line bg-white p-4 text-sm leading-6 text-muted">
          <p className="font-semibold text-ink">{customer.name} · {customer.phone}</p>
          <p className="break-words">{customer.address}</p>
          {customer.note && <p className="mt-1 break-words text-xs">Ghi chú: {customer.note}</p>}
        </div>
        <div
          className={`mb-[23px] flex items-start gap-3 rounded-md bg-blue-light p-4 text-blue [&>svg]:mt-0.5 [&>svg]:shrink-0 [&_strong]:text-[11px] [&_p]:mt-[5px] [&_p]:text-[10px] [&_p]:leading-[1.8] [&_p]:text-[#788e93] [&_button]:mt-1 [&_button]:text-[10px] mobile:mb-6 mobile:rounded-[10px] mobile:[&_strong]:text-sm mobile:[&_strong]:leading-[1.6] mobile:[&_p]:text-xs ${customer.location ? "bg-[#edf3e9]! text-green!" : ""}`}
        >
          <MapPin size={23} />
          <div>
            <strong>
              {customer.location
                ? locationMode === "other" ? "Đã ghim nơi nhận bạn chọn" : "Đã ghim vị trí hiện tại"
                : locationMode === "skipped" ? "Giao theo địa chỉ đã nhập" : locationMode === "other" ? "Ghim nơi nhận trên bản đồ" : "Ghim vị trí nhận hàng để tính phí ship"}
            </strong>
            <p role="status" aria-live="polite">
              {locationState ||
                "Tiệm chỉ lấy vị trí khi bạn đồng ý. Hãy ghim tại nơi nhận hàng."}
            </p>
            {locationMode === "current" && <>
            <Button
              variant="text"
              type="button"
              onClick={locate}
              disabled={locating || isPending}
            >
              <LocateFixed size={15} />
              {locating
                ? "Đang định vị…"
                : customer.location
                  ? "Lấy lại vị trí"
                  : "Cho phép lấy vị trí"}
            </Button>
            {(locating || customer.location) && (
              <Button
                variant="text"
                type="button"
                onClick={clearLocation}
                disabled={isPending}
                className="ml-3"
              >
                {locating ? "Dừng định vị" : "Bỏ ghim vị trí"}
              </Button>
            )}
            <Button variant="text" type="button" onClick={deliverElsewhere} disabled={isPending} className="ml-3">
              Giao nơi khác
            </Button>
            </>}
            {locationMode === "other" && <Button variant="text" type="button" onClick={() => {
              setLocationMode("current");
              void locate();
            }} disabled={locating || isPending}>
              <LocateFixed size={15} /> Dùng vị trí hiện tại
            </Button>}
            {locationMode === "skipped" && <>
              <Button variant="text" type="button" onClick={() => void locate()} disabled={locating || isPending}>
                <LocateFixed size={15} /> {locating ? "Đang định vị…" : "Chia sẻ vị trí"}
              </Button>
              <Button variant="text" type="button" onClick={deliverElsewhere} disabled={isPending}>
                Chọn trên bản đồ
              </Button>
            </>}
            {customer.location && (
              <p>
                <a
                  href={`https://maps.google.com/?q=${customer.location.lat},${customer.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue underline underline-offset-2"
                >
                  Xem vị trí trên bản đồ
                </a>
                {" · "}Bạn nhớ nhập địa chỉ khớp với điểm nhận đã ghim nhé.
              </p>
            )}
          </div>
        </div>
        {locationMode === "other" && <DeliveryLocationPicker location={customer.location} onChange={selectDeliveryLocation} />}
        <fieldset className="mt-1.5 mb-6">
          <legend className="mb-2.5 block text-[11px] font-semibold text-ink mobile:mb-3 mobile:text-sm">
            Phương thức thanh toán
          </legend>
          <div className="grid grid-cols-2 gap-3 mobile:grid-cols-1 mobile:gap-2.5">
            <button
              type="button"
              aria-pressed={paymentMethod === "cod"}
              className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] group/payment relative flex items-start gap-2.5 rounded-lg border-[1.5px] border-line bg-white px-3.5 py-3 text-left duration-200 enabled:hover:border-[#a9c6cb] enabled:hover:bg-[#f7fafb] enabled:active:scale-[.98] aria-pressed:border-blue aria-pressed:bg-blue-light aria-pressed:shadow-[0_0_0_1px_var(--color-blue)] disabled:bg-[#f4f7f7] disabled:opacity-55 mobile:rounded-[10px] mobile:py-[13px]"
              onClick={() => setPaymentMethod("cod")}
            >
              <div className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-[#b7c7c9] bg-white transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-200 group-aria-pressed/payment:border-blue">
                <span className="size-2 scale-0 rounded-full bg-blue transition-transform duration-200 group-aria-pressed/payment:scale-100" />
              </div>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#eaf5e9] text-[#2e7d32]">
                <Banknote size={20} />
              </div>
              <div className="flex min-w-0 flex-col gap-[3px] [&_strong]:text-xs [&_strong]:leading-[1.3] [&_strong]:font-semibold [&_strong]:text-ink [&_small]:text-[10px] [&_small]:leading-[1.4] [&_small]:text-muted mobile:[&_strong]:text-sm mobile:[&_small]:text-xs">
                <strong>Thanh toán khi nhận hàng (COD)</strong>
                <small>Trả tiền mặt trực tiếp khi shipper giao đến</small>
              </div>
            </button>

            <button
              type="button"
              aria-pressed={paymentMethod === "bank_transfer"}
              className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] group/payment relative flex items-start gap-2.5 rounded-lg border-[1.5px] border-line bg-white px-3.5 py-3 text-left duration-200 enabled:hover:border-[#a9c6cb] enabled:hover:bg-[#f7fafb] enabled:active:scale-[.98] aria-pressed:border-blue aria-pressed:bg-blue-light aria-pressed:shadow-[0_0_0_1px_var(--color-blue)] disabled:bg-[#f4f7f7] disabled:opacity-55 mobile:rounded-[10px] mobile:py-[13px]"
              onClick={() => {
                if (settings.qrImage) setPaymentMethod("bank_transfer");
              }}
              disabled={!settings.qrImage}
            >
              <div className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-[#b7c7c9] bg-white transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-200 group-aria-pressed/payment:border-blue">
                <span className="size-2 scale-0 rounded-full bg-blue transition-transform duration-200 group-aria-pressed/payment:scale-100" />
              </div>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#e3effa] text-blue">
                <QrCode size={20} />
              </div>
              <div className="flex min-w-0 flex-col gap-[3px] [&_strong]:text-xs [&_strong]:leading-[1.3] [&_strong]:font-semibold [&_strong]:text-ink [&_small]:text-[10px] [&_small]:leading-[1.4] [&_small]:text-muted mobile:[&_strong]:text-sm mobile:[&_small]:text-xs">
                <strong>Chuyển khoản ngân hàng (QR)</strong>
                <small>
                  {settings.qrImage
                    ? locationMode === "skipped" ? "QR tiền món hiện sau khi đặt đơn; phí ship xác nhận sau" : "QR hiện sau khi bạn xác nhận phí ship và đặt đơn"
                    : "Tiệm chưa cấu hình mã QR"}
                </small>
              </div>
            </button>
          </div>

          {paymentMethod === "cod" && (
            <div className="mt-3.5 flex animate-fade-in items-start gap-3 rounded-lg border border-[#cce5cb] bg-[#f1f8f0] px-4 py-3.5 text-[#27672a] [&_strong]:mb-1 [&_strong]:block [&_strong]:text-xs [&_strong]:font-semibold [&_p]:m-0 [&_p]:text-[11px] [&_p]:leading-[1.6] [&_p]:text-[#3b5e3c] mobile:rounded-[10px] mobile:p-3.5 mobile:[&_strong]:text-sm mobile:[&_p]:text-xs">
              <Banknote size={22} />
              <div>
                <strong>Thanh toán tiền mặt khi nhận hàng</strong>
                <p>
                  {locationMode === "skipped"
                    ? "Tiệm sẽ liên hệ xác nhận phí ship theo địa chỉ của bạn. Bạn thanh toán tiền món và phí ship khi nhận hàng nhé."
                    : "Tiệm sẽ báo tổng tiền sau khi tính phí ship. Bạn xác nhận rồi tiệm mới nhận đơn nhé!"}
                </p>
              </div>
            </div>
          )}
        </fieldset>
      </form>}
    </Modal>
  );
}
