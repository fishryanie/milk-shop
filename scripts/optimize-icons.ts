import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Recompress deployment icons without resizing or changing their safe areas.
// The original 1024px app-icon.png artwork stays intact.
for (const name of ["favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]) {
  const path = join(import.meta.dir, "../public/icons", name);
  const original = await readFile(path);
  const optimized = await sharp(original)
    .png({ palette: true, colors: 64, quality: 80, dither: 0, effort: 10, compressionLevel: 9 })
    .toBuffer();
  if (optimized.length < original.length) await writeFile(path, optimized);
  console.log(`${name}: ${original.length} → ${Math.min(original.length, optimized.length)} bytes`);
}
