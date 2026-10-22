"use client";

import { Banknote, QrCode } from "lucide-react";
import type { PaymentMethod } from "@/shared/commerce/types";

export function PaymentMethodForm({ formId, paymentMethod, transferAvailable, busy, onChange, action }: {
  formId: string;
  paymentMethod: PaymentMethod;
  transferAvailable: boolean;
  busy: boolean;
  onChange: (method: PaymentMethod) => void;
  action: (data: FormData) => void;
}) {
  const options = [
    { value: "cod" as const, title: "Thanh toán khi nhận hàng", description: "Trả tiền mặt khi shipper giao đến", icon: Banknote, disabled: false },
    { value: "bank_transfer" as const, title: "Chuyển khoản ngân hàng", description: transferAvailable ? "Mã QR hiện sau khi bạn đặt đơn" : "Tiệm chưa cấu hình mã QR", icon: QrCode, disabled: !transferAvailable },
  ];

  return (
    <form id={formId} action={action} className="space-y-4 px-5 py-4 mobile:px-3">
      <p data-step-intro tabIndex={-1} className="text-[13px] leading-6 text-muted">Bạn muốn thanh toán bằng cách nào?</p>
      <fieldset disabled={busy}>
        <legend className="sr-only">Phương thức thanh toán</legend>
        <div className="grid gap-2.5">
          {options.map(({ value, title, description, icon: Icon, disabled }) => (
            <label key={value} className={`flex items-center gap-3 rounded-button border px-4 py-4 transition-[border-color,background-color] duration-150 ${paymentMethod === value ? "border-blue/35 bg-blue-light/60" : "border-line/70 bg-white"} ${disabled || busy ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-blue/35"}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-light text-blue"><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-5 text-ink">{title}{value === "cod" ? " (COD)" : " (QR)"}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
              </span>
              <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} disabled={disabled} onChange={() => onChange(value)} className="size-4 shrink-0 accent-blue" />
            </label>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
