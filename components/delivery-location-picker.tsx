"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SHOP_LOCATION } from "@/shared/commerce/delivery";
import type { Customer } from "@/shared/commerce/types";
import { Button } from "./button";

export function DeliveryLocationPicker({ location, onChange }: {
  location: Customer["location"];
  onChange: (location: Customer["location"]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const initialLocation = useRef(location);
  const [ready, setReady] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let resize: ResizeObserver | undefined;
    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      const start = initialLocation.current ?? SHOP_LOCATION;
      const map = L.map(containerRef.current, { scrollWheelZoom: false })
        .setView([start.lat, start.lng], 16);
      mapRef.current = map;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).on("tileerror", () => setError("Chưa tải được bản đồ. Bạn kiểm tra kết nối rồi mở lại nhé."))
        .on("load", () => setError(""))
        .addTo(map);
      map.on("movestart", () => {
        setMoving(true);
        onChange(null);
      });
      map.on("moveend", () => setMoving(false));
      map.on("click", (event) => map.panTo(event.latlng, { animate: false }));
      resize = new ResizeObserver(() => map.invalidateSize());
      resize.observe(containerRef.current);
      setReady(true);
    }).catch(() => {
      if (!cancelled) setError("Chưa mở được bản đồ. Bạn kiểm tra kết nối rồi mở lại nhé.");
    });
    return () => {
      cancelled = true;
      resize?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onChange]);

  return (
    <section aria-label="Chọn nơi nhận hàng" className="mb-6 space-y-3">
      <p className="text-sm leading-6 text-muted">
        Kéo bản đồ hoặc chạm vào nơi nhận để đưa ghim đến đúng địa chỉ, rồi xác nhận bên dưới.
        Bạn cũng có thể dùng phím mũi tên khi chọn bản đồ.
      </p>
      <div className="relative isolate overflow-hidden rounded-xl border border-line">
        <div ref={containerRef} aria-label="Bản đồ chọn nơi nhận, dùng phím mũi tên để di chuyển" className="h-[260px] w-full" />
        <MapPin aria-hidden="true" size={36} fill="var(--color-blue)" stroke="white" className="pointer-events-none absolute top-1/2 left-1/2 z-[500] -translate-x-1/2 -translate-y-full drop-shadow-md" />
      </div>
      {error && <p role="alert" className="text-xs leading-6 text-red">{error}</p>}
      <Button variant="secondary" type="button" disabled={!ready || moving} onClick={() => {
        const center = mapRef.current?.getCenter().wrap();
        if (center) onChange({ lat: center.lat, lng: center.lng, accuracy: 0 });
      }}>
        <MapPin size={16} /> {location ? "Đã chọn nơi nhận" : "Giao đến điểm này"}
      </Button>
    </section>
  );
}
