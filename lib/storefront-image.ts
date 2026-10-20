import dessert480 from "@/public/images/dessert-duo-480.webp";
import dessert960 from "@/public/images/dessert-duo-960.webp";
import dessert1280 from "@/public/images/dessert-duo-1280.webp";

export const storefrontImage = {
  src: dessert1280.src,
  srcSet: `${dessert480.src} 480w, ${dessert960.src} 960w, ${dessert1280.src} 1280w`,
};
