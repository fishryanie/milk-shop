type Representation = "html" | "markdown";

// RFC 9110 §12.5.1: the most specific matching media range supplies the
// quality for each representation. An explicit q=0 overrides a wildcard.
export function negotiateContent(accept: string | null): Representation | null {
  if (!accept?.trim()) return "html";
  const ranges = accept.split(",").map((entry, order) => {
    const [type, ...parameters] = entry.trim().toLowerCase().split(";");
    let quality = 1;
    const mediaParameters: string[] = [];
    let weightSeen = false;
    for (const parameter of parameters) {
      const [name, value] = parameter.trim().split("=");
      if (name === "q") {
        quality = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value ?? "")
          ? Number(value)
          : 0;
        weightSeen = true;
      } else if (!weightSeen) {
        mediaParameters.push(parameter.trim());
      }
    }
    return { type, quality, order, mediaParameters };
  });
  const score = (type: string) => {
    const matches = ranges
      .filter(
        (range) =>
          (range.type === type ||
            range.type === "text/*" ||
            range.type === "*/*") &&
          range.mediaParameters.every(
            (parameter) =>
              parameter === "charset=utf-8" || parameter === 'charset="utf-8"',
          ),
      )
      .map((range) => ({
        ...range,
        specificity:
          (range.type === type ? 2 : range.type === "text/*" ? 1 : 0) * 10 +
          range.mediaParameters.length,
      }))
      .sort((a, b) => b.specificity - a.specificity || a.order - b.order);
    return matches[0] ?? { quality: 0, specificity: -1, order: Infinity };
  };
  const html = score("text/html");
  const markdown = score("text/markdown");
  if (html.quality === 0 && markdown.quality === 0) return null;
  if (markdown.quality !== html.quality)
    return markdown.quality > html.quality ? "markdown" : "html";
  if (markdown.specificity !== html.specificity)
    return markdown.specificity > html.specificity ? "markdown" : "html";
  return markdown.order < html.order ? "markdown" : "html";
}

export function errorResponse(request: Request, status: 404 | 406 = 404) {
  const representation = negotiateContent(request.headers.get("accept"));
  const markdown = representation === "markdown";
  const finalStatus = representation === null ? 406 : status;
  const message =
    finalStatus === 404
      ? "Trang bạn tìm không tồn tại hoặc đã được chuyển đi. Hãy xem các liên kết bên dưới để tiếp tục."
      : "Trang này hỗ trợ text/html và text/markdown. Hãy gửi lại yêu cầu với một trong hai kiểu nội dung này.";
  const body = markdown
    ? `# ${finalStatus} — Không tìm thấy trang\n\n${message}\n\n- [Trang chủ](https://caitiemsua.com/)\n- [Hướng dẫn cho agent](https://caitiemsua.com/llms.txt)\n- [Sitemap](https://caitiemsua.com/sitemap.xml)\n`
    : representation === null
      ? message
      : `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 — Cái Tiệm Sữa</title></head><body style="margin:0;background:#f5faff;color:#153454;font-family:system-ui,sans-serif"><main style="max-width:640px;margin:15vh auto;padding:24px"><h1>404 — Không tìm thấy trang</h1><p>${message}</p><p><a href="/">Cái Tiệm Sữa</a> · <a href="/llms.txt">Hướng dẫn cho agent</a> · <a href="/sitemap.xml">Sitemap</a></p></main></body></html>`;
  return new Response(request.method === "HEAD" ? null : body, {
    status: finalStatus,
    headers: {
      "Content-Type": markdown
        ? "text/markdown; charset=utf-8"
        : representation === null
          ? "text/plain; charset=utf-8"
          : "text/html; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
      Link: '</llms.txt>; rel="describedby"',
    },
  });
}
