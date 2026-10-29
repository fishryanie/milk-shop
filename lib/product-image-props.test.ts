import { expect, test } from "bun:test";
import { productImageProps } from "./product-image-props";

test("embedded photos and SVG images do not go through the raster optimizer", () => {
  for (const source of ["data:image/png;base64,AA==", "blob:https://caitiemsua.com/photo", "https://example.com/logo.svg?v=2"])
    expect(productImageProps(source)).toEqual({ src: source });
});

test("optimizer URLs preserve Unicode, query parameters and content versions", () => {
  for (const source of ["/media/products/example?v=abc123", "https://example.com/sữa.webp?variant=1&label=a+b"])
    expect(new URL(productImageProps(source).src, "https://caitiemsua.com").searchParams.get("url")).toBe(source);
});
