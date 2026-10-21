export function OrderCelebration({ awaitingPayment }: { awaitingPayment: boolean }) {
  return (
    <section className="mb-4 flex items-start gap-3 border-b border-line/70 pb-4" role="status">
      <div className="success-disc grid size-11 shrink-0 place-items-center rounded-full bg-blue-light text-blue" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" className="size-7">
          <path className="success-check" d="m13 25 7 7 15-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
        </svg>
      </div>
      <div className="success-copy">
        <p className="text-sm font-medium leading-6 text-ink">Một chút ngọt lành đang đến!</p>
        <p className="mt-1 text-[13px] leading-6 text-muted">
          {awaitingPayment
            ? "Bạn chuyển khoản và gửi bill bên dưới để tiệm xác nhận nhé."
            : "Cảm ơn bạn đã đặt món. Bạn theo dõi trạng thái đơn ngay bên dưới nhé."}
        </p>
      </div>
    </section>
  );
}
