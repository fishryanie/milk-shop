"use client";
import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

export function FeedbackToast({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Notifications remain visible above native dialogs, including validation.
    ref.current?.showPopover?.();
  }, []);
  return (
    <div ref={ref} popover="manual" role="status" className="shop-toast fixed inset-auto bottom-[105px] left-1/2 z-100 m-0 flex -translate-x-1/2 pointer-events-none items-center gap-2.5 rounded-md border-0 bg-ink px-[18px] py-3 text-[11px] whitespace-nowrap text-white shadow-[0_3px_20px_#203d451a] mobile:bottom-[58px] mobile:w-max mobile:max-w-[calc(100vw-24px)] mobile:px-4 mobile:text-[13px] mobile:leading-[1.6] mobile:whitespace-normal mobile:[&_svg]:shrink-0">
      <Check size={17} aria-hidden="true" />
      {message}
    </div>
  );
}
