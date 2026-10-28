"use client";

import { useEffect, useRef, useState } from "react";

export function StoreMap({ src, title }: { src: string; title: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    // Native iframe lazy loading can still fetch Maps thousands of pixels
    // below the fold. Wait until the footer is actually close to the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={container}
      className="relative mt-2 w-full max-w-[340px] h-[145px] overflow-hidden rounded-xl border border-line bg-blue-light shadow-[0_2px_8px_#1534540a] transition-all hover:border-blue/50 hover:shadow-md"
    >
      {visible ? (
        <iframe
          src={src}
          width="100%"
          height="145"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
          className="h-full w-full block"
        />
      ) : null}
    </div>
  );
}
