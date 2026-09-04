// studio photo gallery config
export type PhotoSpan = "square" | "tall" | "wide";

export interface Photo {
  src: string;
  alt: string;
  caption?: string;
  location?: string;
  span?: PhotoSpan;
}

export const photos: Photo[] = [
  {
    src: "/photos/nakafurano.jpeg",
    alt: "Nakafurano",
    caption: "Nakafurano",
    // location: "Hokkaido",
    span: "wide",
  },
  {
    src: "/photos/otaru_sea.jpeg",
    alt: "Otaru",
    caption: "Coast of Otaru",
    // location: "Hokkaido",
    span: "tall",
  },
  {
    src: "/photos/blue_cavern_water.jpeg",
    alt: "Otaru Blue Cavern",
    caption: "Blue Cavern Water",
    // location: "Hokkaido",
    span: "square",
  },
  {
    src: "/photos/tokyo_shobu.jpeg",
    alt: "Iris Garden",
    caption: "Iris Garden",
    // location: "Tokyo",
    span: "wide",
  },
  {
    src: "/photos/toyama_downtown.jpeg",
    alt: "Toyama Downtown",
    caption: "Toyama",
    span: "tall",
  },
  {
    src: "/photos/evening_sky.jpeg",
    alt: "Evening Sky",
    caption: "Evening Sky",
    span: "square",
  },
  {
    src: "/photos/fn_waterfall.jpeg",
    alt: "Waterfall",
    caption: "Franconia Notch Waterfall",
    span: "square",
  },
];
