import { imageManifest } from "@/lib/image-manifest";
import { withBase } from "@/lib/base";

/**
 * Look up helpers for the build-time optimized image manifest.
 * Every raster bundled by `scripts/optimize-images.mjs` has an entry here that
 * maps its original public path (e.g. "/photos/nakafurano.jpeg") to responsive
 * WebP variants. This lets components emit `<picture>` with `srcset`/`sizes` so
 * the browser only downloads the width it actually needs, plus the rotated
 * intrinsic dimensions for CLS-free layout.
 * Paths not in the manifest like SVG graphics, or a raster not yet run through
 * pnpm images return null, and calls fall back to a plain <img>
 */
export interface ImageEntry {
  // Largest WebP variant with base for <picture> <source> srcset
  src: string;
  // Optimized fallback at the original path/extension for <img src>
  fallback: string;
  // Rotated output dimensions with a layout ratio
  width: number;
  height: number;
  // WebP srcset string base-prefixed, "url w" candidates
  srcset: string;
}

export function imageEntry(path: string): ImageEntry | null {
  const e = imageManifest[path];
  if (!e) return null;
  return {
    src: withBase(e.src),
    fallback: withBase(e.fallback),
    width: e.width,
    height: e.height,
    srcset: e.webp.map((v) => `${withBase(v.src)} ${v.width}w`).join(", "),
  };
}

// True when a path resolves to a manifest-backed raster and needs a <picture>
export function isResponsive(path: string): boolean {
  return Boolean(imageManifest[path]);
}
