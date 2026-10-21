// Development hosts are separate from the configured public storefront origin.
export function isLocalDevelopmentOrigin(
  origin: string | null,
  requestHost: string | null,
  environment: string | undefined,
) {
  if (environment !== "development" || !origin) return false;
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return (
      ["localhost", "127.0.0.1"].includes(url.hostname) ||
      url.hostname.startsWith("192.168.") ||
      url.hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(url.hostname) ||
      // mDNS names must match the request host and port, not any .local origin.
      (url.hostname.endsWith(".local") && url.host === requestHost)
    );
  } catch {
    return false;
  }
}
