// universal values
export const site = {
  name: "Kiyo",
  fullName: "Kiyo",
  role: "",
  // header and footer mark that uses the favicon or a monogram
  brandMark: "favicon" as "favicon" | "monogram",
  // footer tagline
  tagline: "Code, photos, music, art.",
  // hero page description
  description: "Full-stack web development and machine learning, with hobbies in design, photography, and music.",
  // also used in the View source links
  socials: {
    github: "https://github.com/KiyonoKara",
  },
  // reserved for custom domain, empty until one is provided
  domain: "",
  // Primary navigation.
  nav: [
    { label: "Home", href: "/" },
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Studio", href: "/studio" },
    { label: "Playground", href: "/playground" },
  ],
} as const;

export type Site = typeof site;
