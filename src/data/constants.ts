// thoda zada ts ho gya idhar
export enum SkillNames {
  JS = "js",
  HTML = "html",
  CSS = "css",
  REACT = "react",
  TAILWIND = "tailwind",
  NODEJS = "nodejs",
  EXPRESS = "express",
  PHP = "php",
  PYTHON = "python",
  JAVA = "java",
  MYSQL = "mysql",
  MONGODB = "mongodb",
  GIT = "git",
  GITHUB = "github",
  NPM = "npm",
  BOOTSTRAP = "bootstrap",
}
export type Skill = {
  id: number;
  name: string;
  label: string;
  shortDescription: string;
  color: string;
  icon: string;
};
export const SKILLS: Record<SkillNames, Skill> = {
  [SkillNames.JS]: {
    id: 1,
    name: "js",
    label: "JavaScript ES6+",
    shortDescription: "The language I use to make pages actually do things.",
    color: "#f0db4f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  [SkillNames.HTML]: {
    id: 2,
    name: "html",
    label: "HTML5",
    shortDescription: "Structure first — every layout I ship starts here.",
    color: "#e34c26",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  [SkillNames.CSS]: {
    id: 3,
    name: "css",
    label: "CSS3",
    shortDescription: "Responsive layouts, visual polish, and UI details.",
    color: "#563d7c",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  [SkillNames.REACT]: {
    id: 4,
    name: "react",
    label: "React.js",
    shortDescription: "Component-driven UIs for projects like Chirkut Ghor.",
    color: "#61dafb",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  [SkillNames.TAILWIND]: {
    id: 5,
    name: "tailwind",
    label: "Tailwind CSS",
    shortDescription: "Utility-first styling for faster, consistent interfaces.",
    color: "#38bdf8",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg",
  },
  [SkillNames.NODEJS]: {
    id: 6,
    name: "nodejs",
    label: "Node.js",
    shortDescription: "JavaScript on the server for APIs and app logic.",
    color: "#6cc24a",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  [SkillNames.EXPRESS]: {
    id: 7,
    name: "express",
    label: "Express.js",
    shortDescription: "REST APIs, routing, and the backend of my MERN work.",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  },
  [SkillNames.PHP]: {
    id: 8,
    name: "php",
    label: "PHP",
    shortDescription: "Server-side pages and CRUD apps with MySQL.",
    color: "#777bb4",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  },
  [SkillNames.PYTHON]: {
    id: 9,
    name: "python",
    label: "Python",
    shortDescription:
      "Currently expanding Python and Django — learning, not expert-level yet.",
    color: "#3776ab",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  [SkillNames.JAVA]: {
    id: 10,
    name: "java",
    label: "Java",
    shortDescription: "Programming foundations from diploma CST coursework.",
    color: "#f89820",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  },
  [SkillNames.MYSQL]: {
    id: 11,
    name: "mysql",
    label: "MySQL",
    shortDescription: "Relational data for PHP and practical web projects.",
    color: "#00758f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  [SkillNames.MONGODB]: {
    id: 12,
    name: "mongodb",
    label: "MongoDB",
    shortDescription: "Document storage behind Chirkut Ghor and other Node APIs.",
    color: "#47a248",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  [SkillNames.GIT]: {
    id: 13,
    name: "git",
    label: "Git",
    shortDescription: "Version control for every project I take seriously.",
    color: "#f1502f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  },
  [SkillNames.GITHUB]: {
    id: 14,
    name: "github",
    label: "GitHub",
    shortDescription: "Where I keep repos, issues, and learning in public.",
    color: "#000000",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  },
  [SkillNames.NPM]: {
    id: 15,
    name: "npm",
    label: "NPM",
    shortDescription: "Package management for JavaScript projects.",
    color: "#cb3837",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg",
  },
  [SkillNames.BOOTSTRAP]: {
    id: 16,
    name: "bootstrap",
    label: "Bootstrap",
    shortDescription: "Responsive UI kits I used while building early websites.",
    color: "#7952b3",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
  },
};

export type Experience = {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  description: string[];
  skills: SkillNames[];
};

export const EXPERIENCE: Experience[] = [
  {
    id: 1,
    startDate: "2025",
    endDate: "Present",
    title: "Independent Full Stack Developer",
    company: "Self-employed",
    description: [
      "Building responsive, user-friendly websites with HTML, CSS, Bootstrap, JavaScript, PHP, and MySQL.",
      "Developing practical web projects to strengthen frontend and backend skills, including REST APIs, MVC, and CRUD workflows.",
      "Using Git, GitHub, and VS Code for version control and day-to-day development.",
      "Currently expanding Python and Django knowledge while working toward becoming a professional Software Engineer.",
    ],
    skills: [
      SkillNames.HTML,
      SkillNames.CSS,
      SkillNames.BOOTSTRAP,
      SkillNames.JS,
      SkillNames.PHP,
      SkillNames.MYSQL,
      SkillNames.REACT,
      SkillNames.NODEJS,
      SkillNames.GIT,
    ],
  },
];

export type EducationItem = {
  id: number;
  program: string;
  focus: string;
  institution: string;
  period: string;
  details: string[];
};

export const EDUCATION: EducationItem[] = [
  {
    id: 1,
    program: "Diploma in Engineering",
    focus: "Computer Science & Technology (CST)",
    institution: "Cox’s Bazar Model Polytechnic Institute",
    period: "2023 – Present (6th semester · expected graduation 2027)",
    details: [
      "Diploma in Computer Science & Technology with coursework covering programming and web fundamentals.",
      "Building personal full-stack projects alongside studies to turn classroom topics into working software.",
    ],
  },
];

export type CertificationItem = {
  id: number;
  title: string;
  issuer: string;
  status: string;
  year: string;
};

export const CERTIFICATIONS: CertificationItem[] = [
  {
    id: 1,
    title: "NSDA Level-3 — Web Design & Development & Freelancing (WDDF)",
    issuer: "National Skills Development Authority (NSDA)",
    status: "Competent",
    year: "June 06, 2026",
  },
];

export const ACHIEVEMENTS: string[] = [
  "Developed multiple responsive web development projects.",
  "Built web applications using HTML, CSS, JavaScript, PHP, and MySQL.",
  "Successfully completed Web Design & Development training.",
  "Achieved NSDA Level-3 competency in Web Design & Development & Freelancing (WDDF).",
  "Gained practical experience with Git, GitHub, and modern development tools.",
  "Continuously expanding expertise in Python, Django, and software development.",
];

export const ABOUT = {
  headline: "Independent Full Stack Developer",
  paragraphs: [
    "I’m Partha Protim Datta, a Computer Science & Technology student and independent full-stack developer. I build practical web applications while developing my skills through hands-on projects.",
    "I work with React.js, TypeScript, Node.js, Express.js, PHP, MySQL, MongoDB, and REST APIs. My goal is to grow this foundation into a career as a professional Software Engineer.",
  ],
};

export const themeDisclaimers = {
  light: [
    "Warning: Light mode emits a gazillion lumens of pure radiance!",
    "Caution: Light mode ahead! Please don't try this at home.",
    "Only trained professionals can handle this much brightness. Proceed with sunglasses!",
    "Brace yourself! Light mode is about to make everything shine brighter than your future.",
    "Flipping the switch to light mode... Are you sure your eyes are ready for this?",
  ],
  dark: [
    "Light mode? I thought you went insane... but welcome back to the dark side!",
    "Switching to dark mode... How was life on the bright side?",
    "Dark mode activated! Thanks you from the bottom of my heart, and my eyes too.",
    "Welcome back to the shadows. How was life out there in the light?",
    "Dark mode on! Finally, someone who understands true sophistication.",
  ],
};
