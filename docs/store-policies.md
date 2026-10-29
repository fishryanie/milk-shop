# Trang thông tin và chính sách

Các trang dùng chung giao diện đọc, mục lục, ngày cập nhật và liên kết ở footer.
Nội dung đã có tại `/about`, `/privacy`, `/contact` được giữ và bổ sung phần thiếu.

| Nội dung | URL |
| --- | --- |
| Giới thiệu, pháp lý đơn vị bán hàng | `/about` (`/about-us` chuyển hướng 308) |
| Bảo mật | `/privacy` (`/privacy-policy` chuyển hướng 308) |
| Liên hệ, chăm sóc khách hàng | `/contact` |
| Điều khoản giao dịch | `/terms-and-conditions` |
| Thanh toán | `/payment-policy` |
| Giao hàng | `/shipping-policy` |
| Đổi trả, hoàn tiền | `/return-refund-policy` |
| Giá, khuyến mãi | `/pricing-policy` |
| Khiếu nại | `/complaint-policy` |
| Cookie | `/cookie-policy` |

Tất cả URL chính có metadata, canonical, sitemap và bản Markdown `.md`.
Các liên kết trong bước xác nhận đơn mở tab mới để khách không mất thông tin đang nhập.

## Điền thông tin thật qua môi trường

Điền các biến sau trong `.env.local`; khi triển khai, đặt cùng biến ở hosting:

```dotenv
SELLER_LEGAL_NAME="Tên pháp lý hoặc chủ hộ kinh doanh"
SELLER_REGISTRATION_NUMBER="Số giấy đăng ký kinh doanh"
SELLER_TAX_ID="Mã số thuế"
SELLER_REGISTERED_ADDRESS="Địa chỉ đăng ký kinh doanh"
SELLER_SUPPORT_EMAIL="Email hỗ trợ thực tế"
```

Nếu loại hình kinh doanh không có một trường, điền giá trị mô tả đúng thực tế
(chẳng hạn `Không áp dụng`) sau khi xác định yêu cầu liên quan.
Địa chỉ cửa hàng và số điện thoại tiếp tục lấy từ cấu hình cửa hàng hiện có.
Các biến `SELLER_*` là thông tin để công bố; không điền mật khẩu hoặc dữ liệu riêng tư.

Biến trống dùng thông tin mẫu có nhãn rõ ràng; email mặc định
`lienhe@example.invalid` không phải kênh nhận thư. Khi các biến được điền đủ,
thông báo dữ liệu mẫu được bỏ. Email đã điền được liên kết trên trang liên hệ,
đồng thời được dùng trong nội dung chính sách, kể cả khi trường pháp lý khác còn trống.
Sau khi thay biến, build và restart/redeploy ứng dụng để cập nhật cả HTML dựng sẵn.

## Quy định ban đầu

Theo yêu cầu chủ tiệm tự soạn khi chưa có quy định riêng:

- Giao trong 3 km: dự kiến 30–60 phút sau xác nhận; chuẩn bị lấy tại tiệm:
  15–30 phút. Thời gian thực tế được xác nhận theo đơn.
- Khuyến nghị báo vấn đề thực phẩm ngay khi nhận hoặc trong 24 giờ; không dùng
  mốc này để loại trừ quyền khiếu nại theo pháp luật.
- Hoàn tiền: 3–7 ngày làm việc sau khi thống nhất phương án và đủ thông tin.
- Khiếu nại: xác nhận trong 1 ngày làm việc; xử lý thông thường trong 3 ngày;
  trường hợp cần phối hợp dự kiến tối đa 7 ngày và thông báo nếu kéo dài.
- Ngày làm việc: thứ Hai đến thứ Sáu, trừ ngày nghỉ lễ.

Sửa nội dung nghiệp vụ tại `lib/policies.ts`; danh sách URL và nhãn ở
`lib/policy-links.ts`. Không có cổng thẻ/ví, mã giảm giá, tự hoàn tiền hoặc lịch
tự xóa dữ liệu được tạo thêm chỉ bằng việc công bố các trang này.

Chính sách cookie mô tả `milk_guest` (180 ngày), `milk-cart`, `milk-tour-seen`,
Google Maps và OpenStreetMap theo mã hiện có. Nếu thêm công cụ theo dõi, cần cập
nhật nội dung và cơ chế lựa chọn phù hợp với cách xử lý thực tế.

## Nguồn tham khảo khi soạn

- [Cổng Dịch vụ công Quốc gia: thông tin công bố trên website bán hàng](https://dichvucong.gov.vn/p/home/dvc-chi-tiet-cau-hoi.html?id=13752&row_limit=1).
- [Bộ Công an: quyền của chủ thể dữ liệu theo Luật Bảo vệ dữ liệu cá nhân có hiệu lực từ 01/01/2026](https://bocongan.gov.vn/chinh-sach-phap-luat/bai-viet/luat-bao-ve-du-lieu-ca-nhan-chinh-thuc-co-hieu-luc-thi-hanh-tu-ngay-01-01-2026-1767186124).

Việc có đủ trang và dữ liệu mẫu không phải xác nhận hoàn tất các thủ tục pháp lý
hoặc thông báo website; cần thay thông tin thật trước khi sử dụng hồ sơ doanh nghiệp.
