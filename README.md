# Cái Tiệm Sữa

Web đặt hàng Next.js, dùng MongoDB chung với hệ thống quản trị.

## Chạy

```sh
bun install
# Sao chép .env.example thành .env.local và điền cấu hình server.
bun run dev
```

Mở http://localhost:3200. Chạy bản production để đo tốc độ:

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

## Runtime

- `app/`: trang web và API.
- `components/`: giao diện; các sheet được tải khi mở.
- `lib/`: kết nối DB, HTTP, phiên, ảnh và giới hạn truy cập.
- `shared/commerce/`: tính tiền, kiểm tra dữ liệu, tồn và đơn hàng.
- `public/`: ảnh và font phục vụ giao diện, kèm giấy phép font.
- `scripts/`: chuẩn bị DB và menu.

Trang chủ được dựng sẵn, làm mới sau 15 giây khi có truy cập. Trình duyệt lấy menu
mới khi mở trang, mỗi 45 giây và khi quay lại tab; giỏ kiểm tra lại mỗi 15 giây.
API catalog xử lý đơn hết hạn sau khi trả phản hồi. Giỏ/đặt hàng vẫn xử lý hết hạn
và kiểm tra trực tiếp giá/tồn trước khi xác nhận.

Admin nằm trong các dự án `milk-shop` và `snowmilk` riêng. Khi sửa nghiệp vụ chung,
cần đồng bộ `shared/commerce` sang `snowmilk/lib/storefront-core` trước khi deploy admin.
