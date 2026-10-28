import type { Metadata } from "next";
import { defaultSettings, type ShopSettings } from "@/shared/commerce/types";

export const SITE_URL = "https://caitiemsua.com";
export const SITE_NAME = "Cái Tiệm Sữa";
export const SITE_TITLE =
  "Cái Tiệm Sữa — Sữa tuyết, sữa tươi & bánh flan tại TP.HCM";
export const SITE_DESCRIPTION =
  "Cái Tiệm Sữa tại An Hội Đông, TP.HCM: sữa tuyết Vân Nam, sữa tươi và bánh flan. Xem thực đơn, chọn size, topping và đặt giao hàng trực tiếp tại caitiemsua.com.";
export const siteOpenGraph = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  url: `${SITE_URL}/`,
  type: "website" as const,
  locale: "vi_VN",
  siteName: SITE_NAME,
  images: [
    {
      url: `${SITE_URL}/icons/app-icon.png`,
      width: 1024,
      height: 1024,
      alt: SITE_NAME,
    },
  ],
};
// Published contact details verified on caitiemsua.com, 2026-10-28.
export const publicFallbackSettings: ShopSettings = {
  ...defaultSettings,
  phone: "0767271126",
};

export const homepageSections = [
  {
    heading: "Sữa tuyết, sữa tươi và bánh flan tại Cái Tiệm Sữa",
    paragraphs: [
      "Cái Tiệm Sữa là tiệm bán các món từ sữa tại An Hội Đông, Thành phố Hồ Chí Minh. Trên caitiemsua.com, bạn có thể xem thực đơn sữa tuyết Vân Nam, sữa tươi nguyên chất và bánh flan, đọc mô tả từng món, xem giá bán bằng đồng Việt Nam và lựa chọn món phù hợp với mình. Mỗi thẻ món hiển thị đơn vị bán và giá; món có nhiều kích cỡ sẽ hiển thị giá từ mức thấp nhất. Danh sách, giá, lựa chọn topping và tình trạng còn món được cập nhật theo thực đơn của tiệm.",
      "Sữa tuyết có các lựa chọn kích cỡ và topping ngay trong phần chi tiết món. Với sữa tươi và bánh flan, bạn nên kiểm tra đơn vị bán, số lượng và mô tả trước khi thêm vào giỏ. Hình ảnh giúp bạn hình dung món ăn; các lựa chọn đang bán và giá xác nhận trong giỏ là thông tin dùng để đặt hàng. Nếu cần hỏi về thành phần, dị ứng, cách bảo quản hoặc một yêu cầu riêng, hãy gọi tiệm trước khi xác nhận đơn để được tư vấn cho đúng món.",
    ],
  },
  {
    heading: "Chọn món và theo dõi đơn hàng",
    paragraphs: [
      "Bạn không cần đăng ký tài khoản để mua hàng. Chọn một món trong thực đơn, mở chi tiết để xem các lựa chọn đang có, chọn số lượng rồi thêm vào giỏ. Trong giỏ hàng, bạn có thể sửa món, thay đổi số lượng hoặc bỏ món trước khi tiếp tục. Tiệm kiểm tra lại giá và tình trạng món khi xác nhận, vì vậy hãy đọc tổng tiền mới nhất thay vì dựa vào một ảnh chụp thực đơn hay giá đã lưu từ lần ghé trước.",
      "Ở bước giao hàng, điền tên, số điện thoại, địa chỉ nhận và ghi chú cần thiết. Website sẽ báo phí trước khi bạn gửi đơn. Bạn có thể chọn thanh toán khi nhận hàng hoặc chuyển khoản theo hướng dẫn hiển thị ở bước thanh toán. Với chuyển khoản, kiểm tra số tiền, ghi mã đơn và gửi ảnh xác nhận khi được yêu cầu. Sau khi đặt, mở mục Đơn của tôi trên cùng trình duyệt để xem trạng thái; giữ mã đơn để tiệm dễ kiểm tra khi bạn cần hỗ trợ.",
      "Giỏ được lưu trên trình duyệt để bạn có thể quay lại chỉnh sửa. Món đã thêm vào giỏ chưa phải một đơn được tiệm tiếp nhận: hãy hoàn tất bước xác nhận và kiểm tra mã đơn sau khi gửi. Khi chia sẻ thiết bị với người khác, lưu ý rằng dữ liệu phiên mua hàng và giỏ có thể vẫn còn trên trình duyệt đó. Bạn có thể tìm hiểu cách quản lý các dữ liệu này trong trang Quyền riêng tư.",
    ],
  },
  {
    heading: "Giao hàng quanh tiệm và hỗ trợ trực tiếp",
    paragraphs: [
      "Phí giao được tính theo khoảng cách đường chim bay từ tiệm đến vị trí nhận. Đơn dưới 1 km được miễn phí giao; từ 1 đến 3 km có phí 10.000 đồng. Với địa chỉ trên 3 km, bạn chủ động đặt dịch vụ giao hàng đến lấy giúp tiệm. Hãy kiểm tra vị trí và phí trên màn hình xác nhận vì địa chỉ gõ vào có thể cần bổ sung vị trí trên bản đồ. Thời gian giao sẽ được tiệm liên hệ xác nhận; website không cam kết một thời gian đến cố định cho mọi địa chỉ.",
      "Bạn có thể xem địa chỉ, số điện thoại và đường dẫn bản đồ ở phần Liên hệ ngay bên dưới hoặc trên trang Liên hệ của website. Trước khi đến lấy hay nhờ người giao đến, hãy liên hệ để tiệm xác nhận món và thời gian chuẩn bị. Trang Giới thiệu giải thích cách đặt món tại tiệm; trang Quyền riêng tư cho biết dữ liệu nào được dùng khi mua hàng. Nếu thực đơn chưa tải được, thông tin giới thiệu và các trang hỗ trợ vẫn đọc được mà không cần bật JavaScript; thao tác giỏ hàng và gửi đơn cần JavaScript để kiểm tra với hệ thống.",
    ],
  },
];

