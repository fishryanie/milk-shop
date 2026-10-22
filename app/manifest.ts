import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cái Tiệm Sữa",
    short_name: "Tiệm Sữa",
    lang: "vi",
    start_url: "/",
    display: "standalone",
    theme_color: "#f5faff",
    background_color: "#f5faff",
    icons: [
      { src: "/icons/icon-192.png?v=milk-logo", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png?v=milk-logo", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png?v=milk-logo", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
