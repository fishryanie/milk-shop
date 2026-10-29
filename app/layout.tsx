import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { StorefrontFonts } from "@/components/storefront-fonts";
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  siteOpenGraph,
} from "@/lib/site-content";

const sans = localFont({
  src: [
    { path: "../public/fonts/be-vietnam-regular-optimized.woff2", weight: "400" },
    { path: "../public/fonts/be-vietnam-semibold-optimized.woff2", weight: "600 800" },
  ],
  variable: "--font-be-vietnam",
  display: "swap",
  preload: false,
});
const serif = localFont({
  src: "../public/fonts/dm-serif-optimized.woff2",
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: siteOpenGraph,
  icons: {
    icon: [
      {
        url: "/icons/favicon-32.png?v=milk-logo",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: {
      url: "/icons/apple-touch-icon.png?v=milk-logo",
      sizes: "180x180",
      type: "image/png",
    },
  },
  appleWebApp: {
    capable: true,
    title: "Cái Tiệm Sữa",
    statusBarStyle: "black-translucent",
  },
};
export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#f5faff",
  colorScheme: "light",
  viewportFit: "cover",
  width: "device-width",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${sans.variable} ${serif.variable} sf-root`}
      style={{ "--font-sans-initial": sans.style.fontFamily.split(",").slice(1).join(",") || "system-ui" } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body
        className="sf-body"
        suppressHydrationWarning
      >
        <StorefrontFonts family={sans.style.fontFamily.split(",")[0]} />
        {children}
      </body>
    </html>
  );
}
