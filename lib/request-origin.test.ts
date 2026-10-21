import { expect, test } from "bun:test";
import { isLocalDevelopmentOrigin } from "./request-origin";

test("cho phép mDNS cùng host và port khi chạy dev", () => {
  expect(isLocalDevelopmentOrigin("http://rpm1pro.local:3200", "rpm1pro.local:3200", "development")).toBe(true);
});

test("không cho phép mDNS khác host hoặc port", () => {
  for (const host of ["other.local:3200", "rpm1pro.local:3201", null]) {
    expect(isLocalDevelopmentOrigin("http://rpm1pro.local:3200", host, "development")).toBe(false);
  }
});

test("không cho phép ngoại lệ local ngoài môi trường dev", () => {
  for (const environment of ["production", "test", undefined]) {
    for (const origin of ["http://rpm1pro.local:3200", "http://localhost:3200", "http://192.168.1.2:3200"]) {
      expect(isLocalDevelopmentOrigin(origin, "rpm1pro.local:3200", environment)).toBe(false);
    }
  }
});

test("giữ hỗ trợ localhost và IP LAN khi chạy dev", () => {
  for (const host of ["localhost", "127.0.0.1", "192.168.1.2", "10.0.0.2", "172.16.0.2", "172.31.0.2"]) {
    expect(isLocalDevelopmentOrigin(`http://${host}:3200`, `${host}:3200`, "development")).toBe(true);
  }
});

test("từ chối origin bên ngoài, giả mạo đuôi local, hoặc không hợp lệ", () => {
  for (const origin of [null, "null", "not-a-url", "http://evil.example", "http://rpm1pro.local.evil.example:3200", "ftp://rpm1pro.local:3200"]) {
    expect(isLocalDevelopmentOrigin(origin, "rpm1pro.local:3200", "development")).toBe(false);
  }
});
