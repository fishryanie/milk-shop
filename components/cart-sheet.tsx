"use client";
import { Button } from "./button";
import {
  ArrowRight,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { Modal, useModalMotion } from "./modal";
import { ProductImage } from "./product-image";
import { Quantity } from "./quantity";
import {
  cartKey,
  money,
  type CartLine,
  type Quote,
  type ShopSettings,
} from "@/shared/commerce/types";
export function CartSheet({
  cart,
  quote,
  loading,
  error,
  settings,
  onChange,
  onRetry,
  onCheckout,
  onClose,
  onEdit,
}: {
  cart: CartLine[];
  quote: Quote | null;
  loading: boolean;
  error: string;
  settings: ShopSettings;
  onChange: (cart: CartLine[]) => void;
  onRetry: () => void;
  onCheckout: () => void;
  onClose: () => void;
  onEdit: (line: CartLine) => void;
}) {
  const { dialogRef, dismiss } = useModalMotion(onClose);
  const isCurrent = Boolean(
    quote &&
    quote.lines.length === cart.length &&
    cart.every((line) =>
      quote.lines.some(
        (row) => row.key === cartKey(line) && row.quantity === line.quantity,
      ),
    ),
  );
  return (
    <Modal
      dialogRef={dialogRef}
      title={cart.length ? `Giỏ hàng (${cart.length})` : "Giỏ hàng của bạn"}
      compact={cart.length > 0}
      onClose={() => dismiss()}
      footer={
        cart.length > 0 ? (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
            <div className="min-w-0">
              <span className="block text-[11px] leading-4 text-muted">
                Tiền món · chưa gồm ship
              </span>
              <strong
                className="block text-xl leading-7 text-blue tabular-nums"
                aria-live="polite"
              >
                {isCurrent ? money(quote!.total) : "Đang cập nhật…"}
              </strong>
            </div>
            <Button
              variant="primary"
              className="min-w-[140px]"
              disabled={
                !isCurrent ||
                !quote?.valid ||
                loading ||
                Boolean(error) ||
                !settings.isOpen
              }
              onClick={() => dismiss(onCheckout)}
            >
              Đặt hàng <ArrowRight size={18} />
            </Button>
            {!settings.isOpen && (
              <p className="col-span-2 text-xs leading-5 text-red">
                Tiệm đang tạm nghỉ.
              </p>
            )}
          </div>
        ) : undefined
      }
    >
      {cart.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-[17px] px-5 py-10 text-center [&_svg]:text-sky [&_h3]:font-serif [&_h3]:text-[27px] [&_p]:max-w-[350px] [&_p]:text-xs [&_p]:leading-[1.8] [&_p]:text-muted mobile:min-h-[260px] mobile:gap-4 mobile:py-[30px] mobile:[&_h3]:leading-[1.3] mobile:[&_p]:text-sm">
          <ShoppingBag size={48} strokeWidth={1} />
          <h3>Giỏ còn trống, bụng còn thèm?</h3>
          <p>Chọn một món ngon để tiệm chuẩn bị cho bạn nhé.</p>
          <Button variant="primary" onClick={() => dismiss()}>
            Dạo một vòng menu <ArrowRight size={18} />
          </Button>
        </div>
      ) : (
        <>
          {error && (
            <div
              className="my-3.5 flex items-start gap-2.5 rounded-[5px] px-[17px] py-[15px] text-[11px] leading-[1.8] [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_button]:ml-auto [&_button]:p-0 [&_button]:text-[10px] [&_button]:font-semibold [&_button]:whitespace-nowrap [&_button]:underline mobile:mx-3 mobile:p-3 mobile:text-[13px] mobile:leading-[1.75] mobile:[&_button]:h-10 mobile:[&_button]:min-h-10 mobile:[&_button]:text-xs bg-[#fbede8] text-[#9f4a3b]"
              role="alert"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                className="rounded-button cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px h-10 px-3 font-medium text-xs border border-line bg-white hover:bg-blue-light"
                onClick={onRetry}
              >
                Thử lại
              </button>
            </div>
          )}
          <div className="px-5 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))]">
            {cart.map((line) => {
              const row = quote?.lines.find((l) => l.key === cartKey(line));
              const canEdit = Boolean(
                row?.size || /size|topping/i.test(row?.issue || ""),
              );
              const options =
                row?.toppings.map((t) => t.name).join(", ") ||
                (row?.size ? "Không topping" : "Vị nguyên bản");
              const details = (
                <>
                  <h3 className="text-sm leading-5 font-semibold [overflow-wrap:anywhere]">
                    {row?.name || "Đang tải món…"}
                  </h3>
                  <span
                    className={`block text-xs leading-[18px] [overflow-wrap:anywhere] ${canEdit ? "text-blue" : "text-muted"}`}
                  >
                    {options}
                    {canEdit && (
                      <Pencil
                        size={12}
                        className="ml-1.5 inline-block align-middle"
                      />
                    )}
                  </span>
                </>
              );
              return (
                <div
                  key={cartKey(line)}
                  className="grid grid-cols-[44px_minmax(0,1fr)_40px] items-start gap-x-2.5 border-b border-line py-2"
                >
                  <ProductImage
                    product={{
                      name: row?.name || "Đang tải món…",
                      imageUrl: row?.imageUrl || "",
                    }}
                    sizes="44px"
                    className="size-11 shrink-0 rounded-lg object-cover [&_span]:hidden [&_svg]:size-6"
                  />
                  <div className="min-w-0">
                    {canEdit ? (
                      <button
                        className="rounded-button min-h-10 w-full cursor-pointer text-left touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                        aria-label={`Sửa lựa chọn ${row?.name || "món"}`}
                        onClick={() => dismiss(() => onEdit(line))}
                      >
                        {details}
                      </button>
                    ) : (
                      <div className="flex min-h-10 flex-col justify-center">
                        {details}
                      </div>
                    )}
                    {(!row || row.issue || !row.available) && (
                      <p
                        className={`mt-0.5 text-xs leading-[18px] ${row ? "text-red" : "text-muted"}`}
                        role={row?.issue ? "alert" : undefined}
                      >
                        {row ? row.issue || "Vui lòng chọn lại món này." : "Đang tải món…"}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="icon"
                    className="text-muted enabled:hover:text-red"
                    aria-label={`Xóa ${row?.name || "món"}`}
                    onClick={() =>
                      onChange(cart.filter((l) => cartKey(l) !== cartKey(line)))
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="col-span-2 col-start-2 flex min-w-0 items-center justify-between gap-2">
                    <strong className="text-sm leading-5 whitespace-nowrap tabular-nums">
                      {row && row.quantity === line.quantity
                        ? money(row.total)
                        : "—"}
                    </strong>
                    <Quantity
                      compact
                      label={row?.name || "món"}
                      value={line.quantity}
                      remove
                      onChange={(n) =>
                        onChange(
                          n
                            ? cart.map((l) =>
                                cartKey(l) === cartKey(line)
                                  ? { ...l, quantity: n }
                                  : l,
                              )
                            : cart.filter((l) => cartKey(l) !== cartKey(line)),
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
