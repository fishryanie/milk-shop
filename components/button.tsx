import type { ButtonHTMLAttributes, Ref } from "react";

const base =
  "relative cursor-pointer overflow-hidden select-none touch-manipulation transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 [-webkit-tap-highlight-color:transparent]";
const variants = {
  primary:
    "inline-flex h-10 min-h-10 items-center justify-center gap-2 rounded-lg bg-blue px-4 text-[13px] font-semibold text-white enabled:hover:-translate-y-px enabled:hover:bg-blue-dark enabled:active:translate-y-[1.5px] enabled:active:scale-[.96] enabled:active:bg-blue-dark enabled:active:brightness-[.94] enabled:active:shadow-[inset_0_1px_4px_#203d4559] mobile:[&>svg]:shrink-0",
  secondary:
    "inline-flex h-10 min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-[13px] font-semibold enabled:hover:bg-[#f8fafb] enabled:active:translate-y-px enabled:active:scale-[.96] enabled:active:border-[#bcd0d4] enabled:active:bg-[#edf4f5] enabled:active:shadow-[inset_0_1px_3px_#203d4514] mobile:[&>svg]:shrink-0",
  text: "inline-flex h-10 min-h-10 items-center justify-center gap-[7px] rounded-lg px-3 text-[13px] font-semibold text-blue enabled:active:scale-95 enabled:active:bg-[#e2f0f3] enabled:active:opacity-80",
  icon: "inline-grid size-10 min-h-10 min-w-10 shrink-0 place-items-center rounded-lg hover:bg-blue-light enabled:active:scale-[.88] enabled:active:bg-blue-light enabled:active:brightness-95",
};

export function Button({
  ref,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
