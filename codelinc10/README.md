# LifeLens Next.js App

LifeLens is a Next.js 15 application that delivers an AI-assisted financial planning experience. It features an enrollment journey, personalized insights, a learning hub, timeline tracking, and an always-on LifeLens support dock.

## Features

- **Multi-screen app router experience** for landing, enrollment, insights dashboard, timeline, learning hub, FAQ, and profile.
- **Persistent local caching** of enrollment responses, insights, saved moments, chat history, and profile metadata with hydration-safe utilities.
- **AI-inspired chat panel** with scripted replies, thinking animation, and context-aware prompts.
- **Framer Motion transitions** across screens with Tailwind 4 styling, pastel theming, and glassmorphism accents.
- **Support dock** and bottom navigation for quick access to primary workflows.
- **Type-safe data models** for forms, insights, chat, and profile snapshots.

## Tech Stack

- Next.js 15 with the App Router and TypeScript
- Tailwind CSS 4 with custom design tokens
- Framer Motion animations
- ESLint & Prettier with import sorting
- Vitest for unit tests

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

   > If installation fails in restricted environments, re-run once you have registry access. The project requires the dev dependencies listed in `package.json`.

2. Create a `.env.local` file (or copy `.env.local.example`) for any API keys.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Useful Scripts

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start the development server               |
| `npm run build`   | Build the production bundle                |
| `npm run start`   | Run the production build                   |
| `npm run lint`    | Run ESLint (Next.js rules)                 |
| `npm run lint:fix`| Lint with automatic fixes                  |
| `npm run typecheck` | Type-check the project with `tsc --noEmit` |
| `npm run format`  | Check Prettier formatting                  |
| `npm run format:write` | Format source files                   |
| `npm run test`    | Execute Vitest unit tests                  |

## Testing

Unit tests cover the insight builder, chat reply logic, and local storage helpers. Run them with:

```bash
npm run test
```

Vitest is configured with stubbed browser APIs so the tests execute in a Node environment.

## Deployment

- Vercel is recommended for zero-config deployments.
- Configure required environment variables in the Vercel dashboard.
- The CI workflow (`.github/workflows/ci.yml`) installs dependencies, runs linting, type-checks, and unit tests on pushes and pull requests.

## Environment Variables

Copy `.env.local.example` to `.env.local` and supply keys for optional integrations such as Supabase or OpenAI.
