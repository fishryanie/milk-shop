"use client";
import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Milk, ShoppingBag } from "lucide-react";
import type { ShopProduct } from "@/shared/commerce/types";
import { milkImage } from "@/lib/milk-image";

export function ProductImage({
  product,
  className = "",
  sizes = "(max-width: 760px) 50vw, (max-width: 980px) and (max-height: 500px) 50vw, 33vw",
}: {
  product: Pick<ShopProduct, "imageUrl" | "name" | "imagePosition"> & Partial<Pick<ShopProduct, "category">>;
  className?: string;
  sizes?: string;
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
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(effectiveUrl)}
      />
    ) : (
      <Image
        width={700}
        height={700}
        sizes={sizes}
        className={`${className} object-(--product-image-position)`}
        src={effectiveUrl}
        alt={product.name}
        style={
          {
            "--product-image-position": product.imagePosition || "center",
          } as CSSProperties
        }
        loading="lazy"
        onError={() => setFailedUrl(effectiveUrl)}
      />
    )
  ) : (
    <div
      className={`${className} flex flex-col items-center justify-center gap-2 bg-linear-to-br from-paper to-blue-light text-muted`}
    >
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-xs text-blue">
        <Milk size={22} strokeWidth={1.5} />
      </div>
      <span className="max-w-[85%] text-center font-serif text-sm font-medium text-ink">
        {product.name}
      </span>
    </div>
  );
}
