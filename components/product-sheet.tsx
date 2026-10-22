"use client";
import { Button } from "./button";
import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Modal, useModalMotion } from "./modal";
import {
  money,
  getMaxToppings,
  type CartLine,
  type ShopProduct,
} from "@/shared/commerce/types";
import { ProductImage } from "./product-image";
import { Quantity } from "./quantity";
import styles from "./product-sheet.module.css";

export function ProductSheet({
  product,
  onClose,
  onAdd,
  initialLine,
}: {
  product: ShopProduct;
  onClose: () => void;
  onAdd: (line: CartLine, origin: DOMRect) => boolean;
  initialLine?: CartLine;
}) {
  const { dialogRef, dismiss } = useModalMotion(onClose);
  const maxToppings = getMaxToppings(product);
  const [quantity, setQuantity] = useState(() =>
    Math.min(initialLine?.quantity || 1, product.stock || 30),
  );
  const [selected, setSelected] = useState<string[]>(
    () =>
      initialLine?.toppingIds.filter((id) =>
        product.toppings.some((t) => t.id === id && t.available),
      ).slice(0, maxToppings ?? undefined) || [],
  );
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const [sizeId, setSizeId] = useState(() =>
    product.sizes?.find((s) => s.id === initialLine?.sizeId && s.available)?.id ||
    product.sizes?.find((s) => s.available)?.id,
  );
  const size = product.sizes?.find((s) => s.id === sizeId);
  const basePrice = size?.price ?? product.price;
  const singleTopping = maxToppings === 1;
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
      dialogRef={dialogRef}
      title={product.name}
      className={styles.sheet}
      compact
      onClose={() => dismiss()}
      footer={
        <div className={styles.purchaseBar}>
          <Quantity
            compact
            value={quantity}
            onChange={setQuantity}
            max={Math.min(30, product.stock ?? 30)}
          />
          <Button
            variant="primary"
            disabled={!available}
            onClick={(event) => {
              const added = onAdd(
                { productId: product.id, ...(sizeId ? { sizeId } : {}), quantity, toppingIds: selected },
                event.currentTarget.getBoundingClientRect(),
              );
              if (added) dismiss();
            }}
          >
            <ShoppingBag size={16} />
            <span>Thêm vào giỏ</span>
            <span className={styles.total}>{money(total)}</span>
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.overview}>
          <ProductImage
            product={product}
            className={styles.image}
            sizes="(max-width: 760px) 112px, 128px"
          />
          <div className={styles.details}>
            <div className={styles.priceRow}>
              <div className={styles.priceLine}>
                <strong className={styles.price}>{money(basePrice)}</strong>
                <span className={styles.unit}>/ {product.unit}</span>
              </div>
            </div>
          </div>
        </div>
        {product.description && <p className={styles.description}>{product.description}</p>}
        {Boolean(product.sizes?.length) && (
          <fieldset className={styles.options}>
            <legend>
              Size <span>Chọn 1 size</span>
            </legend>
            <div className={styles.optionGrid}>
              {product.sizes?.map((s) => (
                <label key={s.id} className={styles.option}>
                  <input type="radio" name={`size-${product.id}`} value={s.id}
                    checked={sizeId === s.id} disabled={!s.available}
                    onChange={() => setSizeId(s.id)} className="size-4 accent-blue" />
                  <span>{s.name}</span>
                  <b>{money(s.price)}</b>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {product.toppings.length > 0 && (
          <fieldset className={styles.options}>
            <legend>
              Topping <span>{maxToppings === null ? "Không giới hạn" : `Chọn tối đa ${maxToppings} loại`}</span>
            </legend>
            <div className={styles.optionGrid}>
              {singleTopping && (
                <label className={styles.option}>
                  <input type="radio" name={`topping-${product.id}`}
                    checked={selected.length === 0} onChange={() => setSelected([])} />
                  <span>Không topping</span>
                </label>
              )}
              {product.toppings.map((t) => (
                <label key={t.id} className={styles.option}>
                  <input
                    type={singleTopping ? "radio" : "checkbox"}
                    name={singleTopping ? `topping-${product.id}` : undefined}
                    checked={selectedSet.has(t.id)}
                    disabled={!t.available || (!singleTopping && maxToppings !== null && selected.length >= maxToppings && !selectedSet.has(t.id))}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (singleTopping) {
                        setSelected([t.id]);
                      } else {
                        setSelected((s) => {
                          if (!checked) return s.filter((id) => id !== t.id);
                          if (maxToppings !== null && s.length >= maxToppings) return s;
                          return [...s, t.id];
                        });
                      }
                    }}
                  />
                  <span>{t.name}</span>
                  {t.price > 0 && <b>+{money(t.price)}</b>}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </Modal>
  );
}
