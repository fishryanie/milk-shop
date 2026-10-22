import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

const sans = localFont({
  src: [
    { path: "../public/fonts/be-vietnam-regular.woff2", weight: "400" },
    { path: "../public/fonts/be-vietnam-semibold.woff2", weight: "600 800" },
  ],
  variable: "--font-be-vietnam",
  display: "swap",
});
const serif = localFont({
  src: "../public/fonts/dm-serif.woff2",
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.STOREFRONT_ORIGIN || "https://caitiemsua.com"
  ),
  title: "Món từ sữa tươi nguyên chất",
  description:
    "Sữa tuyết, bánh flan và các món từ sữa tươi nguyên chất, tự tay nấu mới mỗi ngày. Đặt món và theo dõi đơn hàng trực tiếp.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Cái Tiệm Sữa — Chuẩn vị sữa nhà làm",
    description:
      "Sữa tuyết, bánh flan và các món từ sữa tươi nguyên chất, tự tay nấu mới mỗi ngày. Đặt món và theo dõi đơn hàng trực tiếp.",
    type: "website",
    locale: "vi_VN",
    siteName: "Cái Tiệm Sữa",
    images: [
      {
        url: "/icons/app-icon.png",
        width: 1024,
        height: 1024,
        alt: "Cái Tiệm Sữa",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png?v=milk-logo", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png?v=milk-logo", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/icons/apple-touch-icon.png?v=milk-logo", sizes: "180x180", type: "image/png" },
  },
  appleWebApp: {
    capable: true,
    title: "Cái Tiệm Sữa",
    statusBarStyle: "black-translucent",
  },
};
export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
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
      className={`${sans.variable} ${serif.variable} scroll-smooth scroll-pt-[110px] bg-paper [-webkit-text-size-adjust:100%] [text-size-adjust:100%] motion-reduce:scroll-auto mobile:scroll-pt-[calc(86px+env(safe-area-inset-top,0px))]`}
      suppressHydrationWarning
    >
      <body
        className="m-0 min-h-dvh bg-paper font-sans text-sm text-ink antialiased selection:bg-ice [&_:is(button,a,input,textarea)]:focus-visible:outline-3 [&_:is(button,a,input,textarea)]:focus-visible:outline-sky [&_:is(button,a,input,textarea)]:focus-visible:outline-offset-4 [&_main]:overflow-clip mobile:text-[15px] mobile:before:fixed mobile:before:inset-x-0 mobile:before:top-0 mobile:before:z-21 mobile:before:h-[env(safe-area-inset-top,0px)] mobile:before:bg-paper mobile:before:content-[''] mobile:before:pointer-events-none mobile:[&_main]:pr-[env(safe-area-inset-right,0px)] mobile:[&_main]:pl-[env(safe-area-inset-left,0px)] touch:[&_input:not([type=checkbox]):not([type=radio])]:text-[max(16px,1em)] touch:[&_textarea]:text-[max(16px,1em)] touch:[&_select]:text-[max(16px,1em)] motion-reduce:[&_*]:animate-none! motion-reduce:[&_*]:transition-none! motion-reduce:[&_*::before]:animate-none! motion-reduce:[&_*::before]:transition-none! motion-reduce:[&_*::after]:animate-none! motion-reduce:[&_*::after]:transition-none!"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
