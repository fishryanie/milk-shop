# Màu giao diện theo menu in

Bảng màu được lấy gần đúng từ ảnh menu Sữa tuyết Vân Nam. Ảnh có hiệu ứng ánh sáng nên đây là bảng màu dùng trên màn hình, không phải mã CMYK của bản in gốc.

| Vai trò | HEX |
| --- | --- |
| Xanh royal đậm | `#014BA6` |
| Xanh chính, liên kết và lựa chọn | `#0862C0` |
| Đầu sáng của nút | `#087BC4` |
| Xanh sáng trong ảnh menu, trang trí | `#3892DF` |
| Xanh băng | `#BFDEFB` |
| Nền xanh nhạt | `#E8F3FF` |
| Nền trang | `#F5FAFF` |

Gradient nút: `linear-gradient(135deg, #014BA6 0%, #0862C0 55%, #087BC4 100%)`.

Đầu sáng của nút đậm hơn xanh sáng trong ảnh để chữ trắng đạt độ tương phản tối thiểu 4.5:1. Các trạng thái hover/nhấn dùng độ sáng để giữ nguyên gradient. Màu xanh lá và đỏ vẫn thể hiện trạng thái còn hàng, thành công hoặc lỗi.

Các token màu và gradient nằm trong `app/globals.css`; lớp `bg-brand` dùng cho các nút chính trên cả desktop và mobile.
