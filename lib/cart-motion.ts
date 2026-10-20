/** A short-lived top-layer token can fly above the native product dialog. */
export function animateCartAddition(origin: DOMRect, quantity: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!target) return;
  const destination = target.getBoundingClientRect();
  const token = document.createElement("div");
  token.className = "cart-flight";
  token.textContent = `+${quantity}`;
  token.setAttribute("aria-hidden", "true");
  token.setAttribute("popover", "manual");
  token.style.left = `${origin.left + origin.width / 2 - 22}px`;
  token.style.top = `${origin.top + origin.height / 2 - 22}px`;
  document.body.append(token);
  token.showPopover?.();

  const x = destination.left + destination.width / 2 - (origin.left + origin.width / 2);
  const y = destination.top + destination.height / 2 - (origin.top + origin.height / 2);
  const flight = token.animate([
    { transform: "translate(0, 0) scale(.65)", opacity: 0 },
    { transform: "translate(0, -18px) scale(1)", opacity: 1, offset: .18 },
    { transform: `translate(${x * .45}px, ${y * .6 - 45}px) scale(.9)`, opacity: 1, offset: .6 },
    { transform: `translate(${x}px, ${y}px) scale(.3)`, opacity: 0 },
  ], { duration: 680, easing: "cubic-bezier(.22,.68,.3,1)", fill: "forwards" });

  void flight.finished.then(() => {
    token.remove();
    if (!target.isConnected || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    target.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.09)", offset: .4 },
      { transform: "scale(1)" },
    ], { duration: 320, easing: "ease-out" });
  }, () => token.remove());
}
