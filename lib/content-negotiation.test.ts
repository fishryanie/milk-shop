import { describe, expect, test } from "bun:test";
import { errorResponse, negotiateContent } from "./content-negotiation";

describe("HTTP content negotiation", () => {
  test.each([
    [null, "html"],
    ["", "html"],
    ["*/*", "html"],
    ["text/html", "html"],
    ["text/markdown", "markdown"],
    ["TEXT/MARKDOWN; CHARSET=UTF-8", "markdown"],
    ['text/markdown;charset="utf-8"', "markdown"],
    ["text/markdown;q=0.8,text/html;q=0.9", "html"],
    ["text/html;q=0.1,text/markdown;q=0.9", "markdown"],
    ["text/markdown;q=0,*/*;q=1", "html"],
    ["text/html;q=0,text/markdown;q=0,*/*;q=1", null],
    ["text/*;q=0.8,text/html;q=0.2", "markdown"],
    ["text/*;q=0.8,text/markdown;q=0.2", "html"],
    ["*/*;q=0.8,text/markdown;q=0.8", "markdown"],
    ["text/markdown,text/html", "markdown"],
    ["text/html,text/markdown", "html"],
    [
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8",
      "html",
    ],
    ["text/markdown;q=invalid,text/html;q=0.1", "html"],
    ["text/markdown;q=1.1", null],
    ["text/markdown;q=0.0000", null],
    ["application/json", null],
    ["application/text/markdown", null],
    ["text/markdown;variant=unsupported", null],
    ["text/html;q=0.2,text/markdown;q=0.9;extension=allowed", "markdown"],
  ] as const)("%s selects %s", (accept, expected) => {
    expect(negotiateContent(accept)).toBe(expected);
  });
});

test("missing agent pages keep HTTP 404, Markdown explanation and discovery links", async () => {
  const response = errorResponse(
    new Request("https://caitiemsua.com/missing", {
      headers: { Accept: "text/markdown" },
    }),
  );
  expect(response.status).toBe(404);
  expect(response.headers.get("Content-Type")).toBe(
    "text/markdown; charset=utf-8",
  );
  expect(response.headers.get("Vary")).toBe("Accept");
  const body = await response.text();
  expect(body.length).toBeGreaterThan(20);
  expect(body).toContain(
    "[Hướng dẫn cho agent](https://caitiemsua.com/llms.txt)",
  );
  expect(body).not.toContain("<html");
});

test("HTML errors and HEAD preserve their representations and status", async () => {
  const response = errorResponse(
    new Request("https://caitiemsua.com/missing", {
      headers: { Accept: "text/html" },
    }),
  );
  expect(response.status).toBe(404);
  expect(response.headers.get("Content-Type")).toContain("text/html");
  expect(await response.text()).toContain('<html lang="vi">');
  const head = errorResponse(
    new Request("https://caitiemsua.com/missing", {
      method: "HEAD",
      headers: { Accept: "text/markdown" },
    }),
  );
  expect(head.status).toBe(404);
  expect(await head.text()).toBe("");
});

test("unsupported representations return a non-cacheable 406", () => {
  const response = errorResponse(
    new Request("https://caitiemsua.com/", {
      headers: { Accept: "application/json" },
    }),
    406,
  );
  expect(response.status).toBe(406);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
