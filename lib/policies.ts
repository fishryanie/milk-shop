import type { ShopSettings } from "@/shared/commerce/types";
import type { ContentSection } from "./site-content";
import type { PolicyPath } from "./policy-links";
import type { SellerProfile } from "./seller-profile";

export const POLICY_UPDATED = "2026-10-29";

export function policySections(path: PolicyPath, settings: ShopSettings, seller: SellerProfile): ContentSection[] {
  const contact = `Gọi ${settings.phone} hoặc liên hệ trực tiếp tại ${settings.address}.${seller.hasExampleEmail ? "" : ` Email hỗ trợ: ${seller.email}.`} Khi liên hệ, hãy cung cấp mã đơn và số điện thoại đã dùng để đặt hàng để tiệm đối chiếu.`;
  const pages: Record<PolicyPath, ContentSection[]> = {
    "/terms-and-conditions": [
      {
        heading: "Phạm vi áp dụng",
        paragraphs: [
          "Điều khoản này áp dụng khi bạn xem thực đơn và đặt món trên caitiemsua.com. Hãy đọc thông tin món, giá, thanh toán, giao hàng, đổi trả và bảo mật trước khi gửi đơn. Các nội dung này cùng thông tin được hai bên xác nhận là cơ sở xử lý giao dịch.",
          "Món ăn, đồ uống có thể chứa sữa, trứng hoặc nguyên liệu gây dị ứng khác. Nếu có yêu cầu về thành phần, chế độ ăn hoặc bảo quản, hãy trao đổi với tiệm trước khi đặt; không chỉ dựa vào hình ảnh minh họa.",
        ],
      },
      {
        heading: "Đặt hàng và xác nhận đơn",
        paragraphs: [
          "Bạn có thể xem, sửa món, số lượng, thông tin nhận hàng và phương thức thanh toán trước bước xác nhận cuối. Giá và tình trạng món được kiểm tra lại khi gửi đơn. Chỉ thêm món vào giỏ chưa tạo đơn hàng; sau khi gửi thành công, hãy giữ mã đơn và kiểm tra trạng thái trong mục Đơn của tôi trên cùng trình duyệt.",
          "Mã đơn xác nhận hệ thống đã ghi nhận yêu cầu. Thời gian chuẩn bị, giao hàng và những khoản phí chưa xác định cần được tiệm liên hệ xác nhận. Nếu không chia sẻ vị trí, tổng tiền ban đầu chỉ gồm tiền món; tiệm phải thông báo phí giao để bạn đồng ý trước khi giao.",
        ],
      },
      {
        heading: "Quyền và nghĩa vụ của người mua",
        paragraphs: [
          "Bạn được xem thông tin món, giá và phí trước khi mua; kiểm tra đơn, yêu cầu hỗ trợ, phản ánh chất lượng và đề nghị đổi trả hoặc hoàn tiền theo chính sách áp dụng. Bạn có quyền yêu cầu làm rõ khoản phí và từ chối khoản phát sinh chưa được thỏa thuận.",
          "Vui lòng cung cấp thông tin nhận hàng chính xác, giữ liên lạc, kiểm tra món khi nhận và thanh toán theo phương thức đã chọn. Không gửi đơn giả, sử dụng thông tin của người khác trái phép hoặc cung cấp mật khẩu, mã OTP trong ghi chú và ảnh thanh toán.",
        ],
      },
      {
        heading: "Quyền và nghĩa vụ của tiệm",
        paragraphs: [
          "Tiệm cung cấp thông tin món và giá, kiểm tra khả năng phục vụ, chuẩn bị món theo đơn đã xác nhận, bảo vệ thông tin khách hàng và tiếp nhận phản ánh. Khi hết món, có sai lệch hoặc giao chậm, tiệm liên hệ để thống nhất hướng xử lý; không tự thay món hay thu thêm khoản phí chưa được đồng ý.",
          "Tiệm có thể liên hệ xác minh yêu cầu bất thường hoặc từ chối đơn không thể phục vụ, có thông tin không hợp lệ hay có dấu hiệu gian lận. Nếu đã nhận tiền nhưng không cung cấp được phần hàng tương ứng, tiệm xử lý khoản tiền đó theo chính sách hoàn tiền.",
        ],
      },
      {
        heading: "Điều chỉnh, hủy đơn và tranh chấp",
        paragraphs: [
          "Muốn sửa hoặc hủy đơn, hãy liên hệ sớm để tiệm kiểm tra món đã được chuẩn bị hoặc bàn giao hay chưa. Website chưa có chức năng tự hủy cho mọi trạng thái. Với món đã làm hoặc đã giao, tiệm trao đổi khả năng xử lý và chi phí thực tế trước khi thống nhất; việc này không loại trừ trách nhiệm khi món sai, thiếu hoặc có lỗi.",
          "Các bên ưu tiên trao đổi qua kênh tiếp nhận khiếu nại. Nếu không thống nhất được, người mua vẫn có quyền yêu cầu cơ quan có thẩm quyền bảo vệ quyền lợi theo pháp luật Việt Nam. Cập nhật chính sách áp dụng cho giao dịch tiếp theo, không tự thay đổi những nội dung đã được hai bên xác nhận cho một đơn trước đó.",
        ],
      },
    ],
    "/payment-policy": [
      {
        heading: "Các phương thức đang hỗ trợ",
        paragraphs: [
          "Website hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản ngân hàng qua mã QR. Chuyển khoản chỉ chọn được khi tiệm đã cấu hình mã QR. Hiện website chưa tích hợp cổng thanh toán online bằng thẻ hoặc ví điện tử.",
          "Kiểm tra tiền món, phí giao hàng, tổng tiền và phương thức ở màn hình xác nhận. Nếu phí giao chưa xác định hoặc bạn tự đặt shipper, số tiền hiển thị chỉ gồm tiền món; khoản giao hàng được xác nhận hoặc thanh toán riêng theo chính sách vận chuyển.",
        ],
      },
      {
        heading: "Thanh toán khi nhận hàng (COD)",
        paragraphs: [
          "Bạn thanh toán bằng tiền mặt khi nhận món theo số tiền đã được xác nhận. Nếu tự đặt shipper đến lấy, hãy thống nhất trước với tiệm và shipper về việc ứng tiền hoặc thu hộ tiền món, đồng thời thanh toán phí dịch vụ giao hàng riêng.",
        ],
      },
      {
        heading: "Chuyển khoản ngân hàng bằng QR",
        paragraphs: [
          "Mã QR và hướng dẫn xuất hiện sau khi tạo đơn. Đối chiếu tên người nhận, ngân hàng, số tiền và ghi mã đơn trong nội dung chuyển khoản. Đơn chờ chuyển khoản có thời gian giữ món 30 phút; hãy xem mốc hết hạn hiển thị trong chi tiết đơn.",
          "Nếu được yêu cầu, tải ảnh xác nhận giao dịch để tiệm kiểm tra. Việc gửi ảnh không đồng nghĩa tiền đã được đối soát; theo dõi trạng thái đơn để biết kết quả. Khi chuyển thiếu, thừa, chuyển trùng hoặc chuyển sau lúc đơn hết hạn, liên hệ tiệm để đối chiếu trước khi chuyển thêm.",
        ],
      },
      {
        heading: "Bảo vệ giao dịch",
        paragraphs: [
          "Chỉ chuyển tới thông tin được hiển thị trong chi tiết đơn chính thức. Tiệm không yêu cầu mật khẩu ngân hàng, mã OTP hay toàn bộ thông tin thẻ. Khi gửi ảnh thanh toán, hãy che số dư và những giao dịch không liên quan nhưng giữ mã giao dịch, số tiền và thời điểm để đối soát.",
        ],
      },
      {
        heading: "Đối soát và hoàn tiền",
        paragraphs: [
          "Nếu có khoản cần hoàn, tiệm xác minh giao dịch và thống nhất số tiền, người nhận, phương thức cùng thời điểm dự kiến. Khoản trả trước được ưu tiên hoàn về tài khoản đã thanh toán; đơn COD có thể hoàn bằng chuyển khoản hoặc tiền mặt theo thỏa thuận. Không có chức năng hoàn tiền tự động trên website.",
          `Điều kiện và chi phí được nêu tại trang Đổi trả và hoàn tiền. ${contact}`,
        ],
      },
    ],
    "/shipping-policy": [
      {
        heading: "Phạm vi và phương thức giao nhận",
        paragraphs: [
          `Tiệm chuẩn bị và bàn giao món tại ${settings.address}. Tiệm hỗ trợ giao quanh cửa hàng trong phạm vi đến 3 km theo đường chim bay. Với địa chỉ trên 3 km, bạn chủ động đặt shipper đến lấy và trao đổi trước về thời gian món sẵn sàng.`,
          "Nếu muốn đến lấy trực tiếp, hãy gọi tiệm để xác nhận món và thời gian trước khi tới. Việc giao nhận phụ thuộc tình trạng nhận đơn, khả năng phục vụ và địa chỉ cụ thể; website không cung cấp dịch vụ giao hàng toàn quốc.",
        ],
      },
      {
        heading: "Khoảng cách và phí giao hàng",
        paragraphs: [
          "Dưới 1 km: miễn phí giao hàng. Từ 1 km đến hết 3 km: phí 10.000 đồng mỗi đơn. Trên 3 km: bạn tự đặt dịch vụ giao hàng và thanh toán phí trực tiếp theo báo giá của dịch vụ đó; phí này không nằm trong tiền món trên website.",
          "Khoảng cách được tính theo đường chim bay từ tiệm đến điểm nhận đã chọn, không phải chiều dài tuyến đường. Nếu bạn bỏ qua việc chia sẻ vị trí, phí giao chưa được tính; tổng trên màn hình chỉ là tiền món. Tiệm liên hệ báo phí theo địa chỉ và chỉ giao sau khi hai bên thống nhất.",
        ],
      },
      {
        heading: "Thời gian dự kiến và chậm giao",
        paragraphs: [
          "Đơn trong phạm vi đến 3 km dự kiến được chuẩn bị và giao trong 30–60 phút sau khi tiệm xác nhận đơn và điều kiện thanh toán. Đơn đến lấy hoặc nhờ shipper riêng dự kiến chuẩn bị trong 15–30 phút; thời gian di chuyển do dịch vụ bạn chọn báo riêng. Đây là thời gian ước tính, phụ thuộc món, lượng đơn, thời tiết và tình hình giao thông; nếu cần nhận vào giờ cụ thể, hãy kiểm tra trước với tiệm.",
          "Khi có thay đổi hoặc chậm hơn thời gian đã hẹn, tiệm trao đổi lại lý do, thời gian mới và phương án tiếp tục hoặc hủy theo tình trạng đơn. Khoản đã thanh toán cho phần không thể cung cấp được xử lý theo chính sách hoàn tiền; không tự áp thêm phụ phí chưa thỏa thuận.",
        ],
      },
      {
        heading: "Kiểm tra và bàn giao món",
        paragraphs: [
          "Hãy giữ điện thoại có thể liên lạc, hướng dẫn điểm nhận và kiểm tra số lượng, loại món, bao bì khi nhận. Nếu có sai, thiếu, đổ vỡ hoặc dấu hiệu chất lượng bất thường, liên hệ tiệm sớm và giữ thông tin đơn, ảnh nếu có để hỗ trợ xác minh.",
          "Tiệm chuẩn bị món và thông tin đối chiếu đơn khi bàn giao. Với shipper do bạn đặt, hai bên cần thống nhất việc lấy món, thu hộ và vận chuyển phù hợp với thực phẩm. Tiệm phối hợp làm rõ sự cố trong quá trình giao nhận; việc sử dụng đơn vị giao hàng khác không loại trừ trách nhiệm của tiệm đối với lỗi thuộc về tiệm.",
        ],
      },
      { heading: "Liên hệ giao nhận", paragraphs: [contact] },
    ],
    "/return-refund-policy": [
      {
        heading: "Trường hợp được tiếp nhận",
        paragraphs: [
          "Tiệm tiếp nhận phản ánh khi giao sai món, sai lựa chọn đã xác nhận, thiếu số lượng, món bị đổ vỡ hoặc có dấu hiệu chất lượng không phù hợp tại thời điểm nhận. Tùy kết quả kiểm tra và mong muốn của bạn, hai bên thống nhất giao bù, đổi món hoặc hoàn tiền phần hàng bị ảnh hưởng.",
          "Vì là thực phẩm, việc đổi do thay đổi sở thích sau khi món đã làm, đã dùng hoặc bảo quản không theo hướng dẫn được xem xét theo tình trạng thực tế, không tự động áp dụng như đổi hàng chưa sử dụng. Điều này không làm mất quyền phản ánh về an toàn thực phẩm hoặc lỗi đã có khi nhận.",
        ],
      },
      {
        heading: "Thời điểm phản ánh và thông tin cần giữ",
        paragraphs: [
          "Vui lòng báo ngay khi nhận hàng hoặc trong vòng 24 giờ kể từ khi nhận để tiệm kiểm tra và ưu tiên hỗ trợ đổi trả thực phẩm kịp thời. Đây là thời điểm khuyến nghị phản ánh, không phải thời hạn loại trừ quyền khiếu nại theo pháp luật. Yêu cầu đến sau được xem xét theo vấn đề, thời điểm phát hiện, hạn sử dụng và chứng cứ liên quan.",
          "Giữ mã đơn, thông tin món, thời điểm nhận và ảnh tình trạng nếu có. Không tiếp tục dùng món nghi có vấn đề; hỏi tiệm cách bảo quản hoặc bàn giao để kiểm tra. Ảnh hay video giúp xác minh, nhưng không phải điều kiện duy nhất để tiếp nhận phản ánh.",
        ],
      },
      {
        heading: "Các bước đổi trả và hoàn tiền",
        paragraphs: [
          `Bước 1: ${contact} Bước 2: mô tả món và vấn đề, thời điểm nhận, phương án mong muốn. Bước 3: tiệm đối chiếu đơn, thanh toán và tình trạng món rồi phản hồi phương án, chi phí cùng thời gian dự kiến. Bước 4: hai bên xác nhận và thực hiện giao bù, đổi hoặc hoàn tiền.`,
          "Không tự gửi món trở lại trước khi thống nhất địa điểm và cách bàn giao. Nếu cần nhận lại món để kiểm tra, tiệm hướng dẫn cụ thể; không yêu cầu khách vận chuyển thực phẩm có dấu hiệu mất an toàn khi chưa có hướng dẫn phù hợp.",
        ],
      },
      {
        heading: "Số tiền, phương thức và thời gian hoàn",
        paragraphs: [
          "Khoản hoàn căn cứ số tiền thực trả cho món hoặc phần đơn được xác nhận cần hoàn, sau khi đối chiếu ưu đãi và các khoản liên quan. Đơn đã trả trước nhưng tiệm không thể cung cấp được hàng được đối soát để hoàn phần tiền tương ứng. Phương thức hoàn là chuyển khoản về bên đã thanh toán hoặc tiền mặt theo thỏa thuận với đơn COD.",
          "Tiệm thực hiện hoàn tiền trong 3–7 ngày làm việc kể từ khi hai bên thống nhất phương án và tiệm nhận đủ thông tin nhận tiền hợp lệ; ngày làm việc là thứ Hai đến thứ Sáu, trừ ngày nghỉ lễ. Thời gian ngân hàng ghi có có thể khác thời điểm tiệm thực hiện lệnh. Nếu phát sinh chậm trễ, tiệm thông báo lý do và tiến độ; bạn có thể liên hệ theo mã đơn để kiểm tra.",
        ],
      },
      {
        heading: "Chi phí đổi trả và giao lại",
        paragraphs: [
          "Với lỗi được xác định thuộc về tiệm, tiệm chịu chi phí hợp lý để xử lý phần món đó, gồm phí nhận lại hoặc giao bù nếu cần; không thu thêm tiền để sửa lỗi của tiệm. Với yêu cầu thay đổi từ khách hoặc dịch vụ giao do khách tự đặt, mọi khoản chi phí khác phải được trao đổi, xác định trách nhiệm và đồng ý trước khi thực hiện.",
        ],
      },
    ],
    "/pricing-policy": [
      {
        heading: "Giá niêm yết và đơn vị tính",
        paragraphs: [
          "Giá trên website được hiển thị bằng đồng Việt Nam (VND) cùng đơn vị bán của từng món. Món có nhiều kích cỡ có thể hiển thị giá từ mức thấp nhất; giá chính xác phụ thuộc size, topping và số lượng bạn chọn. Hãy kiểm tra thông tin lựa chọn và đơn giá trong giỏ trước khi xác nhận.",
          "Tiền món trên website là khoản tính cho món và lựa chọn đã hiển thị. Nếu có khoản thuế hoặc chi phí khác áp dụng cho giao dịch, tiệm phải giải thích rõ và xác nhận tổng phải trả trước khi thu; không tự cộng khoản chưa được thông báo vào đơn đã xác nhận. Khi cần hóa đơn, hãy liên hệ tiệm trước khi thanh toán để kiểm tra thông tin.",
        ],
      },
      {
        heading: "Phí giao hàng và tổng thanh toán",
        paragraphs: [
          "Phí giao được tách khỏi tiền món: dưới 1 km miễn phí, từ 1–3 km là 10.000 đồng, trên 3 km khách tự đặt shipper và trả phí riêng. Nếu bỏ qua vị trí, tổng ban đầu chưa gồm phí giao; tiệm liên hệ xác nhận khoản này sau. Xem trang Vận chuyển và giao hàng để biết cách tính khoảng cách và điều kiện giao.",
          "Trước khi gửi đơn, màn hình xác nhận cho biết tiền món, phí đã xác định và tổng tiền. Kiểm tra các ghi chú về phí đang chờ xác nhận hoặc phí ship trả riêng để tránh hiểu số tiền món là toàn bộ chi phí nhận hàng.",
        ],
      },
      {
        heading: "Khuyến mãi và điều kiện ưu đãi",
        paragraphs: [
          "Ưu đãi chỉ áp dụng khi tiệm công bố rõ chương trình và điều kiện: thời gian, món hoặc đối tượng áp dụng, giá trị đơn tối thiểu nếu có, số lượng giới hạn và khả năng kết hợp ưu đãi. Nhãn giới thiệu món hoặc ảnh quảng bá không tự tạo ra quyền giảm giá nếu không kèm điều kiện cụ thể.",
          "Website hiện chưa có ô nhập mã giảm giá. Chỉ xem ưu đãi là được áp dụng khi giá hoặc khoản giảm đã được thể hiện rõ và được tiệm xác nhận cho đơn; không tự trừ tiền khi chuyển khoản. Khi đổi hoặc hoàn món có khuyến mãi, khoản xử lý dựa trên số tiền thực trả và điều kiện đã công bố.",
        ],
      },
      {
        heading: "Cập nhật giá và xử lý sai lệch",
        paragraphs: [
          `Giá và tình trạng món có thể thay đổi theo thực đơn; hệ thống kiểm tra lại khi đặt. Nếu phát hiện giá khác ảnh cũ, sai tổng tiền hoặc chưa rõ điều kiện ưu đãi, hãy liên hệ trước khi thanh toán. Tiệm trao đổi cách xử lý và không tự tăng giá hay thay món của đơn đã được hai bên xác nhận. ${contact}`,
        ],
      },
    ],
    "/complaint-policy": [
      {
        heading: "Kênh tiếp nhận phản ánh",
        paragraphs: [
          `Tiệm tiếp nhận khiếu nại về món, giao nhận, thanh toán, thông tin trên website và dữ liệu khách hàng. ${contact}`,
          `Trang Liên hệ có nút gọi điện và đường dẫn bản đồ. Website chưa có biểu mẫu khiếu nại.${seller.hasExampleEmail ? " Email đang là dữ liệu mẫu, chưa nhận phản ánh; vui lòng gọi điện cho tiệm." : " Bạn cũng có thể gửi phản ánh tới email hỗ trợ đã công bố."} Không gửi thông tin đơn lên một trang hoặc tài khoản lạ tự nhận là tiệm.`,
        ],
      },
      {
        heading: "Thông tin cần cung cấp",
        paragraphs: [
          "Hãy nêu mã đơn, số điện thoại đặt hàng, thời điểm sự việc, món hoặc khoản thanh toán liên quan, nội dung phản ánh và cách giải quyết mong muốn. Ảnh món, ảnh giao dịch đã che thông tin không liên quan hoặc thông tin người giao có thể giúp kiểm tra; không cung cấp mật khẩu hay mã OTP.",
          "Nếu liên quan chất lượng thực phẩm, hãy báo sớm khi phát hiện và ngừng sử dụng món nghi có vấn đề. Với yêu cầu về dữ liệu, tiệm cần xác minh thông tin người yêu cầu trước khi cung cấp hoặc chỉnh sửa chi tiết đơn.",
        ],
      },
      {
        heading: "Quy trình và thời gian xử lý",
        paragraphs: [
          "Bước 1: tiệm ghi nhận phản ánh và xác nhận kênh liên hệ lại. Bước 2: đối chiếu đơn, thông tin giao nhận hoặc thanh toán; trao đổi thêm khi còn thiếu dữ liệu. Bước 3: thông báo kết quả kiểm tra, phương án cùng thời gian thực hiện. Bước 4: thực hiện nội dung đã thống nhất và xác nhận kết quả với khách.",
          "Tiệm xác nhận tiếp nhận trong 1 ngày làm việc và xử lý phản ánh thông thường trong 3 ngày làm việc kể từ khi có đủ thông tin. Trường hợp cần xác minh với ngân hàng hoặc bên giao hàng, thời gian dự kiến tối đa 7 ngày làm việc; tiệm thông báo lý do và cập nhật tiến độ nếu cần thêm thời gian. Ngày làm việc là thứ Hai đến thứ Sáu, trừ ngày nghỉ lễ. Các thời hạn bắt buộc theo pháp luật, nếu áp dụng, vẫn được ưu tiên tuân thủ.",
        ],
      },
      {
        heading: "Khi chưa thống nhất kết quả",
        paragraphs: [
          "Bạn có thể đề nghị tiệm kiểm tra lại và bổ sung thông tin cho phản ánh. Nếu chưa đạt thỏa thuận, bạn vẫn có quyền liên hệ tổ chức bảo vệ người tiêu dùng, cơ quan có thẩm quyền hoặc thực hiện biện pháp giải quyết tranh chấp theo pháp luật Việt Nam. Việc tiếp nhận phản ánh không phụ thuộc vào việc bạn từ bỏ quyền khiếu nại khác.",
          "Thông tin khiếu nại chỉ được dùng trong phạm vi cần thiết để xác minh, giải quyết và thực hiện nghĩa vụ liên quan theo chính sách bảo mật. Tiệm không yêu cầu công khai dữ liệu cá nhân của khách để được hỗ trợ.",
        ],
      },
    ],
    "/cookie-policy": [
      {
        heading: "Cookie và bộ nhớ trình duyệt được dùng để làm gì?",
        paragraphs: [
          "Cookie là dữ liệu nhỏ trình duyệt lưu cho website; bộ nhớ cục bộ (localStorage) lưu dữ liệu trên thiết bị để bạn dùng lại ở lần truy cập sau. Cái Tiệm Sữa dùng các cơ chế này cho phiên mua hàng, giỏ và hướng dẫn đặt món. Website hiện không tích hợp công cụ quảng cáo hoặc đo lường hành vi như Google Analytics hay Meta Pixel.",
        ],
      },
      {
        heading: "Cookie phiên mua hàng milk_guest",
        paragraphs: [
          "Cookie milk_guest chứa mã phiên đã ký, giúp nhận biết phiên mua hàng và giới hạn truy cập các đơn theo phiên đó. Thời hạn tối đa là 180 ngày kể từ lúc tạo. Cookie có thuộc tính HttpOnly, SameSite=Lax và dùng Secure trên môi trường production; JavaScript của trang không đọc được trực tiếp cookie này.",
          "Nếu chặn hoặc xóa cookie, chức năng đặt hàng và xem lại đơn trên trình duyệt có thể không hoạt động như trước. Xóa cookie không tự xóa thông tin đơn đã được lưu trong hệ thống; hãy liên hệ tiệm khi cần xử lý dữ liệu đơn.",
        ],
      },
      {
        heading: "Giỏ hàng và hướng dẫn trên thiết bị",
        paragraphs: [
          "Khóa milk-cart trong localStorage lưu món, lựa chọn và số lượng trong giỏ. Khóa milk-tour-seen ghi nhớ việc bạn đã xem hướng dẫn lần đầu. Các dữ liệu này không có lịch tự hết hạn cố định trong mã website, có thể được cập nhật khi bạn thao tác và mất khi bạn xóa dữ liệu trang hoặc trình duyệt xóa bộ nhớ.",
          "Nếu dùng thiết bị chung, người sử dụng cùng hồ sơ trình duyệt có thể thấy giỏ và truy cập phiên mua hàng còn lưu. Nên xóa dữ liệu trang sau khi dùng thiết bị công cộng; ghi lại mã đơn trước nếu bạn cần tiệm hỗ trợ về sau.",
        ],
      },
      {
        heading: "Dịch vụ bản đồ của bên thứ ba",
        paragraphs: [
          "Website có bản đồ Google Maps tại phần liên hệ và bản đồ OpenStreetMap khi chọn điểm giao. Khi tải bản đồ, trình duyệt kết nối với nhà cung cấp; họ có thể nhận địa chỉ IP, thông tin trình duyệt và yêu cầu tải bản đồ. Cookie hoặc dữ liệu do nhà cung cấp xử lý thuộc chính sách riêng của dịch vụ đó.",
          "Quyền lấy vị trí GPS do trình duyệt quản lý riêng với cookie. Bạn có thể từ chối hoặc thu hồi quyền vị trí trong cài đặt trang; nếu không chia sẻ vị trí, nhập địa chỉ để tiệm xác nhận phí giao sau.",
        ],
      },
      {
        heading: "Quản lý và yêu cầu hỗ trợ",
        paragraphs: [
          "Bạn có thể xem, chặn hoặc xóa cookie và bộ nhớ website trong phần Quyền riêng tư / Dữ liệu trang của trình duyệt. Các tùy chọn có tên khác nhau giữa thiết bị. Thao tác này có thể xóa giỏ, đặt lại hướng dẫn và làm mất quyền xem đơn theo phiên trên thiết bị đó.",
          `Đọc thêm Chính sách bảo mật về việc sử dụng, lưu trữ và xử lý yêu cầu dữ liệu cá nhân. ${contact}`,
        ],
      },
    ],
  };
  return pages[path];
}
