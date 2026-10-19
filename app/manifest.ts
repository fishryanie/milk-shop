import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cái Tiệm Sữa",
    short_name: "Tiệm Sữa",
    lang: "vi",
    start_url: "/",
    display: "standalone",
    theme_color: "#fcfbf8",
    background_color: "#fcfbf8",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
