// Keep navigation separate from policy prose so the storefront stays lightweight.
export const policyPageLinks = [
  {
    path: "/terms-and-conditions",
    label: "Điều khoản giao dịch",
    title: "Điều khoản và điều kiện giao dịch | Cái Tiệm Sữa",
    description: "Điều kiện đặt hàng, xác nhận đơn và quyền, nghĩa vụ của người mua và Cái Tiệm Sữa.",
  },
  {
    path: "/payment-policy",
    label: "Chính sách thanh toán",
    title: "Chính sách thanh toán | Cái Tiệm Sữa",
    description: "Hướng dẫn thanh toán COD, chuyển khoản QR, đối soát giao dịch và hoàn tiền tại Cái Tiệm Sữa.",
  },
  {
    path: "/shipping-policy",
    label: "Vận chuyển và giao hàng",
    title: "Chính sách vận chuyển và giao hàng | Cái Tiệm Sữa",
    description: "Phạm vi giao hàng, phí theo khoảng cách, cách nhận hàng và thời gian giao do tiệm xác nhận.",
  },
  {
    path: "/return-refund-policy",
    label: "Đổi trả và hoàn tiền",
    title: "Chính sách đổi trả và hoàn tiền | Cái Tiệm Sữa",
    description: "Điều kiện, thời điểm phản ánh, quy trình và chi phí đổi trả, hoàn tiền đối với món tại Cái Tiệm Sữa.",
  },
  {
    path: "/pricing-policy",
    label: "Giá và khuyến mãi",
    title: "Chính sách giá và khuyến mãi | Cái Tiệm Sữa",
    description: "Cách niêm yết giá món, size, topping, phí giao hàng và điều kiện áp dụng ưu đãi tại Cái Tiệm Sữa.",
  },
  {
    path: "/complaint-policy",
    label: "Giải quyết khiếu nại",
    title: "Tiếp nhận và giải quyết khiếu nại | Cái Tiệm Sữa",
    description: "Kênh liên hệ và các bước tiếp nhận, xác minh, phản hồi khiếu nại về đơn hàng, thanh toán và dữ liệu.",
  },
  {
    path: "/cookie-policy",
    label: "Chính sách cookie",
    title: "Chính sách cookie | Cái Tiệm Sữa",
    description: "Cookie phiên mua hàng, giỏ hàng trên trình duyệt, dịch vụ bản đồ và cách quản lý dữ liệu thiết bị.",
  },
] as const;

export type PolicyPath = (typeof policyPageLinks)[number]["path"];

export const policyNavigationLinks = [
  { path: "/about", label: "Giới thiệu & thông tin đơn vị bán hàng" },
  { path: "/contact", label: "Liên hệ & chăm sóc khách hàng" },
  { path: "/privacy", label: "Chính sách bảo mật" },
  ...policyPageLinks,
] as const;
