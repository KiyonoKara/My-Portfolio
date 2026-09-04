#!/usr/bin/env node
/**
 * Build-time image optimizer.
 *
 * Reads full-resolution masters from `raw-images/photos` and `raw-images/images`,
 * and writes optimized, responsive variants into `public/photos` and
 * `public/images` plus a manifest (`src/lib/image-manifest.ts`) that components
 * read to emit `srcset`/`sizes`/`width`/`height`.
 *
 * Workflow for a maintainer adding a photo:
 *   1. Put the full-res original in `raw-images/photos/` (or `raw-images/images/`
 *      for in-page project shots).
 *   2. Run `pnpm images` then regenerate `public/...` + the manifest.
 *   3. Commit the regenerated `public/…` output (NOT `raw-images/`, which is
 *      gitignored — the committed optimized files are what get deployed).
 *
 * Notes:
 *   - `raw-images/` is gitignored, so a fresh clone or CI has no originals and
 *     this script exits quietly, leaving the committed optimized assets in place.
 *   - The fallback file keeps the ORIGINAL basename + extension so every existing
 *     string-path reference (`cover`, `image`, `gallery[]`, config `src`) keeps
 *     resolving to a real, optimized file.
 *   - EXIF rotation is applied; width/height in the manifest reflect the rotated
 *     output so browsers reserve the correct aspect ratio (avoids CLS).
 */
import { readdir, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = {
  photos: path.join(ROOT, "raw-images", "photos"),
  images: path.join(ROOT, "raw-images", "images"),
};
const OUT = {
  photos: path.join(ROOT, "public", "photos"),
  images: path.join(ROOT, "public", "images"),
};
const MANIFEST = path.join(ROOT, "src", "lib", "image-manifest.ts");

// width ladder (px) for responsive `srcset`. Only widths less than or equal to the source are kept
const WEBP_WIDTHS = [640, 960, 1440, 1920];
// single fallback jpeg/png at the original path
const MAX_FALLBACK_WIDTH = 1600;
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 78;

// graceful skip when no originals present (CI / fresh clone)
if (!existsSync(SRC.photos) && !existsSync(SRC.images)) {
  console.log("[images] raw-images/ not found — keeping committed optimized assets");
  process.exit(0);
}

const manifest = {};
let emittedBytes = 0;
let fileCount = 0;

// rename the pre-clean copy so script doesn't get destroyed
async function processSource(kind, srcDir, outDir, logical) {
  if (!existsSync(srcDir)) return;
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.log(`[images] no rasters in raw-images/${kind}/ — nothing to generate`);
    return;
  }

  for (const file of files) {
    const parsed = path.parse(file);
    const stem = parsed.name;
    const ext = parsed.ext.toLowerCase().replace(/^\./, "");
    const srcFile = path.join(srcDir, file);
    const logicalPath = `${logical}/${stem}.${ext}`;

    const meta = await sharp(srcFile).metadata();
    if (!meta.width || !meta.height) {
      console.warn(`[images]  skip (no size metadata): ${file}`);
      continue;
    }
    const sw = meta.width;
    const sh = meta.height;

    // WebP variants at the width ladder (never upscale).
    let widths = WEBP_WIDTHS.filter((w) => w <= sw);
    if (widths.length === 0) widths = [Math.min(sw, 640)];

    for (const w of widths) {
      const outFile = path.join(outDir, `${stem}-${w}.webp`);
      await sharp(srcFile)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outFile);
    }

    // Fallback at the ORIGINAL basename+ext (keeps every string-path ref working)
    const fallbackExt = ext === "png" ? "png" : "jpeg";
    const fallbackFile = path.join(outDir, `${stem}.${fallbackExt}`);
    if (ext === "png") {
      await sharp(srcFile)
        .rotate()
        .resize({ width: MAX_FALLBACK_WIDTH, withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toFile(fallbackFile);
    } else {
      await sharp(srcFile)
        .rotate()
        .resize({ width: MAX_FALLBACK_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(fallbackFile);
    }

    // Truthful dimensions come from the written fallback (rotation applied)
    const outMeta = await sharp(fallbackFile).metadata();

    manifest[logicalPath] = {
      src: `${logical}/${stem}-${widths[widths.length - 1]}.webp`,
      fallback: logicalPath,
      width: outMeta.width,
      height: outMeta.height,
      webp: widths.map((w) => ({ src: `${logical}/${stem}-${w}.webp`, width: w })),
    };

    for (const w of widths) {
      emittedBytes += await statSize(path.join(outDir, `${stem}-${w}.webp`));
    }
    emittedBytes += await statSize(fallbackFile);
    fileCount += widths.length + 1;
    console.log(`[images]  ${logicalPath} → ${widths.length} webp + fallback (${outMeta.width}×${outMeta.height})`);
  }
}

async function statSize(p) {
  const { stat } = await import("node:fs/promises");
  return (await stat(p)).size;
}

await processSource("photos", SRC.photos, OUT.photos, "/photos");
await processSource("images", SRC.images, OUT.images, "/images");

// write the manifest module
const body = `/**
 * AUTO-GENERATED by scripts/optimize-images.mjs — do not edit by hand.
 * Regenerate with \`pnpm images\`.
 */
export interface ImgVariant {
  src: string;
  width: number;
}

export interface ImgManifestEntry {
  /** Preferred (WebP) large variant — for <picture> <source srcset>. */
  src: string;
  /** Fallback file at the original path/extension (broad compatibility). */
  fallback: string;
  /** Rotated output dimensions (layout ratio; avoids CLS). */
  width: number;
  height: number;
  webp: ImgVariant[];
}

export const imageManifest: Record<string, ImgManifestEntry> = ${JSON.stringify(manifest, null, 2)};
`;

await writeFile(MANIFEST, body, "utf8");
console.log(`\n[images] wrote ${fileCount} files (~${(emittedBytes / 1024 / 1024).toFixed(2)} MB) → ${MANIFEST}`);
