"use client";
import { useState, type CSSProperties } from "react";
import { productImageProps } from "@/lib/product-image-props";
import { StorefrontIcon } from "./storefront-icon";
import type { ShopProduct } from "@/shared/commerce/types";
import { milkImage } from "@/lib/milk-image";

export function ProductImage({
  product,
  className = "",
  sizes = "(max-width: 760px) calc(50vw - 18px), (max-width: 980px) and (max-height: 500px) calc(50vw - 18px), (max-width: 1440px) calc(29.67vw - 18px), calc(462px - 3.67vw)",
  eager = false,
}: {
  product: Pick<ShopProduct, "imageUrl" | "name" | "imagePosition"> & Partial<Pick<ShopProduct, "category">>;
  className?: string;
  sizes?: string;
  eager?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState("");
  const nameLower = product.name?.toLowerCase() || "";
  const catLower = product.category?.toLowerCase() || "";

  // Smart image fallback: if item has no imageUrl, use delicious relevant default imagery
  const effectiveUrl =
    product.imageUrl && failedUrl !== product.imageUrl
      ? product.imageUrl
      : nameLower.includes("flan") || catLower.includes("flan")
      ? "/images/flan.jpg"
      : nameLower.includes("sữa") || catLower.includes("sữa")
      ? "/images/milk-hero.png"
      : "";
  const markFailed = () => setFailedUrl(product.imageUrl || effectiveUrl);
  const optimized = effectiveUrl && effectiveUrl !== "/images/milk-hero.png"
    ? productImageProps(effectiveUrl)
    : null;

  return effectiveUrl ? (
    effectiveUrl === "/images/milk-hero.png" ? (
      <img
        {...milkImage}
        width={700}
        height={700}
        sizes={sizes}
        className={`${className} [object-position:var(--product-image-position)]`}
        alt={product.name}
        style={{ "--product-image-position": product.imagePosition || "center" } as CSSProperties}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
        onError={markFailed}
      />
    ) : (
      <img
        {...optimized}
        width={700}
        height={700}
        sizes={sizes}
        className={`${className} object-(--product-image-position)`}
        alt={product.name}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding={eager ? "sync" : "async"}
        style={
          {
            "--product-image-position": product.imagePosition || "center",
          } as CSSProperties
        }
        // Recover a failed image that completed before handlers were mounted.
        ref={(image) => {
          if (image?.complete && image.naturalWidth === 0) markFailed();
        }}
        onError={markFailed}
      />
    )
  ) : (
    <div
      className={`${className} flex flex-col items-center justify-center gap-2 bg-linear-to-br from-paper to-blue-light text-muted`}
    >
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-xs text-blue">
        <StorefrontIcon name="milk" size={22} strokeWidth={1.5} />
      </div>
      <span className="max-w-[85%] text-center font-serif text-sm font-medium text-ink">
        {product.name}
      </span>
    </div>
  );
}
