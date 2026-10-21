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
  LocateFixed,
  LoaderCircle,
  MapPin,
} from "lucide-react";
import { Modal, useModalMotion } from "./modal";
import { DeliveryPolicy } from "./delivery-policy";
import { DeliveryDetailsForm } from "./delivery-details-form";
import { PaymentMethodForm } from "./payment-method-form";
import { OrderReviewForm, type CheckoutReview } from "./order-review-form";
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
import { requestDeliveryLocation } from "@/lib/delivery-location";
const blank: Customer = {
  name: "",
  phone: "",
  address: "",
  note: "",
  location: null,
};
type CheckoutStep = "customer" | "permission" | "location" | "payment";
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
  const [review, setReview] = useState<CheckoutReview | null>(null);
  const key = useRef("");
  const locationGeneration = useRef(0);
  const locationAbort = useRef<AbortController | null>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!review) return;
    dialogRef.current?.querySelector("[data-modal-scroll]")?.scrollTo({ top: 0 });
    reviewRef.current?.focus();
  }, [review, dialogRef]);
  useEffect(() => {
    if (review) return;
    dialogRef.current?.querySelector("[data-modal-scroll]")?.scrollTo({ top: 0 });
    const intro = dialogRef.current?.querySelector<HTMLElement>("[data-step-intro]");
    intro?.focus();
  }, [step, review, dialogRef]);

  const [error, formAction, isPending] = useActionState(
    async (_prevState: string | null, _formData?: FormData) => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      try {
        if (!review) {
          if (paymentMethod === "bank_transfer" && !settings.qrImage)
            return "Tiệm chưa cấu hình mã QR. Bạn chọn thanh toán khi nhận hàng nhé.";
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
          dismiss(() => setReview({ quote: deliveryQuote, customer, paymentMethod }));
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
      changeStep("payment", () => {
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
    changeStep("location", () => {
      setLocationMode("other");
      setLocationState("Chọn nơi nhận trên bản đồ để shipper tìm đúng địa chỉ và tiệm tính phí ship.");
    });
  }
  function skipLocation() {
    clearLocation();
    changeStep("payment", () => {
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
  function resetReview() {
    setReview(null);
    key.current = newCheckoutKey();
    saveLocal("milk-checkout-key", key.current);
  }
  function backToCustomer() {
    clearLocation();
    changeStep("customer", resetReview);
  }
  function backToPayment() {
    dismiss(resetReview);
  }
  function backToLocation() {
    changeStep(locationMode === "other" ? "location" : "permission", () => {
      resetReview();
      setLocationState("");
    });
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
        <DeliveryPolicy />
        {locationState && <p role="status" aria-live="polite" className="rounded-lg bg-blue-light p-2.5 text-xs leading-5 text-blue landscape:col-span-2">{locationState}</p>}
      </div>
    </Modal>
  );
  if (step === "location") return (
    <Modal
      key="location"
      dialogRef={dialogRef}
      title="Chọn nơi nhận hàng"
      compact
      className="max-w-[480px]! mobile:max-w-full!"
      onClose={() => dismiss()}
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" type="button" onClick={() => {
            clearLocation();
            changeStep("permission", () => setLocationState(""));
          }}><ArrowLeft size={16} /> Quay lại</Button>
          <Button variant="primary" type="button" disabled={!customer.location || locating} onClick={() => changeStep("payment")}>Tiếp tục <ArrowRight size={16} /></Button>
        </div>
      }
    >
      <div className="space-y-3 px-5 py-4 mobile:px-3">
        <p data-step-intro tabIndex={-1} className="break-words text-[13px] leading-6 text-muted">Địa chỉ nhận: {customer.address}</p>
        <DeliveryLocationPicker location={customer.location} onChange={selectDeliveryLocation} />
        {locationState && <p role="status" className="text-xs leading-5 text-muted">{locationState}</p>}
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="text" type="button" onClick={() => void locate()} disabled={locating}><LocateFixed size={15} /> {locating ? "Đang định vị…" : "Dùng vị trí hiện tại"}</Button>
          <Button variant="text" type="button" onClick={skipLocation}>Bỏ qua</Button>
        </div>
      </div>
    </Modal>
  );
  return (
    <Modal
      key={review ? "review" : "payment"}
      dialogRef={dialogRef}
      title={review ? "Xác nhận đơn hàng" : "Phương thức thanh toán"}
      eyebrow={review ? "Bước cuối" : "Bước 3"}
      compact
      className={!review ? "max-w-[480px]! mobile:max-w-full!" : ""}
      onClose={review ? backToPayment : () => dismiss()}
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
          {review && <div className="flex items-center justify-between pb-3.5 text-[13px] [&_strong]:text-xl [&_strong]:text-blue mobile:gap-3 mobile:text-sm mobile:[&_strong]:text-[22px] mobile:[&_strong]:whitespace-nowrap mobile:group-data-[compact=true]/sheet:pb-2.5">
            <span>{review.quote.delivery?.mode === "pending" ? "Tiền món · chưa gồm ship" : "Tổng thanh toán tại tiệm"}</span>
            <strong>{money(currentQuote.total)}</strong>
          </div>}
          <div className={review ? "flex items-center gap-2.5 [&>button[type=submit]]:flex-1 mobile:gap-2 mobile:[&>button]:gap-[7px] mobile:[&>button]:p-3 mobile:[&>button]:text-[13px] mobile:[&>button[type=button]]:min-w-12 tiny:[&>button[type=button]]:gap-0 tiny:[&>button[type=button]]:px-2.5 tiny:[&>button[type=button]]:text-[0px] tiny:[&>button[type=button]_svg]:w-5 tiny:[&>button[type=submit]]:px-[9px] tiny:[&>button[type=submit]]:text-xs" : "grid grid-cols-2 gap-2.5 [&>button]:min-w-0 [&>button]:px-2 tiny:[&>button]:text-xs"}>
            <Button
              variant="secondary"
              type="button"
              onClick={review ? backToPayment : backToLocation}
              disabled={isPending}
            >
              <ArrowLeft size={18} />
              Quay lại
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={formId}
              aria-busy={isPending}
              disabled={isPending || !ready}
            >
              {isPending
                ? review ? "Tiệm đang nhận đơn…" : "Đang tính…"
                : review
                    ? "Xác nhận đặt hàng"
                    : "Tiếp tục"}
              {isPending ? (
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
        <OrderReviewForm
          formId={formId}
          review={review}
          introRef={reviewRef}
          pickupAddress={settings.address}
          busy={isPending}
          action={formAction}
          onEditCustomer={backToCustomer}
          onEditLocation={backToLocation}
          onEditPayment={backToPayment}
          onEditCart={() => dismiss(onBack)}
        />
      ) : <PaymentMethodForm
        formId={formId}
        paymentMethod={paymentMethod}
        transferAvailable={Boolean(settings.qrImage)}
        busy={isPending}
        onChange={setPaymentMethod}
        action={formAction}
      />}
    </Modal>
  );
}
