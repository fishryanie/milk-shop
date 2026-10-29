import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { storefrontDeviceSizes, storefrontImageQuality, storefrontImageSizes } from "./lib/storefront-image-config";

// Wi-Fi addresses can change. Allow only this machine's current IPv4 hosts
// for development assets instead of keeping a stale, hard-coded LAN address.
const localAddresses = Object.values(networkInterfaces()).flatMap((addresses) =>
  (addresses ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address),
);
const config: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.local",
    ...new Set(localAddresses),
  ],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [storefrontImageQuality, 75],
    imageSizes: storefrontImageSizes,
    deviceSizes: storefrontDeviceSizes,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/**", search: "" }],
  },
  serverExternalPackages: ["mongodb", "sharp"],
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' ws: wss:; frame-src 'self' https://maps.google.com https://www.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};
export default config;
