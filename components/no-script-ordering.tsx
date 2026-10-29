import type { ShopSettings } from "@/shared/commerce/types";

export function NoScriptOrdering({ settings }: { settings: ShopSettings }) {
  return (
    <noscript>
      <section className="sf-no-script" aria-labelledby="no-script-title">
        <h2 id="no-script-title">Đặt món tại Cái Tiệm Sữa</h2>
        <p>
          Cái Tiệm Sữa bán sữa tuyết Vân Nam, sữa tươi tiệt trùng và bánh flan
          tại An Hội Đông, Thành phố Hồ Chí Minh. Bạn có thể đọc thực đơn, mô
          tả món, giá và đơn vị bán bên dưới ngay cả khi trình duyệt không bật
          JavaScript. Sữa tuyết có lựa chọn size và topping; bánh flan có các
          phần mini, chén và xô. Xem thêm từng nhóm món qua các liên kết ở cuối trang.
        </p>
        <p>
          Để chọn size, topping, thêm món vào giỏ và gửi đơn trên website, hãy
          bật JavaScript rồi tải lại trang. Nếu muốn đặt qua điện thoại, hãy{" "}
          <a href={settings.phone ? `tel:${settings.phone}` : "/contact"}>
            liên hệ tiệm{settings.phone ? ` qua số ${settings.phone}` : ""}
          </a>{" "}
          và cho biết món, số lượng, lựa chọn size hoặc topping cùng địa chỉ
          nhận. Tiệm sẽ kiểm tra món còn bán, xác nhận tổng tiền và thời gian
          chuẩn bị trước khi giao. Các nút chọn món cần JavaScript để hoạt động.
        </p>
        <p>
          Địa chỉ tiệm: {settings.address}. Giao dưới 1 km được miễn phí; từ
          1–3 km có phí 10.000 đồng, tính theo đường chim bay. Trên 3 km, bạn
          đặt người giao đến lấy giúp tiệm. Nếu cần hỏi về thành phần, dị ứng
          hoặc cách bảo quản, hãy trao đổi trực tiếp trước khi đặt. Trang{" "}
          <a href="/contact">Liên hệ</a> có số điện thoại và bản đồ; trang{" "}
          <a href="/about">Giới thiệu</a> hướng dẫn đặt hàng và theo dõi đơn.
        </p>
      </section>
    </noscript>
  );
}
