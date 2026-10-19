import { Truck } from "lucide-react";

export function DeliveryPolicy({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-label="Chính sách giao hàng"
      className="rounded-xl border border-line bg-blue-light/60 p-5 text-ink mobile:p-4"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-blue">
        <Truck size={18} aria-hidden="true" className="shrink-0" />
        Tiệm giao đến bạn
      </h3>
      <dl
        className={`mt-4 grid gap-4 text-xs leading-[1.8] mobile:text-[13px] ${compact ? "" : "grid-cols-3 mobile:grid-cols-1"}`}
      >
        <div>
          <dt className="font-semibold">Trong phạm vi 1km</dt>
          <dd className="mt-1 text-muted">
            Miễn phí giao hàng cho đơn từ 60.000đ.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Dưới 3km</dt>
          <dd className="mt-1 text-muted">
            Với các đơn không thuộc diện miễn phí, bạn hỗ trợ tiệm 10.000đ phí ship nhé.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Trên 3km</dt>
          <dd className="mt-1 text-muted">
            Bạn yêu book ship ngoài đến lấy giúp tiệm nhé.
          </dd>
        </div>
      </dl>
      <p className="mt-4 border-t border-line pt-3 text-xs leading-[1.8] text-muted">
        Tiệm sẽ xác nhận phí giao hàng theo địa chỉ nhận hàng của bạn.
      </p>
    </section>
  );
}
