import dessert240 from "@/public/images/dessert-hero-240.webp";
import dessert320 from "@/public/images/dessert-hero-320.webp";
import dessert480 from "@/public/images/dessert-hero-480.webp";
import dessert640 from "@/public/images/dessert-hero-640.webp";
import dessert960 from "@/public/images/dessert-hero-960.webp";
import dessert1280 from "@/public/images/dessert-hero-1280.webp";
import dessertAvif240 from "@/public/images/dessert-hero-240.avif";
import dessertAvif320 from "@/public/images/dessert-hero-320.avif";
import dessertAvif480 from "@/public/images/dessert-hero-480.avif";
import dessertAvif640 from "@/public/images/dessert-hero-640.avif";
import dessertAvif960 from "@/public/images/dessert-hero-960.avif";
import dessertAvif1280 from "@/public/images/dessert-hero-1280.avif";
import logo174 from "@/public/images/store-logo-174.webp";
import logo228 from "@/public/images/store-logo-228.webp";
import logo348 from "@/public/images/store-logo-348.webp";
import logo456 from "@/public/images/store-logo-456.webp";
import logo684 from "@/public/images/store-logo-684.webp";

export const storefrontImage = {
  src: dessert480.src,
  srcSet: [dessert240, dessert320, dessert480, dessert640, dessert960, dessert1280]
    .map((image) => `${image.src} ${image.width}w`)
    .join(", "),
  // Match the mobile overhang and the desktop object-contain height cap.
  sizes: "(max-width: 980px) and (max-height: 500px) and (orientation: landscape) 230px, (max-width: 359px) 151px, (max-width: 760px) calc(40.12vw + 40.56px), (max-width: 1050px) 394px, 447px",
};

export const storefrontLogo = {
  src: logo228.src,
  srcSet: [logo174, logo228, logo348, logo456, logo684]
    .map((image) => `${image.src} ${image.width}w`)
    .join(", "),
  width: logo228.width,
  height: logo228.height,
  sizes: "(max-width: 359px) 156px, (max-width: 760px) 174px, (max-width: 980px) and (max-height: 500px) 174px, 228px",
};

// Turbopack emits these pre-encoded assets, but cannot read AVIF dimensions.
const avifVariants = [[dessertAvif240, 240], [dessertAvif320, 320], [dessertAvif480, 480], [dessertAvif640, 640], [dessertAvif960, 960], [dessertAvif1280, 1280]] as const;
export const storefrontAvifImage = {
  src: dessertAvif480.src,
  srcSet: avifVariants
    .map(([image, width]) => `${image.src} ${width}w`)
    .join(", "),
  sizes: storefrontImage.sizes,
};
