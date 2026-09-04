import { getCollection, type CollectionEntry } from "astro:content";
import { site } from "@/config/site";

// Static accent to class maps. Tailwind can't generate class names dynamically,
// so every variant is spelled out here and selected by a key
export type Accent = "cavern" | "bamboo" | "rock";

// Label for the type of project
export const kindLabel: Record<string, string> = {
  coursework: "Coursework",
  personal: "Personal",
  research: "Research",
  "open-source": "Open source",
  hackathon: "Hackathon",
  client: "Client work",
};

export const accentMap: Record<
  Accent,
  {
    text: string;
    bg: string;
    softBg: string;
    border: string;
    ring: string;
    gradient: string;
    label: string;
    kana: string;
  }
> = {
  cavern: {
    text: "text-cavern",
    bg: "bg-cavern",
    softBg: "bg-cavern/10",
    border: "border-cavern/30",
    ring: "ring-cavern/25",
    gradient: "from-cavern-glow/20 to-cavern-deep/10",
    label: "Cavern blue",
    kana: "洞",
  },
  bamboo: {
    text: "text-bamboo",
    bg: "bg-bamboo",
    softBg: "bg-bamboo/10",
    border: "border-bamboo/30",
    ring: "ring-bamboo/25",
    gradient: "from-bamboo-soft/25 to-bamboo/10",
    label: "Bamboo green",
    kana: "竹",
  },
  rock: {
    text: "text-rock",
    bg: "bg-rock",
    softBg: "bg-rock/15",
    border: "border-rock/30",
    ring: "ring-rock/25",
    gradient: "from-rock/20 to-rock/5",
    label: "Rock stone",
    kana: "石",
  },
};

export type Project = CollectionEntry<"projects">;
export type Experience = CollectionEntry<"experiences">;
export type Hobby = CollectionEntry<"hobbies">;

// Build the "View source" URL for a project, or null if it isn't open source
export function projectRepoUrl(data: Project["data"]): string | null {
  const base = site.socials.github.replace(/\/$/, "");
  if (data.repo) return `${base}/${data.repo}`;
  return data.links.repo ?? null;
}

const notDraft = <T extends { data: { draft?: boolean } }>(e: T) => !e.data.draft;

export async function getProjects(): Promise<Project[]> {
  const items = (await getCollection("projects")).filter(notDraft);
  return items.sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return b.data.year - a.data.year;
  });
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured);
}

export async function getExperiences(): Promise<Experience[]> {
  const items = (await getCollection("experiences")).filter(notDraft);
  return items.sort((a, b) => b.data.start - a.data.start);
}

export async function getFeaturedExperiences(): Promise<Experience[]> {
  return (await getExperiences()).filter((e) => e.data.featured);
}

export async function getAdditionalExperiences(): Promise<Experience[]> {
  return (await getExperiences()).filter((e) => !e.data.featured);
}

export async function getHobbies(): Promise<Hobby[]> {
  const items = (await getCollection("hobbies")).filter(notDraft);
  return items.sort((a, b) => a.data.order - b.data.order);
}

// Metadata for the interactive demos
export const demoMeta: Record<
  "kanji" | "tabelog" | "sentiment",
  { title: string; description: string; tagline: string }
> = {
  kanji: {
    title: "Kanji Radical Match",
    tagline: "Feedforward neural network",
    description: "Type an English word and see the kanji radicals the neural net links it to.",
  },
  tabelog: {
    title: "Tabelog Recommender",
    tagline: "Collaborative filtering",
    description: "Pick a restaurant and get calculated ratings from item-item collaborative filtering across six categories.",
  },
  sentiment: {
    title: "Social Media Sentiment Analysis",
    tagline: "Logistic regression",
    description: "Score any text for how inflammatory it reads, live in your browser.",
  },
};
