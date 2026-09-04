// Prefix a path with the deployment base (e.g. "/My-Portfolio") so links and
// asset/data fetches can deal with both the GitHub Pages project path and a later
// custom-domain (root) switch. BASE_URL always ends with "/".
const BASE = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  const base = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
  if (/^https?:\/\//.test(path) || path.startsWith("mailto:") || path.startsWith("#")) {
    return path;
  }
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}
