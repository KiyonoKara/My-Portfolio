// about page config
export const bio: string[] = [
  "I'm a graduate from Northeastern University. I studied Computer Science with a concentration in Artificial Intelligence and a minor in Japanese. I like building things that interest me such as full-stack web development, machine learning, and apps designed for people.",
  "My work ranges from full-stack and machine learning. My projects include things such as a HIPAA-compliant provider dashboard to a repository assistant that turns whole codebases into LLM-ready content, to ML projects on kanji, sentiment analysis, and restaurant recommendations. I value being able to build meaningful things.",
  "Besides my main work, I illustrate, shoot photography, produce music, and build more things."
];

export const education = {
  school: "Northeastern University",
  college: "Khoury College of Computer Sciences",
  degree: "B.S. Computer Science",
  concentration: "Artificial Intelligence",
  minor: "Japanese",
  location: "Boston, MA",
  period: "Sep 2022 – April 2026",
  gpa: "3.583 / 4.00",
  honors: "Dean's List",
  coursework: [
    "Mathematics of Data Models",
    "NLP",
    "Machine Learning & Data Mining 1 & 2",
    "Artificial Intelligence",
    "Object-Oriented Design",
    "Cybersecurity",
    "Algorithms",
    "Computer Systems",
    "Software Engineering",
    "Intermediate Japanese 1 & 2",
    "Advanced Japanese 1"
  ],
};

// study-abroad with photo galleries
export interface AbroadPhoto {
  src: string;
  alt: string;
  caption?: string;
}
export interface Abroad {
  school: string;
  program: string;
  location: string;
  period: string;
  description: string;
  photos: AbroadPhoto[];
}

export const studyAbroad: Abroad[] = [
  {
    school: "Northeastern University London",
    program: "Study Abroad: Computer Science",
    location: "London, United Kingdom",
    period: "Sep – Dec 2022",
    description:
      "First semester program (N.U.in) in London to study Computer Science while living and getting to know the culture in the UK. It was my first time living abroad.",
    photos: [
      { src: "/photos/london_view.jpeg", alt: "View from London Eye", caption: "London, England" },
      { src: "/photos/edinburgh_view.jpeg", alt: "View of Edinburgh", caption: "Edinburgh, Scotland" },
      { src: "/photos/central_london_view.jpeg", alt: "View of central London", caption: "London, England" },
    ],
  },
  {
    school: "Doshisha University",
    program: "Dialogue of Civilizations: Japanese Language & Culture",
    location: "Kyoto, Japan",
    period: "May – Jun 2024",
    description:
      "Language and cultural immersion in Kyoto. I engaged in conversation sessions with local residents and university students and built cultural relationships. On my own time I explored the Kansai region across Kyoto, Osaka, Hyogo, Nara, and Shiga prefectures.",
    photos: [
      { src: "/photos/kyoto_garden.jpeg", alt: "Myoshinji Temple Zen Garden", caption: "Ukyo, Kyoto" },
      { src: "/photos/osaka_castle.jpeg", alt: "Osaka Castle", caption: "Chuo, Osaka" },
      { src: "/photos/nara_kasuga_taisha.jpeg", alt: "Kasuga Taisha", caption: "Nara City, Nara" },
      { src: "/photos/ajiro_shoujin_ryouri.jpeg", alt: "Ajiro Shoujin Ryouri", caption: "Ukyo, Kyoto" },
      { src: "/photos/lake_biwa_michigan_ship.jpeg", alt: "Michigan Cruise on Lake Biwa", caption: "Otsu, Shiga" },
      { src: "/photos/himeji_castle.jpeg", alt: "Himeji Castle", caption: "Himeji, Hyogo" },
    ],
  },
  {
    school: "Waseda University",
    program: "Dialogue of Civilizations: Japanese Language & Culture",
    location: "Tokyo, Japan",
    period: "Jun – Jul 2024",
    description:
      "Continuing the immersion in Tokyo. I worked on my Japanese through courses at Waseda University, and conversation sessions held at Sophia University with its students, with further engagement across Kanagawa and Saitama prefectures.",
    photos: [
      { src: "/photos/tokyo_view.jpeg", alt: "View of Tokyo", caption: "Sumida, Tokyo" },
        { src: "/photos/waseda_university.jpeg", alt: "Waseda University Building", caption: "Shinjuku, Tokyo" },
      { src: "/photos/kamakura_view.jpeg", alt: "View of Kamakura", caption: "Kamakura, Kanagawa" },
    ],
  },
];

export const certifications = [
  {
    name: "Japanese Language Proficiency Test N1",
    detail: "Advanced Japanese Language Proficiency",
    issuer: "Japan Foundation",
    date: "Jan 2026",
  },
  {
    name: "CRLA Level 1",
    detail: "College Reading & Learning Association",
    issuer: "Northeastern University",
    date: "Apr 2024",
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
      group: "Frontend",
      items: ["TypeScript", "JavaScript", "React", "SvelteKit", "HTML/CSS", "Jest"]
  },
  {
      group: "Backend",
      items: ["Node.js", "Express", "REST APIs", "SQLite", "MongoDB"]
  },
  {
      group: "Languages",
      items: ["Python", "Java", "Scala", "R", "Swift", "Racket", "C/C++"]
  },
  {
      group: "Data Science",
      items: ["Pandas", "NumPy", "Matplotlib"]
  },
  {
    group: "Machine Learning & AI",
    items: ["TensorFlow", "PyTorch", "scikit-learn", "Hugging Face", "BERT", "Neural Networks", "NLP", "RAG"],
  },
  {
      group: "Tools",
      items: ["Git/GitHub", "Docker", "Azure", "VS Code", "Jupyter", "Jira", "Postman", "Streamlit"]
  },
  {
      group: "Practices",
      items: ["Agile", "MVC", "OOP", "REST", "TDD", "Value-Sensitive Design"]
  },
];
