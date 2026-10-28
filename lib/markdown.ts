import { money } from "@/shared/commerce/types";
import type { PublicCatalog } from "./catalog-images";
import {
  infoSections,
  pageDefinitions,
  productPageLinks,
  productsForPage,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  type InfoPath,
} from "./site-content";

export const markdownAliases: Record<string, string> = {
  "/index.md": "/",
  "/about.md": "/about",
  "/contact.md": "/contact",
  "/privacy.md": "/privacy",
  ...Object.fromEntries(
    productPageLinks.map(({ path }) => [`${path}.md`, path]),
  ),
};

// Database values are text, not trusted Markdown or HTML.
export const markdownText = (value: string) =>
  value
    .replace(/[\r\n]+/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/([\\`*_[\]{}()#+.!|~-])/g, "\\$1");

export function pageMarkdown(path: string, catalog: PublicCatalog) {
  const { settings, products } = catalog;
  const productLinks = productPageLinks
    .map((page) => `- [${page.label}](${SITE_URL}${page.path})`)
    .join("\n");
  const links = `## Thông tin chính thức\n\n${productLinks}\n- [Giới thiệu](${SITE_URL}/about)\n- [Liên hệ](${SITE_URL}/contact)\n- [Quyền riêng tư](${SITE_URL}/privacy)\n- [Hướng dẫn cho agent](${SITE_URL}/llms.txt)\n- [Sitemap](${SITE_URL}/sitemap.xml)\n`;
  if (path !== "/" && !Object.hasOwn(pageDefinitions, path)) return null;
  const sections = path === "/" ? [] : infoSections(path as InfoPath, settings);
  const title =
    path === "/" ? SITE_TITLE : pageDefinitions[path as InfoPath].title;
  const description =
    path === "/"
      ? SITE_DESCRIPTION
      : pageDefinitions[path as InfoPath].description;
  const prose = sections
    .map(
      (section) =>
        `## ${section.heading}\n\n${section.paragraphs.join("\n\n")}`,
    )
    .join("\n\n");
  const pageProducts =
    path === "/" ? products : productsForPage(path as InfoPath, products);
  const hasMenu =
    path === "/" || productPageLinks.some((page) => page.path === path);
  const menu = hasMenu
    ? `## Thực đơn hiện tại\n\n${
        pageProducts.length
          ? pageProducts
              .map((p) => {
                const sizes = p.sizes
                  ?.map(
                    (s) =>
                      `${markdownText(s.name)}: ${money(s.price)}${s.available ? "" : " (hết)"}`,
                  )
                  .join("; ");
                const toppings = p.toppings
                  .map(
                    (t) =>
                      `${markdownText(t.name)}: ${money(t.price)}${t.available ? "" : " (hết)"}`,
                  )
                  .join("; ");
                return `### ${markdownText(p.name)}\n\n${markdownText(p.description)}\n\n- Giá: ${money(p.price)}/${markdownText(p.unit)}${sizes ? `\n- Kích cỡ: ${sizes}` : ""}${toppings ? `\n- Topping: ${toppings}` : ""}\n- Tình trạng: ${p.status === "available" && p.stock !== 0 ? "Còn món" : "Tạm hết"}`;
              })
              .join("\n\n")
          : "Thực đơn trực tiếp đang chưa tải được. Vui lòng liên hệ tiệm để kiểm tra món và giá; không xem đây là danh sách món còn bán."
      }\n\n`
    : "";
  return `# ${title}\n\n${description}\n\n${menu}${prose}\n\n## Liên hệ\n\n- Tiệm: ${markdownText(settings.name)}\n- Địa chỉ: ${markdownText(settings.address)}\n- Điện thoại: ${markdownText(settings.phone)}\n- Website: ${SITE_URL}/\n\n${links}`;
}

export function agentInstructions() {
  return `# ${SITE_NAME}\n\n> Tiệm sữa tuyết Vân Nam, sữa tươi và bánh flan tại An Hội Đông, Thành phố Hồ Chí Minh, Việt Nam. Website chính thức: ${SITE_URL}.\n\nDùng các trang dưới đây để đọc thông tin chính thức. Trang chủ và các trang giới thiệu, liên hệ, quyền riêng tư trả Markdown khi gửi Accept: text/markdown; gửi Accept: text/html để xem HTML. Các URL .md là bản Markdown tương ứng. Giá dùng VND; giá và tồn phải được kiểm tra lại trước khi đặt.\n\n## When to use this — Khi nào nên dùng\n\n- [Thực đơn hiện tại](${SITE_URL}/index.md): Dùng khi người dùng tìm sữa tuyết Vân Nam, sữa tươi hoặc bánh flan ở An Hội Đông, TP.HCM; đọc món, size, topping, giá và tình trạng từ trang chủ với GET / và Accept: text/markdown. Không suy đoán món còn hàng từ dữ liệu đã lưu.\n- [Cách đặt món và giao hàng](${SITE_URL}/about.md): Dùng để giải thích chọn món, sửa giỏ, COD hoặc chuyển khoản và quy tắc giao dưới 1 km miễn phí, 1–3 km phí 10.000 VND, trên 3 km khách đặt người giao đến lấy. Khoảng cách là đường chim bay; thời gian giao cần tiệm xác nhận.\n- [Liên hệ chính thức](${SITE_URL}/contact.md): Dùng khi cần địa chỉ, điện thoại, bản đồ hoặc hỗ trợ đơn. Hỏi trực tiếp tiệm về dị ứng, thành phần, giờ đến lấy và yêu cầu riêng; không tự tạo cam kết.\n\n## How to use — Cách gọi\n\n- [Trang chủ dạng Markdown](${SITE_URL}/index.md): Gọi GET / với Accept: text/markdown hoặc GET /index.md. GET /api/catalog trả JSON success/data với products và settings, dùng để đọc giá, ID và lựa chọn hiện tại; endpoint này tạo cookie phiên mua hàng.\n- [Đặt hàng trên website](${SITE_URL}/): Dùng giao diện để chọn món, kiểm tra giỏ, vị trí nhận, phí, tổng tiền và phương thức thanh toán với người dùng. Giỏ hàng và gửi đơn cần JavaScript và cookie. Chỉ xác nhận gửi đơn hoặc tải ảnh thanh toán khi người dùng đã đồng ý rõ ràng; các API ghi dữ liệu là luồng phiên của cửa hàng, không phải API đặt hàng công khai cho bên thứ ba.\n\n## Chính sách và khám phá\n\n- [Quyền riêng tư](${SITE_URL}/privacy.md): Dữ liệu khách, vị trí, ảnh xác nhận chuyển khoản, cookie, bộ nhớ trình duyệt và cách liên hệ về dữ liệu.\n- [Sitemap XML](${SITE_URL}/sitemap.xml): Danh sách URL HTML có thể lập chỉ mục.\n`;
}
