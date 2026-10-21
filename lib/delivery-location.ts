import type { Customer } from "@/shared/commerce/types";

type LocationEnvironment = {
  isSecureContext: boolean;
  geolocation?: Pick<Geolocation, "getCurrentPosition">;
  signal?: AbortSignal;
};

const locationErrors: Record<number, string> = {
  1: "Quyền vị trí đang bị chặn. Bạn cho phép Vị trí trong cài đặt của trang web và bật Dịch vụ định vị trên thiết bị, rồi nhấn thử lại. Nếu mở từ Zalo/Facebook, hãy mở trang bằng Safari hoặc Chrome.",
  2: "Thiết bị chưa xác định được vị trí. Bạn bật Dịch vụ định vị/GPS, kiểm tra kết nối mạng rồi nhấn thử lại nhé.",
  3: "Lấy vị trí quá lâu. Bạn kiểm tra GPS và kết nối mạng rồi nhấn thử lại nhé.",
};

export function requestDeliveryLocation({
  isSecureContext,
  geolocation,
  signal,
}: LocationEnvironment): Promise<NonNullable<Customer["location"]>> {
  if (!isSecureContext)
    return Promise.reject(new Error("Trang đang dùng kết nối không hỗ trợ định vị. Bạn mở bằng HTTPS (kể cả khi thử qua IP Wi-Fi) rồi nhấn lấy vị trí nhé."));
  if (!geolocation)
    return Promise.reject(new Error("Trình duyệt chưa hỗ trợ định vị. Bạn mở trang bằng Safari hoặc Chrome rồi nhấn lấy vị trí nhé."));

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      settled = true;
      clearTimeout(deadline);
      signal?.removeEventListener("abort", abort);
    };
    const fail = (message: string) => {
      if (settled) return;
      cleanup();
      reject(new Error(message));
    };
    const abort = () => fail("Đã dừng định vị. Bạn nhấn lấy vị trí khi sẵn sàng nhé.");
    // The native timeout excludes time waiting for permission. Some embedded
    // browsers never show a prompt or call back, so bound the entire request.
    const deadline = setTimeout(() => fail("Trình duyệt chưa phản hồi yêu cầu vị trí. Bạn kiểm tra quyền Vị trí của trang và thiết bị, hoặc mở trang bằng Safari/Chrome rồi thử lại nhé."), 30_000);
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener("abort", abort, { once: true });
    const success = ({ coords }: GeolocationPosition) => {
      if (settled) return;
      const { latitude: lat, longitude: lng, accuracy } = coords;
      if (!Number.isFinite(lat) || Math.abs(lat) > 90 ||
          !Number.isFinite(lng) || Math.abs(lng) > 180 ||
          !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100_000) {
        fail("Thiết bị trả về vị trí không hợp lệ. Bạn bật định vị chính xác rồi nhấn thử lại nhé.");
        return;
      }
      cleanup();
      resolve({ lat, lng, accuracy });
    };
    const failure = (error: GeolocationPositionError) =>
      fail(locationErrors[error.code] || "Chưa lấy được vị trí. Bạn kiểm tra quyền vị trí rồi nhấn thử lại nhé.");
    // Request immediately from the click handler; querying permissions first can
    // lose the user gesture. Fall back to network positioning if GPS fails.
    const request = (enableHighAccuracy: boolean) => {
      if (settled) return;
      try {
        geolocation.getCurrentPosition(success, (error) => {
          if (enableHighAccuracy && (error.code === 2 || error.code === 3))
            request(false);
          else
            failure(error);
        }, { enableHighAccuracy, timeout: enableHighAccuracy ? 12_000 : 10_000, maximumAge: 0 });
      } catch {
        fail("Trình duyệt không cho phép lấy vị trí. Bạn kiểm tra quyền Vị trí rồi thử lại bằng Safari/Chrome nhé.");
      }
    };
    request(true);
  });
}
