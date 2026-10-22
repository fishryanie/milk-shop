"use client";
import { Button } from "./button";
import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

// Keep the native dialog (focus trap + scroll lock) alive through its exit.
export function useModalMotion(onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cleanupExit = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => cleanupExit.current?.(), []);

  function dismiss(after = onClose) {
    const dialog = dialogRef.current;
    if (!dialog || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      after();
      return;
    }
    if (dialog.dataset.closing === "true") return;
    const current = getComputedStyle(dialog);
    dialog.style.setProperty("--modal-exit-from", current.transform);
    dialog.style.setProperty("--modal-exit-from-opacity", current.opacity);
    dialog.dataset.closing = "true";
    dialog.inert = true;
    const finish = () => {
      cleanupExit.current?.();
      cleanupExit.current = undefined;
      after();
    };
    const onEnd = (event: AnimationEvent) => {
      if (event.target === dialog && !event.pseudoElement && event.animationName === "modal-exit") finish();
    };
    dialog.addEventListener("animationend", onEnd);
    // Fallback for browsers that skip animationend; duration follows the CSS breakpoint.
    const duration = Math.max(...getComputedStyle(dialog).animationDuration.split(",").map((value) =>
      parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000),
    ));
    const timer = setTimeout(finish, duration + 80);
    cleanupExit.current = () => {
      clearTimeout(timer);
      dialog.removeEventListener("animationend", onEnd);
    };
  }

  return { dialogRef, dismiss };
}

