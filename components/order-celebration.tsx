import type { CSSProperties } from "react";

export function OrderCelebration({ transfer }: { transfer: boolean }) {
  return (
    <section className="order-celebration" role="status">
      <div className="success-emblem" aria-hidden="true">
        <div className="success-halo" />
        {Array.from({ length: 8 }, (_, index) => (
          <i key={index} className="success-spark" style={{ "--spark-angle": `${index * 45}deg`, "--spark-delay": `${240 + index * 25}ms` } as CSSProperties} />
        ))}
        <div className="success-disc">
          <svg viewBox="0 0 48 48" fill="none" className="size-11">
            <path className="success-check" d="m13 25 7 7 15-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
          </svg>
        </div>
      </div>
      <div className="success-copy">
        <p className="font-serif text-2xl text-ink">Một chút ngọt lành đang đến!</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {transfer
            ? "Đơn đã được tạo. Bạn chuyển khoản và gửi bill bên dưới để tiệm xác nhận nhé."
            : "Tiệm đã nhận đơn và đang chuẩn bị món cho bạn. Thanh toán khi nhận hàng nhé."}
        </p>
      </div>
    </section>
  );
}
