import { expect, spyOn, test } from "bun:test";
import { requestDeliveryLocation } from "./delivery-location";

const position = {
  coords: { latitude: 10.85, longitude: 106.67, accuracy: 25 },
} as GeolocationPosition;
const geoError = (code: number) => ({ code }) as GeolocationPositionError;

test("asks the browser for a fresh position immediately", async () => {
  let requested = false;
  const request = requestDeliveryLocation({
    isSecureContext: true,
    geolocation: { getCurrentPosition(success, _failure, options) {
      requested = true;
      expect(options?.enableHighAccuracy).toBe(true);
      expect(options?.maximumAge).toBe(0);
      success(position);
    } },
  });
  expect(requested).toBe(true);
  expect(await request).toEqual({ lat: 10.85, lng: 106.67, accuracy: 25 });
});

test("does not retry a denied permission and explains how to allow it", async () => {
  let calls = 0;
  const request = requestDeliveryLocation({
    isSecureContext: true,
    geolocation: { getCurrentPosition(_success, failure) {
      calls++;
      failure?.(geoError(1));
    } },
  });
  await expect(request).rejects.toThrow("Quyền vị trí đang bị chặn");
  expect(calls).toBe(1);
});

for (const code of [2, 3]) {
  test(`falls back to network positioning after GPS error ${code}`, async () => {
    const options: (PositionOptions | undefined)[] = [];
    const location = await requestDeliveryLocation({
      isSecureContext: true,
      geolocation: { getCurrentPosition(success, failure, currentOptions) {
        options.push(currentOptions);
        if (options.length === 1) failure?.(geoError(code));
        else success(position);
      } },
    });
    expect(options).toHaveLength(2);
    expect(options[1]).toEqual({ enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 });
    expect(location.lat).toBe(10.85);
  });
}

for (const [code, message] of [[2, "Thiết bị chưa xác định được vị trí"], [3, "Lấy vị trí quá lâu"]] as const) {
  test(`shows the specific error when both position attempts fail (${code})`, async () => {
    await expect(requestDeliveryLocation({
      isSecureContext: true,
      geolocation: { getCurrentPosition(_success, failure) { failure?.(geoError(code)); } },
    })).rejects.toThrow(message);
  });
}

test("explains HTTPS requirements before calling geolocation", async () => {
  let calls = 0;
  await expect(requestDeliveryLocation({
    isSecureContext: false,
    geolocation: { getCurrentPosition() { calls++; } },
  })).rejects.toThrow("HTTPS");
  expect(calls).toBe(0);
});

test("handles a browser without geolocation", async () => {
  await expect(requestDeliveryLocation({ isSecureContext: true })).rejects.toThrow("Trình duyệt chưa hỗ trợ định vị");
});

test("rejects unusable coordinates before sending them to the delivery API", async () => {
  await expect(requestDeliveryLocation({
    isSecureContext: true,
    geolocation: { getCurrentPosition(success) {
      success({ ...position, coords: { ...position.coords, latitude: NaN } });
    } },
  })).rejects.toThrow("vị trí không hợp lệ");
});

test("stopping the request prevents a late callback from starting another lookup", async () => {
  const controller = new AbortController();
  let calls = 0;
  let onFailure: PositionErrorCallback | null | undefined;
  const request = requestDeliveryLocation({
    isSecureContext: true,
    signal: controller.signal,
    geolocation: { getCurrentPosition(_success, failure) {
      calls++;
      onFailure = failure;
    } },
  });
  controller.abort();
  await expect(request).rejects.toThrow("Đã dừng định vị");
  onFailure?.(geoError(3));
  expect(calls).toBe(1);
});

test("recovers when a browser never responds to the permission request", async () => {
  let expire: () => void = () => {};
  let onFailure: PositionErrorCallback | null | undefined;
  let calls = 0;
  const timer = spyOn(globalThis, "setTimeout").mockImplementation(((callback: () => void) => {
    expire = callback;
    return 0;
  }) as typeof setTimeout);
  try {
    const request = requestDeliveryLocation({
      isSecureContext: true,
      geolocation: { getCurrentPosition(_success, failure) {
        calls++;
        onFailure = failure;
      } },
    });
    expire();
    await expect(request).rejects.toThrow("Trình duyệt chưa phản hồi");
    onFailure?.(geoError(3));
    expect(calls).toBe(1);
  } finally {
    timer.mockRestore();
  }
});
