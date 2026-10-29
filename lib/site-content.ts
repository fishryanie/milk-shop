import type { Metadata } from "next";
import { policyPageLinks, type PolicyPath } from "./policy-links";
import { policySections } from "./policies";
import { sellerProfile, type SellerProfile } from "./seller-profile";
import {
  defaultSettings,
  type ShopProduct,
  type ShopSettings,
} from "@/shared/commerce/types";

export const SITE_URL = "https://caitiemsua.com";
export const SITE_NAME = "Cái Tiệm Sữa";
export const SITE_TITLE =
  "Cái Tiệm Sữa — Bánh flan, sữa tuyết Vân Nam & sữa tươi";
export const SITE_DESCRIPTION =
  "Bánh flan chén, bánh flan xô, sữa tuyết Vân Nam và sữa tươi tại Cái Tiệm Sữa, An Hội Đông, TP.HCM. Xem giá, chọn topping và đặt giao hàng trực tiếp.";
export const siteOpenGraph = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  url: `${SITE_URL}/`,
  type: "website" as const,
  locale: "vi_VN",
  siteName: SITE_NAME,
  images: [
    {
      url: `${SITE_URL}/images/dessert-duo-1280.webp`,
      width: 1280,
      height: 1170,
      alt: "Sữa tuyết Oreo và bánh flan caramel tại Cái Tiệm Sữa",
    },
  ],
};
// Published contact details verified on caitiemsua.com, 2026-10-28.
export const publicFallbackSettings: ShopSettings = {
  ...defaultSettings,
  phone: "0767271126",
};

const aboutSections = [
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
      "Bạn có thể xem địa chỉ, số điện thoại và đường dẫn bản đồ trên trang Liên hệ của website. Trước khi đến lấy hay nhờ người giao đến, hãy liên hệ để tiệm xác nhận món và thời gian chuẩn bị. Trang Quyền riêng tư cho biết dữ liệu nào được dùng khi mua hàng.",
    ],
  },
];

export const productPageLinks = [
  { path: "/banh-flan", label: "Bánh flan chén & flan xô", category: "flan" },
  {
    path: "/sua-tuyet-van-nam",
    label: "Sữa tuyết Vân Nam",
    category: "sua tuyet",
  },
  { path: "/sua-tuoi", label: "Sữa tươi", category: "sua tuoi" },
] as const;
export type ProductPagePath = (typeof productPageLinks)[number]["path"];
export type InfoPath = "/about" | "/contact" | "/privacy" | ProductPagePath | PolicyPath;
export type ContentSection = { heading: string; paragraphs: string[] };
export const pageDefinitions = {
  "/banh-flan": {
    title: "Bánh flan chén, flan xô tại TP.HCM | Cái Tiệm Sữa",
    description:
      "Xem bánh flan mini, flan chén và bánh flan xô tại Cái Tiệm Sữa, An Hội Đông, TP.HCM. Giá, phần bánh và topping cập nhật từ thực đơn của tiệm.",
  },
  "/sua-tuyet-van-nam": {
    title: "Sữa tuyết Vân Nam tại TP.HCM | Cái Tiệm Sữa",
    description:
      "Sữa tuyết Vân Nam tại Cái Tiệm Sữa, An Hội Đông, TP.HCM. Xem giá size M, L, topping đang có và đặt món trực tiếp trên website.",
  },
  "/sua-tuoi": {
    title: "Sữa bò tươi tiệt trùng tại TP.HCM | Cái Tiệm Sữa",
    description:
      "Sữa bò tươi tiệt trùng tại Cái Tiệm Sữa, An Hội Đông, TP.HCM. Xem sữa tươi nguyên chất, giá bán, dung tích chai và đặt giao hàng trực tiếp.",
  },
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
    title: "Chính sách bảo mật | Cái Tiệm Sữa",
    description:
      "Thông tin về dữ liệu đặt hàng, vị trí giao hàng, cookie phiên mua hàng và cách yêu cầu hỗ trợ về dữ liệu.",
  },
  ...Object.fromEntries(policyPageLinks.map(({ path, title, description }) => [path, { title, description }])) as Record<PolicyPath, { title: string; description: string }>,
} as const;

