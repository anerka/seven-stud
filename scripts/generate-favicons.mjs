/**
 * Composites public/playing-cards.png onto a black square with padding,
 * then writes favicon / PWA icon sizes to public/.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public", "playing-cards.png");
const outDir = path.join(root, "public");

/** Fraction of canvas edge reserved as padding (each side). */
const PADDING_RATIO = 0.12;
/** Pixel size of the master square composition (also written as icon-512). */
const BASE = 512;

const outputs = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

async function main() {
  const inner = Math.round(BASE * (1 - 2 * PADDING_RATIO));
  const resized = await sharp(src)
    .resize(inner, inner, { fit: "inside" })
    .ensureAlpha()
    .toBuffer();

  const { width, height } = await sharp(resized).metadata();
  const left = Math.round((BASE - width) / 2);
  const top = Math.round((BASE - height) / 2);

  const master = await sharp({
    create: {
      width: BASE,
      height: BASE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();

  await mkdir(outDir, { recursive: true });

  for (const { name, size } of outputs) {
    await sharp(master)
      .resize(size, size, { fit: "fill" })
      .png()
      .toFile(path.join(outDir, name));
    console.log(`wrote public/${name} (${size}×${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
