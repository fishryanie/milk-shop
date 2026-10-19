"use client";
import { Button } from "./button";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  LocateFixed,
  MapPin,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "./modal";
import { DeliveryPolicy } from "./delivery-policy";
import { api, ApiError, readSaved, saveLocal } from "@/lib/client";
import {
  money,
  type CartLine,
  type Customer,
  type PaymentMethod,
  type Quote,
  type ShopOrder,
  type ShopSettings,
} from "@/shared/commerce/types";
const blank: Customer = {
  name: "",
  phone: "",
  address: "",
  note: "",
  location: null,
};
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
  const formId = useId();
  const [customer, setCustomer] = useState<Customer>(blank);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [ready, setReady] = useState(false);
  const [locationState, setLocationState] = useState("");
  const acceptedQuote = useRef(quote).current;
  const [locating, setLocating] = useState(false);
  const key = useRef("");
  const locationGeneration = useRef(0);

  const [error, formAction, isPending] = useActionState(
    async (_prevState: string | null, _formData?: FormData) => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      try {
        const order = await api<ShopOrder>("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            cart,
            customer,
            paymentMethod,
            digest: acceptedQuote.digest,
            idempotencyKey: key.current,
          }),
        });
        saveLocal("milk-checkout-key", "");
        onSuccess(order);
        return null;
      } catch (err) {
        if (err instanceof ApiError && err.code === "CART_CHANGED") onChanged();
        return err instanceof Error ? err.message : "Chưa đặt được đơn.";
      }
    },
    null,
  );

  useEffect(() => {
    const saved = readSaved<Customer>("milk-customer", blank);
    setCustomer({ ...blank, ...saved, location: null });
    key.current =
      readSaved<string>("milk-checkout-key", "") || crypto.randomUUID();
    saveLocal("milk-checkout-key", key.current);
    setReady(true);
    return () => {
      locationGeneration.current++;
    };
  }, []);
  useEffect(() => {
    if (ready) saveLocal("milk-customer", { ...customer, location: null });
  }, [customer, ready]);
  const field = (name: keyof Omit<Customer, "location">, value: string) =>
    setCustomer((c) => ({ ...c, [name]: value }));
  function locate() {
    if (!navigator.geolocation) {
      setLocationState(
        "Trình duyệt chưa hỗ trợ định vị. Bạn có thể nhập địa chỉ để tiếp tục.",
      );
      return;
    }
    const generation = ++locationGeneration.current;
    setLocating(true);
    setLocationState("Đang lấy vị trí của bạn…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (generation !== locationGeneration.current) return;
        setCustomer((c) => ({
          ...c,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        }));
        setLocationState(
          `Đã ghim vị trí · độ chính xác khoảng ${Math.round(position.coords.accuracy)} m`,
        );
        setLocating(false);
      },
      () => {
        if (generation !== locationGeneration.current) return;
        setLocationState(
          "Chưa lấy được vị trí. Bạn có thể bật quyền trong trình duyệt hoặc nhập địa chỉ đầy đủ để tiếp tục.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }
  return (
    <Modal
      title="Tiệm giao đến đâu?"
      eyebrow="Chỉ một bước nhỏ nữa thôi"
      onClose={onClose}
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
            <span>Tổng thanh toán</span>
            <strong>{money(acceptedQuote.total)}</strong>
          </div>
          <div className="flex items-center gap-2.5 [&>button[type=submit]]:flex-1 mobile:gap-2 mobile:[&>button]:gap-[7px] mobile:[&>button]:p-3 mobile:[&>button]:text-[13px] mobile:[&>button[type=button]]:min-w-12 tiny:[&>button[type=button]]:gap-0 tiny:[&>button[type=button]]:px-2.5 tiny:[&>button[type=button]]:text-[0px] tiny:[&>button[type=button]_svg]:w-5 tiny:[&>button[type=submit]]:px-[9px] tiny:[&>button[type=submit]]:text-xs">
            <Button
              variant="secondary"
              type="button"
              onClick={onBack}
              disabled={isPending}
            >
              <ArrowLeft size={18} />
              Giỏ hàng
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={formId}
              disabled={isPending || !ready}
            >
              {isPending
                ? "Tiệm đang nhận đơn…"
                : paymentMethod === "cod"
                  ? "Đặt hàng (Thanh toán khi nhận)"
                  : "Đặt hàng & Chuyển khoản"}
              <ArrowRight size={18} />
            </Button>
          </div>
          <small className="mt-3 flex items-start justify-center gap-1.5 text-[9px] leading-[1.8] text-[#8a999d] [&_svg]:mt-px [&_svg]:shrink-0 mobile:justify-start mobile:gap-[7px] mobile:text-left mobile:text-[11px] mobile:leading-[1.7]">
            <ShieldCheck size={14} />
            Thông tin giao hàng chỉ dành cho tiệm. Không cần tạo tài khoản.
          </small>
        </div>
      }
    >
      <form
        id={formId}
        action={formAction}
        className="px-7 pt-[23px] pb-7 [&>p]:mb-[23px] [&>p]:text-[11px] [&>p]:leading-[1.9] [&>p]:text-muted [&_label]:mb-[18px] [&_label]:flex [&_label]:flex-col [&_label]:gap-2 [&_label]:text-[11px] [&_label]:font-semibold [&_input]:min-h-[45px] [&_input]:w-full [&_input]:resize-y [&_input]:rounded-[5px] [&_input]:border [&_input]:border-[#cedcde] [&_input]:bg-white [&_input]:px-3 [&_input]:py-[13px] [&_input]:text-xs [&_input]:leading-[1.6] [&_input]:font-normal [&_input]:text-ink [&_textarea]:min-h-[45px] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-[5px] [&_textarea]:border [&_textarea]:border-[#cedcde] [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-[13px] [&_textarea]:text-xs [&_textarea]:leading-[1.6] [&_textarea]:font-normal [&_textarea]:text-ink [&_input::placeholder]:text-[11px] [&_input::placeholder]:text-[#9caaac] [&_textarea::placeholder]:text-[11px] [&_textarea::placeholder]:text-[#9caaac] mobile:pt-5 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pb-6 mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:[&>p]:mb-6 mobile:[&>p]:text-sm mobile:[&>p]:leading-[1.8] mobile:[&_label]:mb-5 mobile:[&_label]:gap-[9px] mobile:[&_label]:text-sm mobile:[&_input]:min-h-[52px] mobile:[&_input]:rounded-[9px] mobile:[&_input]:p-[13px] mobile:[&_input]:text-base mobile:[&_input]:leading-[1.65] mobile:[&_textarea]:min-h-[52px] mobile:[&_textarea]:rounded-[9px] mobile:[&_textarea]:p-[13px] mobile:[&_textarea]:text-base mobile:[&_textarea]:leading-[1.65] mobile:[&_input::placeholder]:text-sm mobile:[&_textarea::placeholder]:text-sm low:group-data-[compact=true]/sheet:[&_textarea]:h-[52px] low:group-data-[compact=true]/sheet:[&_textarea]:min-h-[52px] low:group-data-[compact=true]/sheet:[&_textarea]:py-2.5 low:group-data-[compact=true]/sheet:[&_textarea]:leading-[1.5]"
      >
        <p>
          Cho tiệm xin thông tin để chuẩn bị và giao món. Lần sau tiệm sẽ nhớ
          trên thiết bị này.
        </p>
        <div className="mb-6">
          <DeliveryPolicy compact />
        </div>
        <div className="grid grid-cols-2 gap-[15px] mobile:grid-cols-1 mobile:gap-0">
          <label>
            Tên người nhận
            <input
              autoComplete="name"
              enterKeyHint="next"
              autoCapitalize="words"
              name="name"
              required
              minLength={2}
              maxLength={80}
              value={customer.name}
              onChange={(e) => field("name", e.target.value)}
              placeholder="Tiệm gọi bạn là…"
            />
          </label>
          <label>
            Số điện thoại
            <input
              type="tel"
              autoComplete="tel"
              enterKeyHint="next"
              inputMode="tel"
              name="phone"
              required
              maxLength={20}
              value={customer.phone}
              onChange={(e) => field("phone", e.target.value)}
              placeholder="09xx xxx xxx"
            />
          </label>
        </div>
        <label>
          Địa chỉ giao hàng
          <textarea
            autoComplete="street-address"
            name="address"
            required
            minLength={8}
            maxLength={300}
            rows={2}
            value={customer.address}
            onChange={(e) => field("address", e.target.value)}
            placeholder="Số nhà, đường, phường/xã, quận/huyện…"
          />
        </label>
        <div
          className={`mb-[23px] flex items-start gap-3 rounded-md bg-blue-light p-4 text-blue [&>svg]:mt-0.5 [&>svg]:shrink-0 [&_strong]:text-[11px] [&_p]:mt-[5px] [&_p]:text-[10px] [&_p]:leading-[1.8] [&_p]:text-[#788e93] [&_button]:mt-1 [&_button]:text-[10px] mobile:mb-6 mobile:rounded-[10px] mobile:[&_strong]:text-sm mobile:[&_strong]:leading-[1.6] mobile:[&_p]:text-xs ${customer.location ? "bg-[#edf3e9]! text-green!" : ""}`}
        >
          <MapPin size={23} />
          <div>
            <strong>
              {customer.location
                ? "Đã ghim vị trí giao hàng"
                : "Ghim vị trí để tiệm dễ tìm bạn"}
            </strong>
            <p>
              {locationState ||
                "Tiệm chỉ lấy vị trí khi bạn đồng ý. Hãy ghim tại nơi nhận hàng."}
            </p>
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
          </div>
        </div>
        <label>
          Lời nhắn cho tiệm{" "}
          <span className="contents text-[9px] font-normal text-muted">
            không bắt buộc
          </span>
          <textarea
            name="note"
            rows={2}
            maxLength={500}
            value={customer.note}
            onChange={(e) => field("note", e.target.value)}
            placeholder="Ví dụ: gọi mình khi đến, giao ở sảnh nhé…"
          />
        </label>

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
                    ? "Quét mã QR chuyển khoản tiện lợi"
                    : "Tiệm chưa cấu hình mã QR"}
                </small>
              </div>
            </button>
          </div>

          {paymentMethod === "bank_transfer" && settings.qrImage && (
            <div className="mt-3.5 animate-fade-in rounded-lg border border-dashed border-[#a2c6cc] bg-[#f3f8f9] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-blue">
                <QrCode size={18} />
                <span>Mã QR chuyển khoản của tiệm</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-4 mobile:grid-cols-[110px_1fr] mobile:gap-3.5">
                <a
                  href={settings.qrImage}
                  download="qr-tiem-sua.png"
                  className="flex flex-col items-center gap-1.5 rounded-md border border-[#d9e6e8] bg-white p-2 no-underline shadow-[0_2px_6px_#0000000a] [&_span]:text-[9px] [&_span]:font-medium [&_span]:text-blue"
                  title="Nhấn để tải hoặc xem ảnh QR"
                >
                  <img
                    src={settings.qrImage}
                    alt="Mã QR chuyển khoản ngân hàng"
                    className="aspect-square w-full rounded object-contain"
                  />
                  <span>Chạm để lưu / mở to</span>
                </a>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2 text-[11px] text-ink [&_strong]:text-base [&_strong]:font-bold [&_strong]:text-blue mobile:[&_strong]:text-[15px]">
                    <span>Số tiền cần chuyển:</span>
                    <strong>{money(acceptedQuote.total)}</strong>
                  </div>
                  {settings.paymentNote && (
                    <p className="m-0 rounded-md border border-[#e2ebeb] bg-white px-2.5 py-2 text-[11px] leading-[1.6] text-[#4f6367] mobile:text-xs">
                      {settings.paymentNote}
                    </p>
                  )}
                  <p className="m-0 text-[10px] leading-[1.6] text-muted">
                    💡 Sau khi bấm <b>Đặt hàng & Chuyển khoản</b>, tiệm sẽ hiển
                    thị mã đơn riêng để bạn gửi ảnh bill xác nhận.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "cod" && (
            <div className="mt-3.5 flex animate-fade-in items-start gap-3 rounded-lg border border-[#cce5cb] bg-[#f1f8f0] px-4 py-3.5 text-[#27672a] [&_strong]:mb-1 [&_strong]:block [&_strong]:text-xs [&_strong]:font-semibold [&_p]:m-0 [&_p]:text-[11px] [&_p]:leading-[1.6] [&_p]:text-[#3b5e3c] mobile:rounded-[10px] mobile:p-3.5 mobile:[&_strong]:text-sm mobile:[&_p]:text-xs">
              <Banknote size={22} />
              <div>
                <strong>Thanh toán tiền mặt khi nhận hàng</strong>
                <p>
                  Bạn chuẩn bị <b>{money(acceptedQuote.total)}</b> tiền mặt khi
                  shipper giao tới. Tiệm sẽ chuẩn bị đơn ngay!
                </p>
              </div>
            </div>
          )}
        </fieldset>
      </form>
    </Modal>
  );
}
