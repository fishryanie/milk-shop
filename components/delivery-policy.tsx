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
          <dt className="font-semibold">Dưới 1km</dt>
          <dd className="mt-1 text-muted">
            Gần tiệm một chút, được thương thêm một chút: freeship cho bạn yêu!
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Từ 1–3km</dt>
          <dd className="mt-1 text-muted">
            Bạn phụ tiệm 10.000đ phí ship, tiệm mang món ngon đến tận tay nhé.
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
        Tiệm tính khoảng cách theo đường chim bay từ vị trí bạn ghim và báo phí để bạn xác nhận trước khi lên đơn.
      </p>
    </section>
  );
}
