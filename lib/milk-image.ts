import milk320 from "@/public/images/milk-hero-320.webp";
import milk640 from "@/public/images/milk-hero-640.webp";
import milk1080 from "@/public/images/milk-hero-1080.webp";
import milk1536 from "@/public/images/milk-hero-1536.webp";

// Prebuilt responsive assets avoid image-transformation latency on a cold request.
export const milkImage = {
  src: milk1080.src,
  srcSet: `${milk320.src} 320w, ${milk640.src} 640w, ${milk1080.src} 1080w, ${milk1536.src} 1536w`,
};

