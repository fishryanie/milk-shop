"use client";
import { Minus, Plus } from "lucide-react";

export function Quantity({
  value,
  onChange,
  max = 30,
  remove = false,
  compact = false,
  label = "Số lượng",
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  remove?: boolean;
  compact?: boolean;
  label?: string;
}) {
  return (
    <div
      className={compact ? "flex h-10 min-w-[110px] shrink-0 items-center justify-between rounded-lg border border-line bg-white [&_button]:grid [&_button]:size-[38px] [&_button]:place-items-center [&_button]:rounded-md [&_button]:enabled:active:bg-blue-light [&_span]:min-w-8 [&_span]:px-0 [&_span]:text-center [&_span]:text-sm [&_span]:tabular-nums" : "flex h-10 min-h-10 min-w-[104px] shrink-0 items-center justify-between gap-2 rounded-lg border border-line bg-white px-1 [&_button]:grid [&_button]:h-[38px] [&_button]:w-8 [&_button]:place-items-center [&_button]:rounded-md [&_button]:enabled:active:scale-[.82] [&_button]:enabled:active:bg-[#d5e9ec] [&_span]:min-w-[15px] [&_span]:text-center [&_span]:text-xs [&_span]:tabular-nums mobile:h-12 mobile:min-w-32 mobile:gap-1 mobile:rounded-[9px] mobile:p-0 mobile:[&_button]:h-[46px] mobile:[&_button]:w-11 mobile:[&_span]:text-base mobile:[&_span]:font-semibold"}
      aria-label={label}
    >
      <button
        aria-label={`Giảm ${label}`}
        disabled={value <= (remove ? 0 : 1)}
        onClick={() => onChange(value - 1)}
        className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-full w-8 flex items-center justify-center rounded"
      >
        <Minus size={15} />
      </button>
      <span aria-live="polite" className="font-semibold text-sm px-2">
        <span key={value} className="quantity-value inline-block">{value}</span>
      </span>
      <button
        aria-label={`Tăng ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-full w-8 flex items-center justify-center rounded"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
