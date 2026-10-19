"use client";
import { Button } from "./button";
import { useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Modal } from "./modal";
import {
  money,
  type CartLine,
  type ShopProduct,
} from "@/shared/commerce/types";
import { ProductImage } from "./product-image";
import { Quantity } from "./quantity";

export function ProductSheet({
  product,
  onClose,
  onAdd,
  initialLine,
}: {
  product: ShopProduct;
  onClose: () => void;
  onAdd: (line: CartLine) => void;
  initialLine?: CartLine;
}) {
  const [quantity, setQuantity] = useState(() =>
    Math.min(initialLine?.quantity || 1, product.stock || 30),
  );
  const [selected, setSelected] = useState<string[]>(
    () =>
      initialLine?.toppingIds.filter((id) =>
        product.toppings.some((t) => t.id === id && t.available),
      ).slice(0, product.toppingSelection === "single" ? 1 : undefined) || [],
  );
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const [sizeId, setSizeId] = useState(() =>
    product.sizes?.find((s) => s.id === initialLine?.sizeId && s.available)?.id ||
    product.sizes?.find((s) => s.available)?.id,
  );
  const size = product.sizes?.find((s) => s.id === sizeId);
  const basePrice = size?.price ?? product.price;
  const singleTopping = product.toppingSelection === "single";
  const total =
    quantity *
    (basePrice +
      product.toppings
        .filter((t) => selectedSet.has(t.id))
        .reduce((n, t) => n + t.price, 0));
  const available = product.status === "available" && product.stock !== 0 &&
    (!product.sizes?.length || Boolean(size?.available));
  return (
    <Modal
      title={product.name}
      eyebrow={product.category}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-[15px] [&>button]:flex-1 [&>button>span]:ml-auto mobile:items-stretch mobile:gap-3 mobile:[&>button]:h-12 mobile:[&>button]:min-w-0 mobile:[&>button]:flex-col mobile:[&>button]:gap-[3px] mobile:[&>button]:px-2.5 mobile:[&>button]:py-0 mobile:[&>button]:text-[13px] mobile:[&>button]:leading-[1.4] mobile:[&>button>span]:m-0 mobile:[&>button>span]:text-[15px] mobile:[&>button>svg]:hidden">
          <Quantity
            value={quantity}
            onChange={setQuantity}
            max={Math.min(30, product.stock ?? 30)}
          />
          <Button
            variant="primary"
            disabled={!available}
            onClick={() => {
              onAdd({ productId: product.id, ...(sizeId ? { sizeId } : {}), quantity, toppingIds: selected });
              onClose();
            }}
          >
            <ShoppingBag size={18} />
            Thêm vào giỏ <span>{money(total)}</span>
          </Button>
        </div>
      }
    >
      <div className="px-7 pt-[22px] pb-7 mobile:pt-4 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pb-6 mobile:pl-[max(12px,env(safe-area-inset-left,0px))]">
        <ProductImage
          product={product}
          className="h-[250px] w-full rounded-[7px] object-cover mobile:h-[clamp(150px,25dvh,230px)] mobile:rounded-[11px] landscape:h-[135px]"
          sizes="(max-width: 760px) 100vw, (max-width: 980px) and (max-height: 500px) 100vw, 540px"
        />
        <div className="pt-[22px] [&>p]:mt-[13px] [&>p]:text-xs [&>p]:leading-[1.9] [&>p]:text-muted mobile:pt-[19px] mobile:[&>p]:text-sm mobile:[&>p]:leading-[1.85]">
          <div className="flex items-center gap-2 [&>strong]:text-[22px] [&>span]:text-[11px] [&>span]:text-muted mobile:flex-wrap mobile:gap-1.5 mobile:[&>strong]:text-2xl mobile:[&>span]:text-[13px]">
            <strong>{money(basePrice)}</strong>
            <span>/ {product.unit}</span>
            <span
              className={`ml-auto flex items-center gap-[5px] rounded-[3px] bg-[#eef3e8] px-[7px] py-[5px] text-[9px]! text-green! [&_i]:size-1 [&_i]:rounded-full [&_i]:bg-current mobile:px-2 mobile:py-1.5 mobile:text-[11px]! ${available ? "" : "bg-[#f6e9e4]! text-red!"}`}
            >
              <i />
              {available ? "Còn hàng" : "Hết hàng"}
            </span>
          </div>
          <p>{product.description}</p>
          {Boolean(product.sizes?.length) && (
            <fieldset className="mt-6">
              <legend className="mb-3 text-[13px] font-semibold mobile:text-[15px]">
                Size <span className="ml-2 text-xs font-normal text-muted">Chọn 1 size</span>
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {product.sizes?.map((s) => (
                  <label key={s.id} className="relative flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-line p-3 text-sm has-checked:border-blue has-checked:bg-blue-light has-disabled:cursor-not-allowed has-disabled:opacity-50">
                    <input type="radio" name={`size-${product.id}`} value={s.id}
                      checked={sizeId === s.id} disabled={!s.available}
                      onChange={() => setSizeId(s.id)} className="size-4 accent-blue" />
                    <span>{s.name}{!s.available && " · Hết hàng"}</span>
                    <span className="ml-auto font-semibold">{money(s.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {product.toppings.length > 0 && (
            <fieldset className="mt-[25px] [&_legend]:mb-[13px] [&_legend]:w-full [&_legend]:text-[13px] [&_legend]:font-semibold [&_legend_span]:float-right [&_legend_span]:text-[9px] [&_legend_span]:font-normal [&_legend_span]:text-muted [&_label]:relative [&_label]:overflow-hidden [&_label]:mt-2 [&_label]:flex [&_label]:min-h-[47px] [&_label]:cursor-pointer [&_label]:items-center [&_label]:gap-2.5 [&_label]:rounded-[5px] [&_label]:border [&_label]:border-line [&_label]:px-3 [&_label]:py-[13px] [&_label]:text-[11px] [&_label:has(input:checked)]:border-[#75a5b1] [&_label:has(input:checked)]:bg-[#eef5f5] [&_label:not(:has(input:disabled))]:active:scale-[.985] [&_label:not(:has(input:disabled))]:active:bg-[#eef5f5] [&_label:has(input:disabled)]:cursor-not-allowed [&_label:has(input:disabled)]:opacity-55 [&_input]:absolute [&_input]:size-5 [&_input]:opacity-0 [&_b]:ml-auto [&_b]:text-[10px] [&_b]:font-normal [&_small]:text-[9px] [&_small]:text-red mobile:mt-6 mobile:[&_legend]:mb-2.5 mobile:[&_legend]:text-[15px] mobile:[&_legend]:leading-[1.6] mobile:[&_legend_span]:text-[11px] mobile:[&_label]:min-h-[58px] mobile:[&_label]:rounded-[9px] mobile:[&_label]:p-3 mobile:[&_label]:text-sm mobile:[&_label]:leading-[1.6] mobile:[&_input]:size-6 mobile:[&_b]:text-xs mobile:[&_b]:whitespace-nowrap mobile:[&_small]:text-[11px]">
              <legend>
                Topping <span>{singleTopping ? "Chọn 1 loại hoặc không topping" : "Không bắt buộc"}</span>
              </legend>
              {singleTopping && (
                <label>
                  <input className="peer" type="radio" name={`topping-${product.id}`}
                    checked={selected.length === 0} onChange={() => setSelected([])} />
                  <span className="grid size-[18px] shrink-0 place-items-center rounded-full border border-[#aec6cc] text-transparent peer-checked:border-blue peer-checked:bg-blue peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-[#64aabc] peer-focus-visible:outline-offset-3 mobile:size-[22px]">
                    <Check size={13} />
                  </span>
                  <span>Không topping</span>
                  <b>{money(0)}</b>
                </label>
              )}
              {product.toppings.map((t) => (
                <label
                  key={t.id}
                  className={
                    !t.available ? "cursor-not-allowed! opacity-55!" : ""
                  }
                >
                  <input
                    className="peer"
                    type={singleTopping ? "radio" : "checkbox"}
                    name={singleTopping ? `topping-${product.id}` : undefined}
                    checked={selectedSet.has(t.id)}
                    disabled={!t.available}
                    onChange={(e) =>
                      singleTopping ? setSelected([t.id]) : setSelected((s) =>
                        e.target.checked
                          ? [...s, t.id]
                          : s.filter((id) => id !== t.id),
                      )
                    }
                  />
                  <span className={`grid size-[18px] shrink-0 place-items-center border border-[#aec6cc] text-transparent peer-checked:border-blue peer-checked:bg-blue peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-[#64aabc] peer-focus-visible:outline-offset-3 mobile:size-[22px] ${singleTopping ? "rounded-full" : "rounded mobile:rounded-md"}`}>
                    <Check size={13} />
                  </span>
                  <span>
                    {t.name}
                    {!t.available && <small> · Hết topping</small>}
                  </span>
                  <b>{t.price ? `+${money(t.price)}` : money(0)}</b>
                </label>
              ))}
            </fieldset>
          )}
        </div>
      </div>
    </Modal>
  );
}