export type InfoPath = "/about" | "/contact" | "/privacy";
export type ContentSection = { heading: string; paragraphs: string[] };
export const pageDefinitions = {
  "/about": {
    title: "Giới thiệu Cái Tiệm Sữa",
    description:
      "Tìm hiểu Cái Tiệm Sữa, thực đơn sữa tuyết, sữa tươi, bánh flan và cách đặt món tại TP.HCM.",
  },
  "/contact": {
    title: "Liên hệ Cái Tiệm Sữa",
    description:
      "Địa chỉ, số điện thoại và hướng dẫn liên hệ Cái Tiệm Sữa tại An Hội Đông, TP.HCM.",
  },
  "/privacy": {
    title: "Quyền riêng tư tại Cái Tiệm Sữa",
    description:
      "Thông tin về dữ liệu đặt hàng, vị trí giao hàng, cookie phiên mua hàng và cách yêu cầu hỗ trợ về dữ liệu.",
  },
} as const;

// These dates describe actual content changes, rather than sitemap request time.
export const indexablePages = ["/", "/about", "/contact", "/privacy"] as const;
export const CONTENT_UPDATED = "2026-10-28";

export function pageMetadata(path: InfoPath): Metadata {
  const page = pageDefinitions[path];
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      types: { "text/markdown": `${SITE_URL}${path}.md` },
    },
    openGraph: {
      ...siteOpenGraph,
      title: page.title,
      description: page.description,
      url: `${SITE_URL}${path}`,
    },
  };
}