export function Modal({
  title,
  eyebrow,
  onClose,
  children,
  wide = false,
  busy = false,
  compact = false,
  className = "",
  footer,
  dialogRef,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  busy?: boolean;
  compact?: boolean;
  className?: string;
  footer?: ReactNode;
  dialogRef?: RefObject<HTMLDialogElement | null>;
}) {
  const motion = useModalMotion(onClose);
  const ref = dialogRef ?? motion.dialogRef;
  const dismiss = dialogRef ? onClose : () => motion.dismiss();
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.setAttribute("data-motion", "preparing");
    dialog?.showModal();
    // Start after the dialog joins the top layer, including mobile Safari.
    let enterFrame = requestAnimationFrame(() => {
      enterFrame = requestAnimationFrame(() => {
        if (dialog?.dataset.closing !== "true") dialog?.setAttribute("data-motion", "enter");
      });
    });
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const lockClasses = [
      "overflow-hidden",
      "fixed",
      "w-full",
      "top-[var(--scroll-lock-y)]",
      "left-[var(--scroll-lock-x)]",
    ];
    const addedClasses = lockClasses.filter(
      (name) => !body.classList.contains(name),
    );
    const oldX = body.style.getPropertyValue("--scroll-lock-x");
    const oldY = body.style.getPropertyValue("--scroll-lock-y");
    body.style.setProperty("--scroll-lock-x", `${-scrollX}px`);
    body.style.setProperty("--scroll-lock-y", `${-scrollY}px`);
    body.classList.add(...addedClasses);
    let frame = 0;
    const viewport = window.visualViewport;
    const keepFieldVisible = () => {
      const field = document.activeElement;
      const scroll = dialog?.querySelector("[data-modal-scroll]");
      if (
        !(field instanceof HTMLElement) ||
        !field.matches("input, textarea, select") ||
        !scroll?.contains(field)
      )
        return;
      const fieldBounds = field.getBoundingClientRect();
      const bounds = scroll.getBoundingClientRect();
      const padding = Math.max(
        0,
        Math.min(16, (bounds.height - fieldBounds.height) / 2),
      );
      if (fieldBounds.bottom > bounds.bottom - padding)
        scroll.scrollTop += fieldBounds.bottom - bounds.bottom + padding;
      else if (fieldBounds.top < bounds.top + padding)
        scroll.scrollTop -= bounds.top - fieldBounds.top + padding;
    };
    const resize = () => {
      // Pinch zoom remains available; only follow an unzoomed visual viewport.
      if (viewport && Math.abs(viewport.scale - 1) > 0.05) return;
      const height = viewport?.height ?? window.innerHeight;
      dialog?.setAttribute("data-compact", String(height < 540));
      dialog?.style.setProperty("--sheet-height", `${height}px`);
      dialog?.style.setProperty(
        "--sheet-offset",
        `${Math.max(0, window.innerHeight - height - (viewport?.offsetTop ?? 0))}px`,
      );
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(keepFieldVisible);
    };
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    window.addEventListener("resize", resize);
    dialog?.addEventListener("focusin", resize);
    return () => {
      cancelAnimationFrame(enterFrame);
      cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
      window.removeEventListener("resize", resize);
      dialog?.removeEventListener("focusin", resize);
      dialog?.close();
      body.classList.remove(...addedClasses);
      if (oldX) body.style.setProperty("--scroll-lock-x", oldX);
      else body.style.removeProperty("--scroll-lock-x");
      if (oldY) body.style.setProperty("--scroll-lock-y", oldY);
      else body.style.removeProperty("--scroll-lock-y");
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
  }, [ref]);
  return (
    <dialog
      ref={ref}
      className={`shop-modal group/sheet m-auto w-[calc(100%-36px)] max-w-[590px] max-h-[min(90dvh,var(--sheet-height,90dvh))] overflow-hidden overscroll-contain rounded-[13px] border-0 bg-paper p-0 text-ink shadow-[0_20px_90px_#014ba640] backdrop:bg-[#1534547a] backdrop:backdrop-blur-[5px] mobile:fixed mobile:inset-x-0 mobile:top-auto mobile:bottom-[var(--sheet-offset,0px)] mobile:m-0 mobile:w-full mobile:max-w-full mobile:max-h-[calc(var(--sheet-height,100dvh)-env(safe-area-inset-top,0px)-8px)] mobile:rounded-[18px_18px_0_0] ${wide ? "max-w-[700px] mobile:max-w-full" : ""} ${className}`}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) dismiss();
      }}
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className={compact ? "relative z-2 flex shrink-0 items-center justify-between gap-2 border-b border-line bg-paper px-5 py-2 mobile:pt-3 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:before:absolute mobile:before:top-1 mobile:before:left-[calc(50%-14px)] mobile:before:h-[3px] mobile:before:w-7 mobile:before:rounded-full mobile:before:bg-line [&_h2]:text-[22px] [&_h2]:leading-tight [&>div]:min-w-0" : "relative top-0 z-2 flex shrink-0 items-center justify-between gap-[18px] border-b border-line bg-paper px-7 pt-[25px] pb-[21px] [&_h2]:text-[28px] [&_p]:mb-[9px] [&_p]:text-[8px] mobile:gap-2 mobile:pt-5 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pb-4 mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:before:absolute mobile:before:top-[7px] mobile:before:left-[calc(50%-18px)] mobile:before:h-1 mobile:before:w-9 mobile:before:rounded-[10px] mobile:before:bg-line mobile:before:content-[''] mobile:[&>div]:min-w-0 mobile:[&_h2]:text-[27px] mobile:[&_h2]:leading-[1.25] mobile:[&_h2]:[overflow-wrap:anywhere] mobile:[&_p]:mb-[7px] mobile:[&_p]:text-[10px] mobile:[&_p]:leading-[1.5] mobile:[&_p]:tracking-[1.1px] mobile:[&_button]:self-start tiny:[&_h2]:text-2xl landscape:py-3 landscape:[&_p]:hidden landscape:[&_h2]:text-[23px] mobile:group-data-[compact=true]/sheet:py-3 mobile:group-data-[compact=true]/sheet:[&_p]:hidden mobile:group-data-[compact=true]/sheet:[&_h2]:text-[23px]"}>
          <div>
            {eyebrow && (
              <p className="mb-2.5 text-[9px] font-semibold tracking-[2px] text-blue uppercase mobile:mb-2 mobile:text-[10px] mobile:tracking-[1.4px]">
                {eyebrow}
              </p>
            )}
            <h2
              id={id}
              className="font-serif text-[37px] leading-[1.2] font-normal tracking-[-.7px] mobile:text-[31px]"
            >
              {title}
            </h2>
          </div>
          <Button
            variant="icon"
            onClick={dismiss}
            disabled={busy}
            aria-label="Đóng"
          >
            <X size={20} />
          </Button>
        </header>
        <div
          data-modal-scroll
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] mobile:[scroll-padding-block:16px] mobile:last:pb-[env(safe-area-inset-bottom,0px)]"
        >
          {children}
        </div>
        {footer && (
          <footer className={compact ? "shrink-0 border-t border-line bg-paper px-5 py-3 mobile:pt-2.5 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pb-[calc(10px+env(safe-area-inset-bottom,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))]" : "shrink-0 border-t border-line bg-paper px-7 py-[18px] shadow-[0_-6px_20px_#15345406] mobile:pt-3.5 mobile:pr-[max(12px,env(safe-area-inset-right,0px))] mobile:pb-[calc(14px+env(safe-area-inset-bottom,0px))] mobile:pl-[max(12px,env(safe-area-inset-left,0px))] mobile:group-data-[compact=true]/sheet:pt-2.5 mobile:group-data-[compact=true]/sheet:pb-[calc(10px+env(safe-area-inset-bottom,0px))]"}>
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