// These dates describe actual content changes, rather than sitemap request time.
export const indexablePages = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  ...productPageLinks.map(({ path }) => path),
  ...policyPageLinks.map(({ path }) => path),
] as const;
export const CONTENT_UPDATED = "2026-10-29";

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
  seller: SellerProfile = sellerProfile(),
): ContentSection[] {
  if (policyPageLinks.some((page) => page.path === path))
    return policySections(path as PolicyPath, settings, seller);
  const productIntroduction: Partial<Record<InfoPath, ContentSection>> = {
    "/banh-flan": {
      heading: "Chọn bánh flan theo phần bạn thích",
      paragraphs: [
        "Bạn thích một phần flan nhỏ hay muốn thưởng thức cả xô? Cái Tiệm Sữa có bánh flan mini, flan chén và bánh flan xô trong thực đơn. Mỗi loại có đơn vị bán riêng, giúp bạn chọn phần bánh phù hợp. Xem các món bên dưới để biết giá, phần bánh và tình trạng hiện tại trước khi đặt.",
        "Flan mini được bán theo lốc; flan chén là phần bánh đựng trong chén. Với flan xô, bạn có thể xem mô tả và những lựa chọn topping trong phần chi tiết món ở thực đơn. Giá và lựa chọn đang bán được cập nhật cùng hệ thống đặt hàng của tiệm.",
      ],
    },
    "/sua-tuyet-van-nam": {
      heading: "Chọn size và topping cho sữa tuyết Vân Nam",
      paragraphs: [
        "Sữa tuyết Vân Nam là một trong những món tại Cái Tiệm Sữa ở An Hội Đông, TP.HCM. Bạn có thể chọn size M hoặc L, rồi chọn topping theo sở thích trong phần chi tiết món. Danh sách bên dưới hiển thị giá và tình trạng từ thực đơn của tiệm.",
        "Giá mỗi size và phần topping được hiển thị trước khi bạn thêm món vào giỏ. Nếu một lựa chọn vừa hết, hãy xem các lựa chọn còn lại trong thực đơn. Bạn có thể đặt sữa tuyết cùng bánh flan hoặc sữa tươi trong một đơn và kiểm tra tổng tiền ở giỏ hàng.",
      ],
    },
    "/sua-tuoi": {
      heading: "Sữa bò tươi tiệt trùng tại Cái Tiệm Sữa",
      paragraphs: [
        "Bạn đang tìm mua sữa bò tươi tại An Hội Đông, TP.HCM? Cái Tiệm Sữa bán sữa tươi nguyên chất đã tiệt trùng. Xem thông tin món bên dưới để kiểm tra giá bán, dung tích mỗi chai và tình trạng hiện tại. Khi đặt, hãy chọn đúng số lượng chai cần mua và kiểm tra lại giỏ trước khi xác nhận.",
        "Với sữa bò tươi tiệt trùng của tiệm, bạn có thể liên hệ để hỏi rõ nguồn sữa, thành phần và hướng dẫn bảo quản cho chai đang bán. Nếu cần mua nhiều chai hoặc có yêu cầu riêng, hãy gọi tiệm để được hỗ trợ trước khi đặt.",
      ],
    },
  };
  const introduction = productIntroduction[path];
  if (introduction)
    return [
      introduction,
      {
        heading: "Đặt món và nhận hàng tại An Hội Đông, TP.HCM",
        paragraphs: [
          `Tiệm ở ${settings.address}, Thành phố Hồ Chí Minh. Chọn món trong thực đơn, kiểm tra số lượng và điền địa chỉ nhận để xem phí giao trước khi gửi đơn. Bạn có thể chọn thanh toán khi nhận hàng hoặc chuyển khoản theo hướng dẫn. Gọi ${settings.phone} để hỏi món hoặc hẹn đến lấy; tiệm sẽ xác nhận thời gian chuẩn bị và giao hàng.`,
        ],
      },
    ];
  if (path === "/about")
    return [
      {
        heading: "Thông tin đơn vị bán hàng",
        paragraphs: [
          ...(seller.hasExampleData ? ["Thông tin pháp lý bên dưới có dữ liệu mẫu để minh họa và đang chờ chủ tiệm cập nhật. Không sử dụng các giá trị ghi mẫu để xuất hóa đơn hoặc xác minh đăng ký kinh doanh; số điện thoại và địa chỉ cửa hàng ở phần liên hệ là kênh hỗ trợ đang được công bố."] : []),
          `Tên pháp lý / chủ thể kinh doanh: ${seller.legalName}.`,
          `Số đăng ký kinh doanh: ${seller.registrationNumber}. Mã số thuế: ${seller.taxId}.`,
          `Địa chỉ đăng ký: ${seller.registeredAddress}.`,
          `Tên cửa hàng: ${settings.name}. Địa chỉ cửa hàng: ${settings.address}. Điện thoại: ${settings.phone}. Email hỗ trợ: ${seller.email}.`,
        ],
      },
      ...aboutSections,
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
          `Email hỗ trợ: ${seller.email}.${seller.hasExampleEmail ? " Địa chỉ email mẫu không nhận thư. Vui lòng gọi số điện thoại của tiệm để được hỗ trợ." : " Bạn có thể gửi mã đơn, nội dung cần hỗ trợ và cách liên hệ lại qua email này."} Quy trình phản ánh được công bố tại trang Tiếp nhận và giải quyết khiếu nại.`,
        ],
      },
    ];
  return [
    {
      heading: "Dữ liệu dùng để xử lý đơn",
      paragraphs: [
        "Khi đặt hàng tại Cái Tiệm Sữa, bạn cung cấp tên, số điện thoại, địa chỉ giao, món đã chọn và có thể thêm ghi chú. Nếu chọn vị trí trên bản đồ hoặc cho phép trình duyệt lấy vị trí, tọa độ được dùng để tính khoảng cách, báo phí giao và hỗ trợ giao hàng. Nếu thanh toán chuyển khoản và tải ảnh xác nhận, hệ thống lưu ảnh đó gắn với đơn để tiệm kiểm tra thanh toán. Hãy tránh ghi dữ liệu nhạy cảm không cần thiết trong ghi chú hoặc ảnh xác nhận.",
        "Thông tin đơn được lưu trong cơ sở dữ liệu của hệ thống để chuẩn bị món, liên hệ xác nhận, giao hàng và theo dõi thanh toán. Khi tính năng thông báo đơn qua Zalo được cấu hình, mã đơn, thông tin liên hệ, địa chỉ hoặc vị trí, món và số tiền được gửi đến nhóm nhận đơn của tiệm để xử lý. Nhân sự xử lý đơn, đơn vị giao hàng và nhà cung cấp hạ tầng chỉ được tiếp cận trong phạm vi cần thiết cho nhiệm vụ liên quan; tiệm không bán dữ liệu khách hàng.",
        "Trang có bản đồ Google Maps nhúng và bản đồ OpenStreetMap khi chọn điểm nhận. Khi tải bản đồ, trình duyệt kết nối tới nhà cung cấp; dịch vụ có thể nhận thông tin kết nối và yêu cầu bản đồ theo chính sách riêng. Việc lấy vị trí GPS cần quyền trình duyệt; bạn có thể từ chối hoặc thu hồi quyền và nhập địa chỉ để tiệm xác nhận phí giao sau.",
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
      heading: "Lưu trữ và bảo vệ dữ liệu",
      paragraphs: [
        "Dữ liệu được giữ trong thời gian cần để thực hiện đơn hàng, đối soát, xử lý phản ánh và đáp ứng nghĩa vụ lưu trữ áp dụng. Website chưa có lịch tự động xóa đơn cố định; việc đổi trạng thái đơn sang hết hạn không phải thao tác xóa dữ liệu. Tiệm xem xét yêu cầu xóa hoặc hạn chế xử lý theo từng hồ sơ và giải thích khi có thông tin cần giữ theo nghĩa vụ pháp luật.",
        "Hệ thống giới hạn truy cập đơn theo cookie phiên đã ký, kiểm tra phiên khi truy cập ảnh thanh toán và áp dụng biện pháp kiểm soát yêu cầu. Tiệm giới hạn việc dùng thông tin cho xử lý đơn và hỗ trợ; không yêu cầu mật khẩu ngân hàng hay mã OTP. Bạn nên giữ thiết bị an toàn, không chia sẻ phiên mua hàng và báo tiệm nếu nghi có người truy cập đơn trái phép.",
      ],
    },
    {
      heading: "Quyền đối với dữ liệu cá nhân",
      paragraphs: [
        "Bạn có thể yêu cầu được biết, xem, cung cấp, chỉnh sửa, xóa hoặc hạn chế xử lý dữ liệu; phản đối xử lý, rút lại sự đồng ý khi việc xử lý dựa trên sự đồng ý; gửi khiếu nại hoặc yêu cầu bảo vệ quyền lợi theo pháp luật. Việc thu hồi quyền vị trí hoặc xóa dữ liệu trên thiết bị không tự xóa dữ liệu đơn tại tiệm.",
        "Tiệm đối chiếu thông tin phù hợp để xác minh người yêu cầu, thông báo phạm vi, kết quả hoặc lý do chưa thể thực hiện và xử lý trong thời hạn pháp luật áp dụng. Việc rút lại sự đồng ý có thể ảnh hưởng khả năng tiếp tục phục vụ đơn khi thiếu thông tin cần thiết, nhưng không làm mất quyền phản ánh của bạn.",
      ],
    },
    {
      heading: "Liên hệ về dữ liệu",
      paragraphs: [
        `Đơn vị chịu trách nhiệm xử lý dữ liệu là đơn vị bán hàng tại trang Giới thiệu. Để hỏi về thông tin cá nhân hoặc gửi yêu cầu liên quan đến đơn, gọi ${settings.phone} hoặc liên hệ tiệm tại ${settings.address}. Nêu mã đơn và thông tin cần xử lý để tiệm kiểm tra danh tính và phạm vi yêu cầu. Email hỗ trợ: ${seller.email}${seller.hasExampleEmail ? " (địa chỉ mẫu không nhận thư; vui lòng gọi điện)" : ""}. Xem thêm Chính sách cookie và quy trình giải quyết khiếu nại ở liên kết cuối trang. Ngày cập nhật nội dung: 29/10/2026.`,
      ],
    },
  ];
}

export function productsForPage(path: InfoPath, products: ShopProduct[]) {
  const group = productPageLinks.find((page) => page.path === path);
  if (!group) return [];
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return products.filter(
    (product) =>
      product.status !== "hidden" &&
      (normalize(product.category).includes(group.category) ||
        normalize(product.name).includes(group.category)),
  );
}

export function productCollectionSchema(
  path: ProductPagePath,
  products: ShopProduct[],
) {
  const page = pageDefinitions[path];
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name: page.title,
    description: page.description,
    inLanguage: "vi-VN",
    about: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: `${SITE_URL}/#mon-${product.id}`,
      })),
    },
  };
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

// Google uses WebSite on the canonical homepage to identify the site's name.
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "vi-VN",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export const serializeJsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
