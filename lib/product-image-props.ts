import {
  storefrontDeviceSizes,
  storefrontImageQuality,
  storefrontImageSizes,
} from "./storefront-image-config";

const widths = [...storefrontImageSizes, ...storefrontDeviceSizes];

// Use the app's image optimization endpoint without shipping the Image client
// component. The server still controls formats, allowed sources and caching.
export function productImageProps(source: string) {
  if (/^(?:data:|blob:)/i.test(source) || /\.svg(?:[?#].*)?$/i.test(source))
    return { src: source };
  const url = (width: number) =>
    `/_next/image?url=${encodeURIComponent(source)}&w=${width}&q=${storefrontImageQuality}`;
  return {
    src: url(widths[widths.length - 1]),
    srcSet: widths.map((width) => `${url(width)} ${width}w`).join(", "),
  };
}
