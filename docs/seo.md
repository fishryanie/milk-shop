# Tìm sản phẩm trên Google

Nội dung cập nhật ngày 28/10/2026. Chủ tiệm xác nhận sữa đang bán là sữa tươi
tiệt trùng. Đây là thay đổi trong mã nguồn; cần triển khai bản mới trước khi gửi
các URL mới cho Google. Tài liệu này không xác nhận Google đã lập chỉ mục.

| Trang | Nhóm tìm kiếm phù hợp |
| --- | --- |
| `/banh-flan` | flan, bánh flan, flan chén, flan xô, bánh flan xô |
| `/sua-tuyet-van-nam` | sữa tuyết Vân Nam |
| `/sua-tuoi` | sữa tươi, sữa bò, sữa bò tươi, sữa bò tươi tiệt trùng |

Không quảng bá sản phẩm này là sữa bò thô. Nội dung về sữa tiệt trùng dựa trên
xác nhận của chủ tiệm; không bổ sung cam kết về công nghệ UHT, thời hạn sử dụng
hoặc điều kiện bảo quản khi chưa có thông tin cụ thể.

Mỗi trang có tiêu đề, mô tả, canonical, Open Graph và nội dung HTML dựng từ
server. Giá, đơn vị bán, size, ảnh và tình trạng lấy từ catalog dùng chung với
website, làm mới sau 15 giây. Không sao chép giá cố định vào bài giới thiệu.
Trang danh mục dùng CollectionPage / ItemList; không gắn đánh giá hoặc dữ liệu
Product giả để mong có kết quả mở rộng. Liên kết món trỏ về đúng thẻ thực đơn
trên trang chủ. Các trang có liên kết nội bộ, sitemap và bản Markdown tương ứng.

## Sau khi triển khai

1. Trong [Google Search Console](https://search.google.com/search-console), chọn
   thuộc tính đã xác minh cho `caitiemsua.com`.
2. Gửi sitemap `https://caitiemsua.com/sitemap.xml` trong mục Sitemaps.
3. Dùng URL Inspection kiểm tra ba URL mới, chạy kiểm tra trực tiếp và yêu cầu
   lập chỉ mục nếu trang đủ điều kiện. Việc này cần quyền truy cập của chủ sở hữu.
4. Theo dõi báo cáo Page indexing và Performance để biết URL đã được lập chỉ
   mục chưa, truy vấn nào có lượt hiển thị và số lượt nhấp thực tế.
5. Nếu tiệm có địa điểm phục vụ phù hợp, tạo hoặc cập nhật
   [Google Business Profile](https://www.google.com/business/) với tên, địa chỉ,
   số điện thoại và website chính xác. Giữ thông tin nhất quán với trang Liên hệ.

Ưu tiên truy vấn có ý định mua tại địa phương, ví dụ “flan xô An Hội Đông”,
“bánh flan Thống Nhất” hoặc “sữa tuyết Vân Nam TP.HCM”. Các từ chung như “flan”
có nhiều mục đích tìm kiếm và cạnh tranh rộng hơn. Không có cam kết lên top
hay thời gian xuất hiện cố định.

Hướng dẫn chính thức: [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[gửi sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Ảnh và logo trong kết quả Google

Ảnh Open Graph dùng ảnh sữa tuyết và bánh flan 1280 × 1170 đang có trên trang
chủ, thay cho logo của tiệm. Metadata cho phép `max-image-preview:large`;
favicon ưu tiên logo vuông 192 × 192 với URL giữ nguyên. Ảnh và favicon là hai
phần riêng trong kết quả tìm kiếm. Bản đang chạy đã phục vụ được cả hai file
ảnh; biểu tượng quả địa cầu trên Google không đủ để kết luận file logo bị lỗi.

Sau khi triển khai, dùng URL Inspection cho trang chủ và yêu cầu lập chỉ mục.
Google cần thu thập và xử lý lại trang; favicon có thể mất vài ngày đến vài
tuần để cập nhật. Google tự chọn ảnh theo truy vấn và không bảo đảm hiển thị
ảnh hoặc favicon, kể cả khi website đáp ứng hướng dẫn.

Tham khảo: [ảnh trong Google Search](https://developers.google.com/search/docs/appearance/google-images#preferred-image),
[favicon trong Google Search](https://developers.google.com/search/docs/appearance/favicon-in-search).

## Kiểm tra bản triển khai

```sh
bun run build
bun run typecheck
AGENT_TEST_BASE_URL=http://localhost:3200 bun test
```

Chạy HTTP suite với địa chỉ của bản mới. Các trang cũ đang chạy trên production
chưa có ba URL này nên không dùng kết quả từ bản cũ để kết luận bản mới bị lỗi.

Đã kiểm tra bản production trên máy ở cổng 3201: build và TypeScript đạt;
113 tests đạt, gồm HTML/Markdown của cả bảy trang, canonical, sitemap, schema và
liên kết về từng món. React Doctor không phát hiện vấn đề trong các tệp được quét.
Đã xem trang bánh flan trên trình duyệt và bấm liên kết về đúng món Flan chén.
