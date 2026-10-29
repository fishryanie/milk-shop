import type { SVGProps } from "react";

const storefrontIconNames = [
  "arrow-down",
  "arrow-right",
  "arrow-up-right",
  "check",
  "clock-3",
  "droplet",
  "heart",
  "help-circle",
  "leaf",
  "map-pin",
  "milk",
  "phone",
  "plus",
  "shopping-bag",
  "sparkles",
  "truck",
  "shopping-cart-plus",
  "snowflake",
  "snowcap",
  "snowbank",
] as const;

// Reuse the original paths from one cacheable SVG instead of repeating them
// in every product card. The outer SVG retains size, color and hover styles.
export function StorefrontIcon({
  name,
  size = 24,
  strokeWidth = name === "snowcap" || name === "snowbank" ? 1 : 2,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: (typeof storefrontIconNames)[number];
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <use href={`/icons/storefront.svg#${name}`} />
    </svg>
  );
}
