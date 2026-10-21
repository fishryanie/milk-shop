import { Truck } from "lucide-react";

export function DeliveryPolicy({ compact = false }: { compact?: boolean }) {
  if (compact) return (
    <section aria-label="Chính sách giao hàng" className="rounded-xl border border-line bg-blue-light/60 px-4 py-3 landscape:py-2">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-blue">
        <Truck size={16} aria-hidden="true" className="shrink-0" />
        Phí giao hàng
      </h3>
      <dl className="mt-2 divide-y divide-line text-[13px] leading-5 landscape:mt-1 landscape:[&>div]:py-0.5">
        <div className="flex items-center justify-between gap-3 py-2">
          <dt>Dưới 1 km</dt>
          <dd className="font-semibold text-green">Freeship</dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2">
          <dt>Từ 1–3 km</dt>
          <dd className="font-semibold">10.000đ</dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2">
          <dt>Trên 3 km</dt>
          <dd className="font-semibold">Bạn tự book ship</dd>
        </div>
      </dl>
      <p className="mt-1 text-[11px] leading-[1.6] text-muted">
        Theo đường chim bay · Báo phí trước khi đặt.
      </p>
    </section>
  );
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
        className="mt-4 grid grid-cols-3 gap-4 text-xs leading-[1.8] mobile:grid-cols-1 mobile:text-[13px]"
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
