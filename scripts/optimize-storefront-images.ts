import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const directory = join(import.meta.dir, "../public/images");

// Keep the original artwork intact. Static imports give each generated variant
// a content hash and immutable caching without a first-request image transform.
for (const { source, prefix, widths, quality } of [
  {
    source: "dessert-duo-1280.webp",
    prefix: "dessert-hero",
    widths: [240, 320, 480, 640, 960, 1280],
    quality: 68,
  },
  {
    source: "cai-tiem-sua-logo.png",
    prefix: "store-logo",
    widths: [174, 228, 348, 456, 684],
    quality: 55,
  },
]) {
  const original = await readFile(join(directory, source));
  for (const width of widths) {
    let resized = sharp(original).resize({ width, withoutEnlargement: true });
    if (prefix === "store-logo") {
      // Palette compression is more efficient for this small transparent mark
      // than spending bytes on a noisy alpha channel. Preserve transparency.
      const palette = await resized.png({ palette: true, colors: 128, dither: 0, effort: 10 }).toBuffer();
      resized = sharp(palette);
    }
    const { size } = await resized
      .webp(prefix === "store-logo" ? { lossless: true, effort: 6 } : { quality, alphaQuality: 50, effort: 6 })
      .toFile(join(directory, `${prefix}-${width}.webp`));
    console.log(`${prefix}-${width}.webp: ${(size / 1024).toFixed(1)} KiB`);
    if (prefix === "dessert-hero") {
      const avif = await sharp(original)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: 35, effort: 6 })
        .toFile(join(directory, `${prefix}-${width}.avif`));
      console.log(`${prefix}-${width}.avif: ${(avif.size / 1024).toFixed(1)} KiB`);
    }
  }
}