export function infoSections(
  path: InfoPath,
  settings: ShopSettings,
): ContentSection[] {
  if (path === "/about")
    return [
      homepageSections[0],
      homepageSections[1],
      {
        heading: "Ghé tiệm và tìm thông tin chính thức",
        paragraphs: [
          `Địa chỉ tiệm: ${settings.address}. Bạn có thể liên hệ qua số ${settings.phone} để hỏi về món đang bán, thành phần hoặc thời gian chuẩn bị. Website chính thức của Cái Tiệm Sữa là ${SITE_URL}; thông tin liên hệ trên trang Liên hệ và giá xác nhận trong giỏ giúp bạn đối chiếu trước khi mua.`,
          "Việc nhận đơn phụ thuộc trạng thái của tiệm và tình trạng từng món. Website sẽ kiểm tra lại giỏ trước khi bạn gửi đơn; nếu một món vừa hết hoặc có thay đổi giá, hãy xem thông báo và điều chỉnh lựa chọn. Tiệm sẽ liên hệ xác nhận thời gian giao với bạn. Các yêu cầu về ăn kiêng, dị ứng hoặc nguyên liệu nên được trao đổi trực tiếp trước khi đặt.",
        ],
      },
    ];
  if (path === "/contact")
    return [
      {
        heading: "Địa chỉ và số điện thoại",
        paragraphs: [
          `Cái Tiệm Sữa ở ${settings.address}, Thành phố Hồ Chí Minh, Việt Nam. Gọi ${settings.phone} để hỏi về thực đơn, tình trạng món, việc đến lấy hàng hoặc một đơn bạn đã đặt trên ${SITE_URL}. Đường dẫn bản đồ trên trang này giúp bạn xác định vị trí trước khi đi hoặc gửi thông tin cho người giao hàng.`,
          "Tiệm sẽ liên hệ xác nhận thời gian giao. Trước khi tới lấy hoặc đặt người giao đến, bạn nên trao đổi để xác nhận món đã sẵn sàng. Trạng thái đang nhận đơn trên trang chủ cho biết tình trạng nhận đơn của website; nếu cần một thời gian nhận cụ thể, hãy gọi tiệm để kiểm tra trước.",
        ],
      },
      {
        heading: "Hỗ trợ đơn hàng và thông tin cá nhân",
        paragraphs: [
          "Khi cần kiểm tra hoặc điều chỉnh đơn, hãy cung cấp mã đơn và số điện thoại đã dùng để mua hàng. Bạn có thể tìm mã và trạng thái trong mục Đơn của tôi ở cùng trình duyệt đã đặt. Không gửi mật khẩu, mã OTP hoặc thông tin thẻ ngân hàng cho tiệm; ảnh xác nhận chuyển khoản chỉ cần thể hiện giao dịch liên quan.",
          "Nếu muốn hỏi về dữ liệu cá nhân, sửa thông tin giao hàng hoặc yêu cầu xử lý dữ liệu đã cung cấp, hãy gọi số điện thoại ở trên và nói rõ mã đơn liên quan. Tiệm cần đối chiếu thông tin để tránh cung cấp chi tiết đơn cho người khác. Đọc trang Quyền riêng tư để biết dữ liệu dùng trong quá trình mua hàng.",
        ],
      },
    ];
  return [
    {
      heading: "Dữ liệu dùng để xử lý đơn",
      paragraphs: [
        "Khi đặt hàng tại Cái Tiệm Sữa, bạn cung cấp tên, số điện thoại, địa chỉ giao, món đã chọn và có thể thêm ghi chú. Nếu chọn vị trí trên bản đồ hoặc cho phép trình duyệt lấy vị trí, tọa độ được dùng để tính khoảng cách, báo phí giao và hỗ trợ giao hàng. Nếu thanh toán chuyển khoản và tải ảnh xác nhận, hệ thống lưu ảnh đó gắn với đơn để tiệm kiểm tra thanh toán. Hãy tránh ghi dữ liệu nhạy cảm không cần thiết trong ghi chú hoặc ảnh xác nhận.",
        "Thông tin đơn được lưu trong cơ sở dữ liệu của hệ thống để chuẩn bị món, liên hệ xác nhận, giao hàng và theo dõi thanh toán. Khi tính năng thông báo đơn qua Zalo được cấu hình, mã đơn, thông tin liên hệ, địa chỉ hoặc vị trí, món và số tiền được gửi đến nhóm nhận đơn của tiệm để xử lý. Trang có bản đồ Google Maps nhúng; khi bản đồ được tải, trình duyệt kết nối đến dịch vụ Google và việc xử lý dữ liệu ở dịch vụ đó tuân theo chính sách của Google.",
      ],
    },
    {
      heading: "Cookie, dữ liệu trên thiết bị và nhật ký kỹ thuật",
      paragraphs: [
        "Website dùng cookie milk_guest để nhận biết phiên mua hàng và giới hạn việc xem đơn theo phiên. Cookie này có thời hạn tối đa 180 ngày. Giỏ hàng và trạng thái đã xem hướng dẫn được lưu trong bộ nhớ cục bộ của trình duyệt để bạn tiếp tục mua hàng. Xóa cookie hoặc dữ liệu trang có thể khiến bạn không xem được các đơn cũ trên thiết bị; việc xóa dữ liệu trình duyệt không tự xóa đơn đã lưu trên hệ thống.",
        "Hệ thống có dữ liệu kỹ thuật phục vụ vận hành, chẩn đoán lỗi và giới hạn tần suất yêu cầu. Đơn hết thời gian thanh toán có thể được chuyển trạng thái hết hạn; trạng thái đó không có nghĩa dữ liệu đơn đã bị xóa. Website hiện không cung cấp nút tự xóa toàn bộ dữ liệu hay một lịch tự xóa đơn cố định. Không gửi số thẻ, mật khẩu hoặc mã OTP trong ghi chú hay ảnh xác nhận thanh toán.",
      ],
    },
    {
      heading: "Liên hệ về dữ liệu",
      paragraphs: [
        `Để hỏi về thông tin cá nhân, yêu cầu sửa dữ liệu hoặc đề nghị xóa dữ liệu liên quan đến đơn, gọi ${settings.phone} hoặc liên hệ tiệm tại ${settings.address}. Nêu mã đơn và thông tin cần xử lý để tiệm kiểm tra danh tính và phạm vi yêu cầu. Tiệm cần xem xét các thông tin cần giữ cho việc xử lý đơn, thanh toán và nghĩa vụ áp dụng trước khi phản hồi yêu cầu. Trang này mô tả cách website hiện vận hành; ngày cập nhật nội dung: 28/10/2026.`,
      ],
    },
  ];
}

export function businessSchema(settings: ShopSettings) {
  const telephone = settings.phone
    .replace(/^0/, "+84")
    .replace(/[\s().-]/g, "");
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "FoodEstablishment"],
    "@id": `${SITE_URL}/#organization`,
    name: settings.name || SITE_NAME,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icons/app-icon.png`,
    image: `${SITE_URL}/images/dessert-duo-1280.webp`,
    telephone,
    contactPoint: {
      "@type": "ContactPoint",
      telephone,
      contactType: "customer service",
      availableLanguage: ["vi"],
      url: `${SITE_URL}/contact`,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Thành phố Hồ Chí Minh",
      addressCountry: "VN",
    },
    hasMenu: `${SITE_URL}/#menu`,
    hasMap:
      "https://www.google.com/maps/search/?api=1&query=10.852523902605594%2C106.66730207366463",
  };
}

export const serializeJsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
