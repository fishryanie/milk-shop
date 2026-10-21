"use client";

import { useState } from "react";
import type { Customer } from "@/shared/commerce/types";
import { customerSchema } from "@/shared/commerce/validation";

const fieldClass = "w-full min-w-0 appearance-none rounded-lg border border-line/70 bg-white px-3 py-2.5 text-sm font-normal text-ink shadow-none outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted/60 hover:border-[#cbdcde] focus:border-blue/50 focus:ring-1 focus:ring-blue/10 mobile:text-base";

export function DeliveryDetailsForm({ formId, customer, onChange, onContinue }: {
  formId: string;
  customer: Customer;
  onChange: (name: keyof Omit<Customer, "location">, value: string) => void;
  onContinue: (customer: Customer) => void;
}) {
  const [error, setError] = useState("");
  const field = (name: keyof Omit<Customer, "location">, value: string) => {
    setError("");
    onChange(name, value);
  };

  return (
    <form id={formId} className="grid gap-3 px-5 py-4 mobile:px-3 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-[13px] [&_label]:font-medium" onSubmit={(event) => {
      event.preventDefault();
      const result = customerSchema.safeParse(customer);
      if (!result.success) {
        const issue = result.error.issues[0];
        setError(issue.message);
        const input = event.currentTarget.elements.namedItem(String(issue.path[0]));
        if (input instanceof HTMLElement) input.focus();
        return;
      }
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      onContinue(result.data);
    }}>
      <p data-step-intro tabIndex={-1} className="text-[13px] leading-6 text-muted">Cho tiệm xin thông tin người nhận nhé.</p>
      <div className="grid grid-cols-2 gap-3">
        <label>
          Tên người nhận
          <input className={`${fieldClass} h-11`} autoComplete="name" enterKeyHint="next" autoCapitalize="words" name="name" required minLength={2} maxLength={80} value={customer.name} onChange={(event) => field("name", event.target.value)} placeholder="Tên người nhận" />
        </label>
        <label>
          Số điện thoại
          <input className={`${fieldClass} h-11`} type="tel" autoComplete="tel" enterKeyHint="next" inputMode="tel" name="phone" required maxLength={20} value={customer.phone} onChange={(event) => field("phone", event.target.value)} placeholder="09xx xxx xxx" />
        </label>
      </div>
      <label>
        Địa chỉ giao hàng
        <textarea className={`${fieldClass} min-h-[68px] resize-y`} autoComplete="street-address" name="address" required minLength={8} maxLength={300} rows={2} value={customer.address} onChange={(event) => field("address", event.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện…" />
      </label>
      <label>
        <span>Ghi chú giao hàng <span className="text-xs font-normal text-muted">(không bắt buộc)</span></span>
        <textarea className={`${fieldClass} min-h-[68px] resize-y`} name="note" maxLength={500} rows={2} value={customer.note} onChange={(event) => field("note", event.target.value)} placeholder="Ví dụ: gọi khi đến, giao ở sảnh…" />
      </label>
      {error && <p role="alert" className="rounded-lg bg-[#fbede8] p-3 text-xs leading-5 text-red">{error}</p>}
    </form>
  );
}
