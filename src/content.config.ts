import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Docs for later:
 * To add a project/experience/hobby, drop a new .mdx file in the matching folder; to remove one, delete the file
 * The schemas below are validated at build time
 */

// common or shared enums
// palettes are dominant cavern blue, one sharp bamboo accent, rock neutral
const accent = z.enum(["cavern", "bamboo", "rock"]).default("cavern");

const linkSchema = z
  .object({
    repo: z.string().url().optional(),
    live: z.string().url().optional(),
    writeup: z.string().url().optional(),
    demo: z.string().optional(), // internal href
  })
  .default({});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    // short descriptor shown above the title
    tagline: z.string().optional(),
    short_description: z.string().optional(),
    description: z.string(),
    // human-readable time period, e.g. "May – Jul 2026" where year is used to sort sorting
    period: z.string().optional(),
    year: z.number().int(),
    role: z.string().optional(),
    stack: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    kind: z.array(z.enum(["coursework", "personal", "research", "open-source", "hackathon", "client"])).default(["personal"]),
    accent,
    // layout character for the card and case-study header
    variant: z.enum(["ink", "photo", "terminal", "grid", "seal"]).default("ink"),
    // card cover art that is optional and cards with no cover fall back to a skeleton
    // path under public/, e.g. "/photos/..."
    cover: z.string().optional(),
    // larger in-page image shown on the case-study page below the hero
    image: z.string().optional(),
    // short vertical tategaki accent shown on the card that's reserved for
    // Japan-related projects, leave unset elsewhere so it's a rare touch
    kana: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    links: linkSchema,
    // repo name appended to the GitHub URL for the "View source" button
    // leave unset for private/closed-source projects
    repo: z.string().optional(),
    // put a project into a live island with one of the demo ids in demoRegistry
    demo: z.enum(["kanji", "tabelog", "sentiment"]).nullable().default(null),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const experiences = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/experiences" }),
  schema: z.object({
    org: z.string(),
    role: z.string(),
    location: z.string().optional(),
    period: z.string(),
    // sort key is the higher the integer, the more recent with YYYYMM used to compare
    start: z.number(),
    current: z.boolean().default(false),
    type: z.enum(["work", "coop", "internship", "club", "freelance", "part_time", "contract"]).default("work"),
    // the main experience roles sit in the main "Where I've worked" block,
    // and everything else goes in the additional experience section
    featured: z.boolean().default(false),
    description: z.string(),
    bullets: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const hobbies = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/hobbies" }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(["illustration", "music", "photography", "building"]),
    description: z.string(),
    accent,
    cover: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    links: linkSchema,
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, experiences, hobbies };
