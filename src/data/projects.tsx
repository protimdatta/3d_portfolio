import AceTernityLogo from "@/components/logos/aceternity";
import SlideShow from "@/components/slide-show";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { ArrowUpRight, ExternalLink, Link2, MoveUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
// Spline has no thesvg entry â€” keep the Three.js mark as its stand-in.
import { SiThreedotjs } from "react-icons/si";
const BASE_PATH = "/assets/projects-screenshots";

// Renders a brand SVG from /public as a monochrome glyph that inherits the
// surrounding text color (the skill dock styles every icon via currentColor),
// so full-color marks like Mistral flatten to match the rest of the set.
const MaskIcon = ({ src, title }: { src: string; title?: string }) => (
  <span
    role="img"
    aria-label={title}
    className="block bg-current"
    style={{
      width: "1em",
      height: "1em",
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const ProjectsLinks = ({ live, repo }: { live?: string; repo?: string }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-start gap-3 my-3 mb-8">
      {live && live !== "#" && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={live}
        >
          <Button variant={"default"} size={"sm"}>
            Visit Website
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
      {repo && repo !== "#" && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={repo}
        >
          <Button variant={"default"} size={"sm"}>
            Github
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};
// Brand chips sourced from thesvg CLI mono SVGs in /public/assets/logos,
// rendered via MaskIcon so each one inherits the dock's currentColor.
const brand = (title: string, file: string): Skill => ({
  title,
  bg: "black",
  fg: "white",
  icon: <MaskIcon src={`/assets/logos/${file}`} title={title} />,
});
const PROJECT_SKILLS = {
  next: brand("Next.js", "nextdotjs-mono.svg"),
  chakra: brand("Chakra UI", "chakra-ui-mono.svg"),
  node: brand("Node.js", "nodedotjs-mono.svg"),
  python: brand("Python", "python-mono.svg"),
  prisma: brand("Prisma", "prisma-mono.svg"),
  postgres: brand("PostgreSQL", "postgresql-mono.svg"),
  mongo: brand("MongoDB", "mongodb-mono.svg"),
  express: brand("Express", "express-mono.svg"),
  reactQuery: brand("React Query", "react-query-mono.svg"),
  shadcn: brand("shadcn/ui", "shadcn-ui-mono.svg"),
  // Not in the thesvg registry â€” keep the existing custom logo.
  aceternity: {
    title: "Aceternity",
    bg: "black",
    fg: "white",
    icon: <AceTernityLogo />,
  },
  tailwind: brand("Tailwind", "tailwind-css-mono.svg"),
  docker: brand("Docker", "docker-mono.svg"),
  // Not in the thesvg registry â€” keep the text mark.
  yjs: {
    title: "Y.js",
    bg: "black",
    fg: "white",
    icon: (
      <span>
        <strong>Y</strong>js
      </span>
    ),
  },
  firebase: brand("Firebase", "firebase-mono.svg"),
  sockerio: brand("Socket.io", "socketdotio-mono.svg"),
  resend: {
    title: "Resend",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">R</span>,
  },
  js: brand("JavaScript", "javascript-mono.svg"),
  html: {
    title: "HTML5",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">HTML</span>,
  },
  css: {
    title: "CSS3",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">CSS</span>,
  },
  ts: brand("TypeScript", "typescript-mono.svg"),
  vue: brand("Vue.js", "vuedotjs-mono.svg"),
  react: brand("React.js", "react-mono.svg"),
  sanity: brand("Sanity", "sanity-mono.svg"),
  // Not in the thesvg registry â€” keep the Three.js stand-in.
  spline: {
    title: "Spline",
    bg: "black",
    fg: "white",
    icon: <SiThreedotjs />,
  },
  gsap: brand("GSAP", "gsap-mono.svg"),
  motion: brand("Motion", "motion.svg"),
  supabase: brand("Supabase", "supabase-mono.svg"),
  trpc: brand("tRPC", "trpc-mono.svg"),
  drizzle: brand("Drizzle ORM", "drizzle-mono.svg"),
  hono: brand("Hono", "hono-mono.svg"),
  redis: brand("Redis / BullMQ", "redis-mono.svg"),
  cloudflare: brand("Cloudflare", "cloudflare-mono.svg"),
  // React Native reuses the React mark.
  reactNative: brand("React Native", "react-mono.svg"),
  betterAuth: brand("Better Auth", "better-auth-mono.svg"),
  // Not in the thesvg registry â€” keep the text marks.
  zustand: {
    title: "Zustand",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Zu</span>,
  },
  partykit: {
    title: "PartyKit",
    bg: "black",
    fg: "white",
    icon: <span className="text-base">ðŸŽˆ</span>,
  },
  hocuspocus: {
    title: "Hocuspocus",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Hp</span>,
  },
  // React Flow ships under the xyflow brand.
  reactFlow: brand("React Flow", "xyflow-mono.svg"),
  codemirror: brand("CodeMirror", "codemirror-mono.svg"),
  // "Satori / sharp" â€” uses the sharp mark.
  satori: brand("Satori / sharp", "sharp-mono.svg"),
  turborepo: brand("Turborepo", "turborepo-mono.svg"),
  // Vercel AI SDK uses the Vercel mark.
  aiSDK: brand("Vercel AI SDK", "vercel-mono.svg"),
  anthropic: brand("Anthropic Claude", "anthropic-mono.svg"),
  mistral: brand("Mistral AI", "mistral-ai-mono.svg"),
  // Not in the thesvg registry â€” keep the text mark.
  nextIntl: {
    title: "next-intl",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">i18n</span>,
  },
  // Not in the thesvg registry â€” keep the text marks.
  expo: {
    title: "Expo",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Expo</span>,
  },
  mcp: {
    title: "MCP",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">MCP</span>,
  },
};
export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[] };
  content: React.ReactNode | any;
  github?: string;
  live: string;
};
const projects: Project[] = [
  {
    id: "chirkut-ghor",
    category: "Full-stack e-commerce",
    title: "Chirkut Ghor",
    src: "/assets/projects-screenshots/chirkut-ghor/chirkutghor.jpeg",
    screenshots: ["chirkutghor.jpeg"],
    skills: {
      frontend: [
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.js,
        PROJECT_SKILLS.html,
        PROJECT_SKILLS.css,
      ],
      backend: [
        PROJECT_SKILLS.node,
        PROJECT_SKILLS.express,
        PROJECT_SKILLS.mongo,
      ],
    },
    live: "https://chirkutghor.vercel.app",
    github: "https://github.com/protimdatta/Chirkut-Ghor",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-xl text-center md:text-2xl">
            A personal full-stack e-commerce project for gift products.
          </TypographyP>
          <TypographyP className="font-mono ">
            Chirkut Ghor is my own storefront project — still under development —
            built to practice modern web development and understand the core
            workflow of an online shop: product listing, cart functionality, and a
            basic order flow.
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />
          <SlideShow images={[`${BASE_PATH}/chirkut-ghor/chirkutghor.jpeg`]} />
          <TypographyH3 className="my-4 mt-8">Stack</TypographyH3>
          <p className="font-mono mb-2">
            React.js on the frontend, with Node.js, Express.js, and MongoDB on
            the backend, plus HTML5 and CSS3 for structure and styling.
          </p>
        </div>
      );
    },
  },
  {
    id: "personal-portfolio",
    category: "Interactive portfolio",
    title: "Personal Portfolio",
    src: "/assets/projects-screenshots/Personal%20Portfolio/protimdattapartha.png",
    screenshots: ["protimdattapartha.png"],
    skills: {
      frontend: [
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.js,
      ],
      backend: [
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.node,
        PROJECT_SKILLS.resend,
        PROJECT_SKILLS.sockerio,
      ],
    },
    live: "https://protimdattapartha.vercel.app/",
    content: (
      <div>
        <TypographyP className="font-mono text-xl text-center md:text-2xl">
          A modern interactive developer portfolio built to showcase my skills,
          experience, education, projects, and journey as a full-stack developer.
        </TypographyP>
        <ProjectsLinks live="https://protimdattapartha.vercel.app/" />
        <SlideShow
          images={[`${BASE_PATH}/Personal%20Portfolio/protimdattapartha.png`]}
        />
        <TypographyH3 className="my-4 mt-8">Stack</TypographyH3>
        <p className="font-mono mb-2">
          React.js, TypeScript, Tailwind CSS, JavaScript, and the interactive
          animation tools used throughout this portfolio.
        </p>
        <p className="font-mono mb-2">
          Next.js Route Handlers and Node.js power the server-side API work,
          including Resend email delivery and Socket.IO realtime integration.
        </p>
      </div>
    ),
  },
  {
    id: "previous-portfolio",
    category: "Frontend portfolio",
    title: "Previous Portfolio",
    src: "/assets/projects-screenshots/previous%20portfolio/protimportfolio.png",
    screenshots: ["protimportfolio.png"],
    skills: {
      frontend: [PROJECT_SKILLS.html, PROJECT_SKILLS.css, PROJECT_SKILLS.js],
      backend: [],
    },
    live: "https://protimdatta.vercel.app/",
    content: (
      <div>
        <TypographyP className="font-mono text-xl text-center md:text-2xl">
          My earlier personal portfolio built with HTML, CSS, and JavaScript as
          part of my early web development journey.
        </TypographyP>
        <ProjectsLinks live="https://protimdatta.vercel.app/" />
        <SlideShow
          images={[`${BASE_PATH}/previous%20portfolio/protimportfolio.png`]}
        />
        <TypographyH3 className="my-4 mt-8">Stack</TypographyH3>
        <p className="font-mono mb-2">
          HTML5, CSS3, and JavaScript.
        </p>
      </div>
    ),
  },
];
export default projects;
