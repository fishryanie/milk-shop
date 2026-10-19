import sharp from "sharp";
import { CommerceError } from "@/shared/commerce/validation";
export async function receiptImage(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 4_000_000) throw new CommerceError("Ảnh tối đa 3 MB.", 413);
  // Read a capped raw image body; multipart parsing can buffer arbitrary uploads.
  const reader = request.body?.getReader();
  if (!reader) throw new CommerceError("Chọn ảnh bill chuyển khoản.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 3_000_000) {
        await reader.cancel();
        throw new CommerceError("Ảnh tối đa 3 MB.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    const image = sharp(Buffer.concat(chunks), {
      limitInputPixels: 20_000_000,
    });
    const meta = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format || ""))
      throw new Error("format");
    const data = await image
      .rotate()
      .resize({
        width: 1600,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    if (data.length > 1_000_000) throw new Error("size");
    return data;
  } catch {
    throw new CommerceError(
      "Không đọc được ảnh. Hãy chọn JPG, PNG hoặc WebP rõ nét, tối đa 3 MB.",
    );
  }
}
