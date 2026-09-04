// Generates placeholder images into public/graphics/ (SVG) plus a raster
// public/og-default.png. Re-run any time with node scripts/gen-placeholders.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public", "graphics");

// palette mirrors src/styles/global.css with the vibrant Otaru cavern scheme
const schemes = {
  cavern: { a: "#4cbccb", b: "#164f63", ridge: "#1f8ba0" },
  bamboo: { a: "#a6d268", b: "#345016", ridge: "#5faa27" },
  rock: { a: "#a3a8a2", b: "#374353", ridge: "#6c7a85" },
};

// name, big label (understandable text shown large), accent, width, height
const items = [
  ["hero-graphic", "Otaru", "cavern", 1600, 1000],
  ["placeholder-portrait", "Portrait", "cavern", 900, 1100],
  ["placeholder-clinic", "Clinic", "cavern", 1200, 800],
  ["placeholder-desk", "Desk", "bamboo", 1200, 800],
  ["placeholder-network", "Network", "cavern", 1200, 800],
  ["placeholder-izakaya", "Izakaya", "bamboo", 1200, 800],
  ["placeholder-food-1", "Sushi", "bamboo", 900, 900],
  ["placeholder-food-2", "Ramen", "bamboo", 900, 900],
  ["placeholder-signal", "Signal", "cavern", 1200, 800],
  ["placeholder-radicals", "Kanji", "bamboo", 1200, 800],
  ["placeholder-terminal", "Terminal", "rock", 1200, 800],
  ["placeholder-landscape", "Landscape", "cavern", 1400, 900],
  ["placeholder-street", "Street", "rock", 1200, 900],
  ["placeholder-still", "Still Life", "bamboo", 1000, 1000],
  ["placeholder-illustration", "Illustration", "bamboo", 1100, 900],
  ["placeholder-music", "Music", "rock", 1200, 800],
  ["placeholder-build", "Build", "cavern", 1200, 800],
  ["placeholder-london", "London", "cavern", 1200, 800],
  ["placeholder-uk", "UK", "rock", 1200, 800],
  ["placeholder-kyoto", "Kyoto", "bamboo", 1200, 800],
  ["placeholder-oksaka", "Osaka", "cavern", 1200, 800],
  ["placeholder-kansai", "Kansai", "bamboo", 1200, 800],
  ["placeholder-tokyo", "Tokyo", "cavern", 1200, 800],
  ["placeholder-sophia", "Sophia", "bamboo", 1000, 800],
];

function bigFontSize(big, base) {
  const isCJK = /[　-鿿]/.test(big);
  if (isCJK) return Math.round(base * 0.24);
  if (big.length <= 4) return Math.round(base * 0.2);
  if (big.length <= 7) return Math.round(base * 0.145);
  return Math.round(base * 0.1);
}

function svg(big, accent, w, h) {
  const s = schemes[accent] ?? schemes.cavern;
  const isCJK = /[　-鿿]/.test(big);
  const bigFamily = isCJK ? "serif" : "'Fraunces', Georgia, serif";
  const ridge = (y, o) =>
    `<path d="M0 ${y} C ${w * 0.25} ${y - h * 0.12}, ${w * 0.5} ${y + h * 0.06}, ${w * 0.75} ${y - h * 0.08} S ${w} ${y - h * 0.02}, ${w} ${y} L ${w} ${h} L 0 ${h} Z" fill="${s.ridge}" opacity="${o}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${big} placeholder">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${s.a}"/>
      <stop offset="1" stop-color="${s.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0.12" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${ridge(h * 0.62, 0.28)}
  ${ridge(h * 0.74, 0.4)}
  ${ridge(h * 0.86, 0.55)}
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.25"/>
  <text x="${w / 2}" y="${h * 0.47}" font-family="${bigFamily}" font-weight="600" font-size="${bigFontSize(big, Math.min(w, h))}" fill="#f6f3ec" fill-opacity="0.94" text-anchor="middle" dominant-baseline="central">${big}</text>
  <text x="${w / 2}" y="${h - Math.round(h * 0.07)}" font-family="monospace" font-size="${Math.round(Math.min(w, h) * 0.03)}" letter-spacing="5" fill="#f6f3ec" fill-opacity="0.6" text-anchor="middle">PLACEHOLDER</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });

for (const [name, big, accent, w, h] of items) {
  await writeFile(path.join(outDir, `${name}.svg`), svg(big, accent, w, h), "utf8");
}

// rasterize an image
const ogSvg = Buffer.from(svg("Otaru", "cavern", 1200, 630));
try {
  const { default: sharp } = await import("sharp");
  await sharp(ogSvg).png().toFile(path.join(root, "public", "og-default.png"));
  console.log("Wrote og-default.png");
} catch (e) {
  console.warn("sharp not available; skipping og-default.png raster:", e.message);
}

console.log(`Generated ${items.length} placeholder SVGs in public/graphics/`);
