import { StorefrontIcon } from "./storefront-icon";

export function DeliveryPolicy({
  title = "Phí giao hàng",
  headingLevel = 3,
}: {
  title?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section
      aria-label="Chính sách giao hàng"
      className="rounded-xl border border-line bg-blue-light/60 px-4 py-3 landscape:py-2"
    >
      <Heading className="flex items-center gap-2 text-[13px] font-semibold text-blue">
        <StorefrontIcon name="truck" size={16} aria-hidden="true" className="shrink-0" />
        {title}
      </Heading>
      <dl className="mt-2 divide-y divide-line text-[13px] leading-5 landscape:mt-1 landscape:[&>div]:py-0.5">
        <div className="flex items-center justify-between gap-3 py-2">
          <dt>Dưới 1 km</dt>
          <dd className="font-semibold text-green">Freeship</dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2">
          <dt>Từ 1–3 km</dt>
          <dd className="font-medium">Bạn phụ shop 10k tiền ship nhé</dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2">
          <dt>Trên 3 km</dt>
          <dd className="font-medium">Bạn đặt ship đến lấy giúp shop nhé</dd>
        </div>
      </dl>
      <p className="mt-1 text-[11px] leading-[1.6] text-muted">
        Theo đường chim bay · Báo phí trước khi đặt.
      </p>
    </section>
  );
}
