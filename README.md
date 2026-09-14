# 🚀 Partha Protim Datta | 3D Portfolio

Personal portfolio of **Partha Protim Datta**, an Independent Full Stack Developer and MERN Stack Developer from Cox's Bazar, Bangladesh. This project showcases my work in full-stack web development, modern web applications, REST APIs, responsive UI, deployment, and realtime applications through an interactive 3D experience.

I have built and worked on **16+ full-stack web applications** and **40+ responsive web pages** across educational, e-commerce, productivity, and interactive web projects. I am currently expanding my Python and Django skills with the long-term goal of becoming a professional Software Engineer.

- **Email:** [protim939@gmail.com](mailto:protim939@gmail.com)
- **GitHub:** [github.com/protimdatta](https://github.com/protimdatta)
- **Portfolio:** [protimdatta.vercel.app](https://protimdatta.vercel.app)

This is my customized version of an open-source 3D portfolio project. Credit to the original template author is retained through the project history and implementation patterns.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/protimdatta/3d_portfolio)

![Portfolio Preview](https://raw.githubusercontent.com/protimdatta/3d_portfolio/main/public/assets/projects-screenshots/Personal%20Portfolio/protimdattapartha.png)

## ✨ Features

- **Interactive 3D Keyboard** — Custom Spline keyboard where each keycap represents a skill, revealing titles and descriptions on hover/press
- **Buttery Animations** — GSAP + Framer Motion powered scroll, hover, and reveal animations
- **Space Theme** — Floating particles on a dark canvas for a cosmic vibe
- **Light & Dark Mode** — Full theme support with cheeky disclaimer toasts
- **Responsive** — Works across all screen sizes
- **Contact Form** — Email delivery via Resend
- **Analytics** _(optional)_ — Umami analytics integration

## Featured Project

**[Chirkut Ghor](https://chirkutghor.vercel.app)** is an e-commerce and gift business project for special gifts and combo packages. It is one of the full-stack projects featured in this portfolio.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js, React, TypeScript |
| **Styling** | Tailwind CSS, Sass |
| **UI** | Radix UI, Lucide React |
| **Animation** | GSAP, Motion |
| **3D** | Spline Runtime |
| **Realtime & Data** | Socket.IO, MongoDB |
| **Email** | Resend |
| **Misc** | Lenis (smooth scroll), Zod, next-themes, MDX |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (recommended), npm, or yarn

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/protimdatta/3d_portfolio.git
    cd 3d_portfolio
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

3. **Set up environment variables:**

    Copy `.env.example` to `.env.local` and fill in the values:

    ```bash
    cp .env.example .env.local
    ```

    | Variable | Required | Description |
    |---|---|---|
    | `RESEND_API_KEY` | Yes | API key from [Resend](https://resend.com) for the contact form |
    | `RESEND_FROM_EMAIL` | Yes | Sender address verified in Resend, such as `Portfolio <hello@example.com>` |
    | `CONTACT_RECIPIENT_EMAIL` | Yes | Inbox for contact submissions, set this to your receiving Gmail address |
    | `NEXT_PUBLIC_WS_URL` | No | WebSocket server URL for realtime features (cursors, chat, presence) |
    | `UMAMI_DOMAIN` | No | Umami analytics script URL |
    | `UMAMI_SITE_ID` | No | Umami website ID |

4. **Run the development server:**

    ```bash
    pnpm dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) and see the magic ✨

---

## 🎨 Portfolio Configuration

The personal information for this portfolio is centralized in [`src/data/config.ts`](src/data/config.ts). The current configuration represents Partha Protim Datta:

```ts
const config = {
  title: "Partha Protim Datta | Full Stack Developer",
  description: {
    long: "Your long description for SEO...",
    short: "Your short description...",
  },
  keywords: ["your", "keywords"],
  author: "Partha Protim Datta",
  email: "protim939@gmail.com",
  site: "https://protimdatta.vercel.app",

  // GitHub stars button in the header
  githubUsername: "protimdatta",
  githubRepo: "3d_portfolio",

  social: {
    github: "https://github.com/protimdatta",
  },
};
```

Other project files that contain portfolio content:

| File | What to change |
|---|---|
| `src/data/projects.tsx` | Your projects, screenshots, descriptions, and tech stacks |
| `src/data/constants.ts` | Skills list (name, description, icon) and work experience |
| `public/assets/` | Your images, OG image, and project screenshots |

---

## ⌨️ Updating the 3D Keyboard Skills

The 3D keyboard keycaps are baked into a Spline file. To update the skills displayed on the keyboard:

1. **Import** the `public/assets/skills-keyboard.spline` file into [Spline](https://spline.design/)
2. **Unhide** the keycap objects you want to edit
3. **Update** the logo images on each keycap to your new skill icons
4. **Rename** each keycap object to match the skill's `name` field in `src/data/constants.ts` (e.g. `js`, `react`, `docker`)
5. **Hide** all keycap objects again
6. **Export** the scene and overwrite `public/assets/skills-keyboard.spline`

After updating the Spline file, make sure `src/data/constants.ts` has matching entries for every skill on the keyboard:

```ts
// Each keycap object name in Spline must match a key in SKILLS
export const SKILLS: Record<SkillNames, Skill> = {
  js: { name: "js", label: "JavaScript", shortDescription: "...", ... },
  react: { name: "react", label: "React", shortDescription: "...", ... },
  // ... add/remove entries to match your keyboard
};
```

The `SkillNames` enum, `SKILLS` record, and the Spline keycap names must all stay in sync for the keyboard interactions to work correctly.

---

## 🔌 Realtime Features (Optional)

The portfolio supports optional realtime features powered by a **separate backend API**:

- 🖱️ **Live cursors** — See other visitors' cursors in realtime
- 👥 **Online presence** — Shows who's currently on the site
- 💬 **Chat** — Live chat between visitors

These features activate automatically when the `NEXT_PUBLIC_WS_URL` environment variable is set. Without it, the portfolio works perfectly fine as a static site — no realtime features, no backend dependency.

> [!NOTE]
> The backend API is **not open source**. This is intentional! Too many people have cloned the portfolio and claimed they built it from scratch. The realtime server stays private to keep the live experience unique make make it standout.


---

## 🚀 Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/protimdatta/3d_portfolio)

This site is deployed on **Vercel**. To deploy your own:

1. Push your code to a GitHub repository
2. Connect the repository to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Vercel handles the rest — automatic deployments on every push

For the contact form, verify the sending domain in Resend and add the DNS records Resend provides at your DNS host. A verified domain is required for `RESEND_FROM_EMAIL`; `onboarding@resend.dev` is only suitable for Resend's limited testing flow.

---

## 🤝 Contributing

If you'd like to contribute or suggest improvements, feel free to open an issue or submit a pull request. All contributions are welcome!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

This customized [3D portfolio project](https://github.com/protimdatta/3d_portfolio) is maintained by Partha Protim Datta and is based on an original open-source portfolio template by Naresh Khatri. Please retain attribution when reusing the original template.

Note on analytics: when enabled, a deployed copy reports its own hostname once per browser (nothing else — no visitor, page, or referrer data). Analytics are optional and can be disabled by leaving the Umami variables empty.
