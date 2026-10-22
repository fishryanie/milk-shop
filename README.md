# Cái Tiệm Sữa

Web đặt hàng Next.js, dùng MongoDB chung với hệ thống quản trị.

## Chạy

```sh
bun install
# Sao chép .env.example thành .env.local và điền cấu hình server.
bun run dev
```

Mở http://localhost:3200.

Để thử trên điện thoại cùng Wi-Fi, mở `http://<IP máy tính>:3200`.
Dev server tự cho phép các IP IPv4 hiện có trên máy khi khởi động; nếu đổi mạng,
khởi động lại `bun run dev`. GPS vẫn cần HTTPS khi truy cập bằng IP mạng nội bộ.
Để thử định vị qua Wi-Fi, chạy `bun run dev:https` và mở
`https://<IP máy tính>:3200`. Chứng chỉ dev phải được thiết bị tin cậy;
nếu chưa cài chứng chỉ, dùng một URL HTTPS với chứng chỉ hợp lệ để thử.
Bạn cũng có thể dùng tên mDNS như `http://rpm1pro.local:3200` khi chạy dev.
API cho phép origin `.local` trùng host và port đang truy cập; ngoại lệ này
không áp dụng cho production, nơi `STOREFRONT_ORIGIN` vẫn phải khớp domain thật.

Ở bước giao hàng, bấm **Cho phép lấy vị trí** để trình duyệt hỏi quyền, sau đó
bấm **Xem phí giao hàng**. Nếu đã chặn quyền, trình duyệt sẽ không hỏi lại:
cần cho phép Vị trí trong cài đặt của trang và bật dịch vụ định vị của thiết bị.
Màn hình phân biệt lỗi bị chặn quyền, không tìm thấy vị trí và hết thời gian;
nếu GPS thất bại, app thử lại bằng định vị mạng.

Chạy bản production để đo tốc độ:

```sh
bun run build
bun run start
```

`bun run typecheck` kiểm tra TypeScript. `bun run db:setup` tạo chỉ mục;
`bun run seed` thêm menu ban đầu và giữ các chỉnh sửa của admin.
MongoDB cần replica set/Atlas để transaction giữ tồn và đơn hàng chính xác.

## Cấu hình

Dùng các biến trong `.env.example`; giữ credentials và secret trên server.
`STOREFRONT_ORIGIN` phải trùng domain web, `STOREFRONT_SESSION_SECRET` tối thiểu 32 ký tự.
Cấp MongoDB user riêng chỉ truy cập các collection `storefront_*`; tài khoản tạo index
cần quyền migration riêng. Chỉ đặt `STOREFRONT_TRUST_PROXY=true` khi proxy tin cậy
đã ghi đè header `X-Forwarded-For`.

Trên server release của `caitiemsua.com`, đặt:

```dotenv
STOREFRONT_ORIGIN=https://caitiemsua.com
```

Sau khi đổi biến môi trường, restart/redeploy ứng dụng. Nếu hosting quản lý biến
môi trường riêng, cập nhật ở đó; `.env.local` không được đưa lên Git. Origin phải
khớp cả giao thức, hostname và port (nếu có); chuyển hướng `www.caitiemsua.com` về
`caitiemsua.com` nếu dùng domain chính này. Nếu giữ giá trị `http://localhost:3200`,
menu vẫn có thể hiển thị nhưng `POST /api/cart` bị chặn với HTTP 403 và thông báo
“Yêu cầu không hợp lệ.”.

Đặt `ZALO_BOT_TOKEN` và `ZALO_GROUP_ID` trong `.env.local` để nhận thông báo đơn
mới vào nhóm Zalo. Trên hosting, đặt hai biến này trong môi trường server rồi
build/restart ứng dụng. Token không được dùng biến `NEXT_PUBLIC_*`.
Thông báo được gửi sau khi lưu đơn thành công, ngoài transaction và sau phản hồi
cho khách; gửi lại cùng yêu cầu đặt hàng không tạo thông báo trùng. Tin nhắn gồm
mã đơn hàng, khách hàng, địa chỉ/bản đồ nếu có, món/size/topping, tiền, thanh toán và ghi chú.
Đơn mới có mã bắt đầu bằng `CTS`. Đơn dài được chia thành nhiều tin (tối đa 2.000
ký tự/tin), mỗi tin đều kèm mã đơn để đối chiếu. Lỗi gửi được ghi trong
log server với tiền tố `[zalo]`; đơn vẫn được lưu, không tự thử gửi lại khi lỗi.

## Runtime

- `app/`: trang web và API.
- `components/`: giao diện; giỏ hàng có sẵn, các sheet còn lại được tải khi mở.
- `lib/`: kết nối DB, HTTP, phiên, ảnh và giới hạn truy cập.
- `shared/commerce/`: tính tiền, kiểm tra dữ liệu, tồn và đơn hàng.
- `public/`: ảnh và font phục vụ giao diện, kèm giấy phép font.
- `scripts/`: chuẩn bị DB và menu.

Trang chủ được dựng sẵn, làm mới sau 15 giây khi có truy cập. Trình duyệt lấy menu
khi mở trang; menu và giỏ không tự làm mới định kỳ hay khi quay lại tab. Giỏ hiện
món và tính tiền ngay từ menu hiện có, dùng chung cách tính với server. Khi mở giỏ
hoặc đổi món/số lượng, API kiểm tra lại ở nền sau 150 ms không có thay đổi mới;
yêu cầu cũ được hủy và bỏ qua kết quả. Mở lại cùng giỏ trong 10 giây dùng báo giá
đã kiểm tra, không gửi thêm yêu cầu. Bước xác nhận phí ship và đặt đơn luôn lấy
báo giá mới và kiểm tra giá/tồn trực tiếp ở server. Đơn hàng và số đơn đang xử lý
vẫn tự cập nhật mỗi 10 giây khi trang đang hiển thị.
API catalog xử lý đơn hết hạn sau khi trả phản hồi. Giỏ/đặt hàng vẫn xử lý hết hạn
và kiểm tra trực tiếp giá/tồn trước khi xác nhận.

Admin nằm trong các dự án `milk-shop` và `snowmilk` riêng. Khi sửa nghiệp vụ chung,
cần đồng bộ `shared/commerce` sang `snowmilk/lib/storefront-core` trước khi deploy admin.
