import { getProjects } from "@/lib/content";

/**
 * Static paths that don't need to be generated at build time'
 */
const STATIC_PATHS = ["/", "/about", "/playground", "/studio", "/work"];

export async function getCanonicalPaths(): Promise<string[]> {
  const projects = await getProjects();
  return [...STATIC_PATHS, ...projects.map((p) => `/work/${p.id}`)];
}

/**
 * Build a case-insensitive index of paths for fast lookups
 * @param paths paths to index
 */
export function buildPathIndex(paths: string[]): Record<string, string> {
  const index: Record<string, string> = {};
  for (const path of paths) {
    const key = path.toLowerCase();
    const existing = index[key];
    if (existing !== undefined && existing !== path) {
      throw new Error(
        `Case-insensitive path collision: "${existing}" and "${path}" differ only in case, ` +
          `404 redirect cannot tell them apart. Rename one of them.`,
      );
    }
    index[key] = path;
  }
  return index;
}
