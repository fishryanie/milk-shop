"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./client";
import { calculateCart } from "@/shared/commerce/cart";
import type { CartLine, Quote, ShopProduct, ShopSettings } from "@/shared/commerce/types";

const QUOTE_MAX_AGE = 10_000;
const QUOTE_DEBOUNCE = 150;
type ConfirmedQuote = {
  cart: CartLine[];
  products: ShopProduct[];
  settings: ShopSettings;
  quote: Quote;
  checkedAt: number;
};

export function useCartQuote(
  cart: CartLine[],
  products: ShopProduct[],
  settings: ShopSettings,
  enabled: boolean,
) {
  const [confirmed, setConfirmed] = useState<ConfirmedQuote | null>(null);
  const cache = useRef<ConfirmedQuote | null>(null);
  const [failure, setFailure] = useState<{ cart: CartLine[]; message: string } | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refreshQuote = useCallback(() => {
    cache.current = null;
    setFailure(null);
    setRefreshVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !cart.length) return;
    const cached = cache.current;
    if (
      cached?.cart === cart && cached.products === products && cached.settings === settings &&
      Date.now() - cached.checkedAt < QUOTE_MAX_AGE
    ) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const quote = await api<Quote>("/api/cart", {
          method: "POST",
          body: JSON.stringify(cart),
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const result = { cart, products, settings, quote, checkedAt: Date.now() };
        cache.current = result;
        setConfirmed(result);
        setFailure(null);
      } catch (error) {
        if (!controller.signal.aborted)
          setFailure({
            cart,
            message: error instanceof Error ? error.message : "Chưa kiểm tra được giỏ hàng.",
          });
      }
    }, QUOTE_DEBOUNCE);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cart, products, settings, enabled, refreshVersion]);

  const quote = useMemo<Quote | null>(() => {
    if (!cart.length) return null;
    if (confirmed?.cart === cart && confirmed.products === products && confirmed.settings === settings)
      return confirmed.quote;
    const preview = calculateCart(cart, products, settings);
    // A preview can open delivery details; checkout always obtains a fresh server digest.
    return { ...preview, deliveryFee: 0, total: preview.subtotal, digest: "" };
  }, [cart, products, settings, confirmed]);

  return {
    quote,
    quoteError: failure?.cart === cart ? failure.message : "",
    refreshQuote,
  };
}
