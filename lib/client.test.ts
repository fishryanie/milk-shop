import { expect, test } from "bun:test";
import { z } from "zod";
import { newCheckoutKey } from "./client";

test("tạo mã đặt hàng hợp lệ trên HTTP LAN không có crypto.randomUUID", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const originalCrypto = globalThis.crypto;
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto) },
  });
  try {
    const first = newCheckoutKey();
    const second = newCheckoutKey();
    expect(z.uuid().safeParse(first).success).toBe(true);
    expect(z.uuid().safeParse(second).success).toBe(true);
    expect(first).not.toBe(second);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "crypto", descriptor);
  }
});
